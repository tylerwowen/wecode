define(function(require) {
    var RealtimeUtils = require('lib/realtimeutils');
    var $ = require('jquery');
    require('lib/adapter');
    require('socketio');

    var videoList = document.getElementById('vidwrapper');
    var localStream;
    var pcs = new Map();
    var room;
    var myId;

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

    // WebRtc constraints
    var constraints = {
        video: true, 
        audio: true
    };

    /**
     * Success callback for getUserMedia: If successful, stream video on the browser
     */
    function successCallback(stream) {
        // Create a video element for the DOM
        myId = socket.socket.sessionid;
        var myVideo = document.createElement('video');
        myVideo.autoplay = true;
        myVideo.muted = true;
        myVideo.id = myId;
        // Get the vidlist to append on to it
        var videoList = document.getElementById('vidwrapper');
        videoList.appendChild(myVideo);
        localStream = stream;
        attachMediaStream(myVideo, stream);
        // Save my session Id for identification
        
        socket.emit('gotUserMedia', true);
    }

    /**
     * Error handler for getUserMedia for when things go wrong
     */
    function errorCallback(error) {
        console.log("getUserMedia error: ", error);
    }

    // Handle on browser close
    window.onbeforeunload = function (e) {
        sendMessage('bye');
    };

    // Start the WebRTC-ness when you detect the correct browser
    if (webrtcDetectedBrowser === 'chrome' || webrtcDetectedBrowser === 'firefox') {
        var socket = io.connect();
        var realtimeUtils = new RealtimeUtils();
        var joined = false;
        room = realtimeUtils.getParam('workspace');
        if(!room){
            room = 'theUltimatePlayground';
        }

        socket.emit('create or join', room);

        $('#microphone').click(function() {
            $(this).find('i').toggleClass('fa-microphone fa-microphone-slash');
            localStream.getAudioTracks()[0].enabled =
                !(localStream.getAudioTracks()[0].enabled);

        });

        $('#videoButton').click(function() {
            localStream.getVideoTracks()[0].enabled =
                !(localStream.getVideoTracks()[0].enabled);
        });

        /**
         * Display log message if room is full
         */
        socket.on('full', function (room) {
            console.debug('Room ' + room + ' is full');
        });

        $('form').submit(function(){
            socket.emit('print username', myId, room);
            socket.emit('chat message', $('#m').val(), room);
            $('#m').val('');
        });

        socket.on('print username', function(data){
            $('#messages').append($('<li>').text(data + " says: "));
        });

        socket.on('chat message', function(message){
            $('#messages').append($('<li>').text(message));
        });

        socket.on('joined', function (IdArray) {
            var promise = new Promise(function(resolve, reject) {
                getUserMedia(constraints, successCallback, errorCallback);
                socket.on('gotUserMedia', function(message) {
                    resolve(message);
                })
            }).then(function(result) {
                for(var i = 0; i < IdArray.length; i++) {
                    var remoteId = IdArray[i];
                    if(myId === remoteId){

                    }
                    else{
                        createPeerConnection(remoteId);
                        doCall(remoteId);
                    }
                }
            })
        });

        /**
         * This function receives a message broadcast from the server to perform either of the following actions
         * 1. If it receives get user media then it does
         * 2. If it receives a offer then it will perform an offer to the other client, also sets the remote sdp
         * 3. If it receives a answer then the client will respond an offer with an answer sdp, also sets the remote sdp
         * 4. If it receives a candidate then it will send a candidate to the other client
         */
        socket.on('message', function (message, remoteId) {
            if (message.type === 'offer') { //Handle when a user sends an offer
                console.debug('Received an offer from a peer, setting sdp as the remote');
                createPeerConnection(remoteId);
                $('#messages').append($('<li>').text(remoteId + " has joined the room."));
                $('#messages').append($('<li>').text(""));
                pcs[remoteId].setRemoteDescription(new RTCSessionDescription(message));
                doAnswer(remoteId);
            } else if (message.type === 'answer') {
                console.debug('Received an answer from a peer, setting sdp as the remote');
                pcs[remoteId].setRemoteDescription(new RTCSessionDescription(message));
            } else if (message.type === 'candidate') {
                console.debug('Received a remote candidate from a peer, adding the ice candidate to the peer connection');
                var candidate = new RTCIceCandidate({sdpMLineIndex: message.label, candidate: message.candidate});
                pcs[remoteId].addIceCandidate(candidate);
            } else if (message === 'bye') {
                handleRemoteHangup(remoteId);
                $('#messages').append($('<li>').text(remoteId + " has left the room."));
                $('#messages').append($('<li>').text(""));

            } else if (message === 'room')
                console.log('room');
        });
        

        /**
         * Sends message to the server to send to the other clients
         * @param message - message to be sent to clients
         */
        function sendMessage(message, remoteId) {
            var size = arguments.length;
            if(size === 1)
                socket.emit('message', message, room);
            else if(size === 2)
                socket.emit('message', message, room, remoteId);
        }

        /**
         * Setup a peer connection
         */
        function createPeerConnection(remoteId) {
            try {
                console.debug('Create peer connection');
                var pc = new RTCPeerConnection(pc_config, pc_constraints);
                pc.onicecandidate = handleIceCandidate;
            } catch (e) {
                console.debug('Failed to create a peer connection');
                alert("Couldn't create a peer connection");
                return;
            }
            pc.onaddstream = handleRemoteStreamAdded;
            pc.onremovestream = handleRemoteStreamRemoved;
            pc.addStream(localStream);
            pc.remoteConnectionId = remoteId;
            pc.localConnectionId = myId;
            pcs[remoteId] = pc;
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
                }, event.srcElement.remoteConnectionId);
            } else {
                console.log('End of candidates');
            }
        }

        /**
         * Perform a call, so start the offer to the other peer from here
         */
        function doCall(remoteId) {
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
            function setLocalAndSendMessage(sessionDescription) {
                console.debug('Set Local and send message');
                sessionDescription.sdp = preferOpus(sessionDescription.sdp);
                pcs[remoteId].setLocalDescription(sessionDescription);
                sendMessage(sessionDescription, remoteId);
            }
            pcs[remoteId].createOffer(setLocalAndSendMessage, null, constraints);
        }

        /**
         * Perform an answer, so we want to set the local sdp and send this sdp
         * to the remote peer
         */
        function doAnswer(remoteId) {
            console.debug('Sending answer to peer');
            function setLocalAndSendMessage(sessionDescription) {
                console.debug('Set Local and send message');
                sessionDescription.sdp = preferOpus(sessionDescription.sdp);
                pcs[remoteId].setLocalDescription(sessionDescription);
                sendMessage(sessionDescription, remoteId);
            }
            pcs[remoteId].createAnswer(setLocalAndSendMessage, null, sdpConstraints);
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

        function handleRemoteStreamAdded(event) {
            var myVideo = document.createElement('video');
            myVideo.autoplay = true; 
            myVideo.muted = false;
            myVideo.id = event.srcElement.remoteConnectionId;
            // Get the vidlist to append on to it
            var videoList = document.getElementById('vidwrapper');
            videoList.appendChild(myVideo);
            attachMediaStream(myVideo, event.stream);
            console.log('Remote stream added');

        }

        function handleRemoteStreamRemoved(event) {
            console.log('Remote stream ')
        }

        function handleRemoteHangup(remoteId) {
            var remoteVideo = document.getElementById(remoteId);
            pcs[remoteId].close();
            pcs.delete(remoteId);
            console.log('Session terminated');
            remoteVideo.src = '';
            videoList.removeChild(remoteVideo);  
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