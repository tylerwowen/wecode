define(function(require) {
    var RealtimeUtils = require('lib/realtimeutils');
    var $ = require('jquery');
    require('lib/adapter');
    require('socketio');

    var localVideo = $('#localVideo')[0];
    var remoteVideo = $('#remoteVideo')[0];

    var sendChannel;
    var isChannelReady;
    var isInitiator;
    var isStarted;
    var localStream;
    var pc;
    var remoteStream;
    var room;

    // Give pc_config stun and turn servers to use for RTCPeerConnection
    var pc_config = null;
    $(document).ready(function () {
        $.get("https://service.xirsys.com/ice",
            {
                ident: "davidacevedo",
                secret: "67d61872-8511-11e5-987b-837e64a51c56",
                domain: "www.turnserver.com",
                application: "default",
                room: "default",
                secure: 0
            },
            function (data, status) {
                pc_config = data.d;
            });
    });

    var pc_constraints = {
        'optional': [
            {'DtlsSrtpKeyAgreement': true},
            {'RtpDataChannels': true}
        ]
    };

    // Set up audio and video regardless of what devices are present.
    var sdpConstraints = {
        'mandatory': {
            'OfferToReceiveAudio': true,
            'OfferToReceiveVideo': true
        }
    };

    // Handle on browser close
    window.onbeforeunload = function (e) {
        sendMessage('bye');
    };

    ////////////////////////////////////////////////////////////////////////////////////
    /////////////////////Setting up socket connections/////////////////////
    ////////////////////////////////////////////////////////////////////////////////////
    if (webrtcDetectedBrowser === 'chrome' || webrtcDetectedBrowser === 'firefox') {
        var socket = io.connect();
        var realtimeUtils = new RealtimeUtils();
        room = realtimeUtils.getParam('workspace');
        if(!room){
            room = 'foo';
        }
        console.debug(room);
        socket.emit('create or join', room);

        /**
         * If current user created the room, then he is declared isInitiator
         */
        socket.on('created', function (room) {
            console.debug('Created room: ' + room);
            isInitiator = true;
        });

        /**
         * Display log message if room is full
         */
        socket.on('full', function (room) {
            console.debug('Room ' + room + ' is full');
        });

        /**
         * Second user is ready to call other users
         */
        socket.on('join', function (room) {
            console.debug('Another user is join your room');
            isChannelReady = true;
        });

        socket.on('joined', function (room) {
            console.debug('I have joined room ' + room);
            isChannelReady = true;
        });

        /**
         * Sends message to the server to send to the other clients
         * @param message - message to be sent to clients
         */
        function sendMessage(message) {
            socket.emit('message', message, room);
        }

        /**
         * This function receives a message broadcast from the server to perform either of the following actions
         * 1. If it receives get user media then it does
         * 2. If it receives a offer then it will perform an offer to the other client, also sets the remote sdp
         * 3. If it receives a answer then the client will respond an offer with an answer sdp, also sets the remote sdp
         * 4. If it receives a candidate then it will send a candidate to the other client
         */
        socket.on('message', function (message) {
            if (message === 'got user media') {
                console.debug('got user media from message');
                maybeStartPeerConnection();
            } else if (message.type === 'offer') { //Handle when a user sends an offer
                console.debug('Received an offer from a peer, setting sdp as the remote');
                if (!isInitiator && !isStarted) {
                    maybeStartPeerConnection();
                }
                console.log(pc);
                pc.setRemoteDescription(new RTCSessionDescription(message));
                doAnswer();
            } else if (message.type === 'answer' && isStarted) {
                console.debug('Received an answer from a peer, setting sdp as the remote');
                pc.setRemoteDescription(new RTCSessionDescription(message));
            } else if (message.type === 'candidate' && isStarted) {
                console.debug('Received a remote candidate from a peer, adding the ice candidate to the peer connection');
                var candidate = new RTCIceCandidate({sdpMLineIndex: message.label, candidate: message.candidate});
                pc.addIceCandidate(candidate);
            } else if (message === 'bye' && isStarted) {
                handleRemoteHangup();
            } else if (message === 'room')
                console.log('room');
        });

        /////////////////////////////////////////////////////////////////////////////////////////////////////////
        /////////////////////Setting up user media on a client//////////////////////////////////////////
        /////////////////////////////////////////////////////////////////////////////////////////////////////////
        var constraints = {video: true, audio: true};

        /**
         * Success callback for getUserMedia: If successful, stream video on the browser
         */
        function successCallback(stream) {
            localStream = stream;
            attachMediaStream(localVideo, stream);
            sendMessage('got user media');
            if (isInitiator) {
                maybeStartPeerConnection();
            }
        }

        /**
         * Error handler for getUserMedia for when things go wrong
         */
        function errorCallback(error) {
            console.log("getUserMedia error: ", error);
        }

        getUserMedia(constraints, successCallback, errorCallback);

        /**
         * If there are two clients on the same room then we should start
         * an RTC peer connection and initiate a call
         */
        function maybeStartPeerConnection() {
            if (!isStarted && localStream && isChannelReady) {
                createPeerConnection();
                pc.addStream(localStream);
                isStarted = true;
                if (isInitiator) {
                    doCall();
                }
            }
        }

        /**
         * Setup a peer connection
         */
        function createPeerConnection() {
            try {
                console.debug('Create peer connection');
                pc = new RTCPeerConnection(pc_config, pc_constraints);
                pc.onicecandidate = handleIceCandidate;
            } catch (e) {
                console.debug('Failed to create a peer connection');
                alert("Couldn't create a peer connection");
                return;
            }
            pc.onaddstream = handleRemoteStreamAdded;
            pc.onremovestream = handleRemoteStreamRemoved;
        }

        /**
         * Grab the local ice candidate and send it over to the client
         * that you would like to create a connection with
         */
        function handleIceCandidate(event) {
            console.debug('Handling ice candidate');
            if (event.candidate) {
                sendMessage({
                    type: 'candidate',
                    label: event.candidate.sdpMLineIndex,
                    id: event.candidate.sdpMid,
                    candidate: event.candidate.candidate
                });
            } else {
                console.log('End of candidates');
            }
        }

        /**
         * Perform a call, so start the offer to the other peer from here
         */
        function doCall() {
            var constraints = {'optional': [], 'mandatory': {'MozDontOfferDataChannel': true}};
            // Removing Moz constraints in Chrome
            if (webrtcDetectedBrowser === 'chrome') {
                for (var prop in constraints.mandatory) {
                    if (prop.indexOf('Moz') !== -1) {
                        delete constraints.mandatory[prop];
                    }
                }
            }
            constraints = mergeConstraints(constraints, sdpConstraints);
            console.debug('Sending offer to peer');
            pc.createOffer(setLocalAndSendMessage, null, constraints);
        }

        /**
         * Perform an answer, so we want to set the local sdp and send this sdp
         * to the remote peer
         */
        function doAnswer() {
            console.debug('Sending answer to peer');
            pc.createAnswer(setLocalAndSendMessage, null, sdpConstraints);
        }

        /**
         * Merge cons1 and cons2 together
         * @param cons1 - the first set of constraints that's going to be merged with cons2
         * @param cons2 - the second set of constraints that's going to be merged with cons1
         * @returns {}
         */
        function mergeConstraints(cons1, cons2) {
            var merged = cons1;
            for (var name in cons2.mandatory) {
                merged.mandatory[name] = cons2.mandatory[name];
            }
            merged.optional.concat(cons2.optional);
            return merged;
        }

        /**
         *  Setting local sdp and sending the sdp over to the remote
         *  peer
         */
        function setLocalAndSendMessage(sessionDescription) {
            console.debug('Set Local and send message');
            sessionDescription.sdp = preferOpus(sessionDescription.sdp);
            pc.setLocalDescription(sessionDescription);
            sendMessage(sessionDescription);
        }

        function handleRemoteStreamAdded(event) {
            console.log('Remote stream added');

            attachMediaStream(remoteVideo, event.stream);
            remoteStream = event.stream;
        }

        function handleRemoteStreamRemoved(event) {
            console.log('Remote stream ')
        }

        function handleRemoteHangup() {
            console.log('Session terminated');
            stop();
            isInitiator = false;
            remoteVideo.src = '';
            remoteStream = null;
            sendChannel = false;
            isChannelReady = false;
            isInitiator = true;
            isStarted = false;
            pc = null;
        }

        function stop() {
            isStarted = false;
            pc.close();
            pc = null;
        }


        /**
         * Using helper functions from stack overflow to set the default
         * codec from here on down
         */
        function preferOpus(sdp) {
            var sdpLines = sdp.split('\r\n');
            var mLineIndex;

            for (var i = 0; i < sdpLines.length; i++) {
                if (sdpLines[i].search('m=audio') !== -1) {
                    mLineIndex = i;
                    break;
                }
            }

            if (mLineIndex === null) {
                return sdp;
            }

            for (i = 0; i < sdpLines.length; i++) {
                if (sdpLines[i].search('opus/48000') !== -1) {
                    var opusPayLoad = extractSdp(sdpLines[i], /:(\d+) opus\/48000/i);
                    if (opusPayLoad) {
                        sdpLines[mLineIndex] = setDefaultCodec(sdpLines[mLineIndex], opusPayLoad);
                    }
                    break;
                }
            }

            sdpLines = removeCN(sdpLines, mLineIndex);

            sdp = sdpLines.join('\r\n');
            return sdp;
        }

        function extractSdp(sdpLine, pattern) {
            var result = sdpLine.match(pattern);
            return result && result.length === 2 ? result[1] : null;
        }

        function setDefaultCodec(mLine, payload) {
            var elements = mLine.split(' ');
            var newLine = [];
            var index = 0;
            for (var i = 0; i < elements.length; i++) {
                if (index === 3) {
                    newLine[index++] = payload;
                }
                if (elements[i] !== payload) {
                    newLine[index++] = elements[i];
                }
            }
            return newLine.join(' ');
        }

        function removeCN(sdpLines, mLineIndex) {
            var mLineElements = sdpLines[mLineIndex].split(' ');

            for (var i = sdpLines.length - 1; i >= 0; i--) {
                var payload = extractSdp(sdpLines[i], /a=rtpmap:(\d+) CN\/\d+/i);
                if (payload) {
                    var cnPos = mLineElements.indexOf(payload);
                    if (cnPos !== -1) {
                        mLineElements.splice(cnPos, 1);
                    }
                    sdpLines.splice(i, 1);
                }
            }

            sdpLines[mLineIndex] = mLineElements.join(' ');
            return sdpLines;
        }
    }
    else {
        prompt('browser not supported');
    }
});