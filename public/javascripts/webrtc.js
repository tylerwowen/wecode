var localStream, localPeerConnection, remotePeerConnection;

var localVideo = document.getElementById("localVideo");
var remoteVideo = document.getElementById("remoteVideo");

var startButton = document.getElementById("startButton");
var callButton = document.getElementById("callButton");
var hangupButton = document.getElementById("hangupButton");

//Initialize html elements
startButton.disabled = false;
callButton.disabled = true;
hangupButton.disabled = true;

//Button click event handlers
//startButton.onclick = start;
//callButton.onclick = call;
//hangupButton.onclick = hangup;

var sendChannel;
var isChannelReady;
var isInitiator;
var isStarted;
var localStream;
var pc;
var remoteStream;

// Give pc_config stun and turn servers to use for RTCPeerConnection
var pc_config = webrtcDetectedBrowser === 'firefox' ?
{'iceServers':[{'url':'stun:23.21.150.121'}]} : // number IP
{'iceServers': [{'url': 'stun:stun.l.google.com:19302'}]};

var pc_constraints = {
    'optional': [
        {'DtlsSrtpKeyAgreement': true},
        {'RtpDataChannels': true}
    ]};

// Set up audio and video regardless of what devices are present.
var sdpConstraints = {'mandatory': {
    'OfferToReceiveAudio':true,
    'OfferToReceiveVideo':true }};

////////////////////////////////////////////////////////////////////////////////////
/////////////////////Setting up socket connections/////////////////////
////////////////////////////////////////////////////////////////////////////////////
var socket = io.connect();
var room = 'foo';
socket.emit('create or join', room);

/**
 * If current user created the room, then he is declared isInitiator
 */
socket.on('created', function(room) {
    isInitiator = true;
});

/**
 * Display log message if room is full
 */
socket.on('full', function(room) {
     console.log(room + " is full, sorry :'(");
});

/**
 * Second user is ready to call other users
 */
socket.on('join', function(room) {
    console.log('Joining room with other clients');
    isChannelReady = true;
});

socket.on('joined', function(room) {
    console.log('Peer joined room');
    isChannelReady = true;
});

/**
 * Sends message to the server to send to the other clients
 * @param message - message to be sent to clients
 */
function sendMessage(message) {
    //console.log('Sending message ', message);
    socket.emit('message', message);
}

/**
 * This function receives a message broadcast from the server to perform either of the following actions
 * 1. If it receives get user media then it does
 * 2. If it receives a offer then it will perform an offer to the other client
 * 3. If it receives a answer then the client will respond an offer with an answer sdp
 * 4. If it receives a candidate then it will send a candidate to the other client
 */
socket.on('message', function(message) {
    console.log('Received message: ', message);
    if(message === 'got user media') {
        console.log('got user media from message');
        maybeStart();
    } else if(message.type === 'offer'){ //Handle when a user sends an offer
        console.log('offering from message');
        if(!isInitiator && !isStarted) {
            maybeStart();
        }
        console.log(pc);
        pc.setRemoteDescription(new RTCSessionDescription(message));
        doAnswer();
    } else if(message.type === 'answer' && isStarted) {
        console.log('answering from message');
        pc.setRemoteDescription(new RTCSessionDescription(message));
    } else if (message.type === 'candidate' && isStarted) {
        console.log('candidate info from message');
        var candidate = new RTCIceCandidate({sdpMLineIndex:message.label, candidate:message.candidate});
        pc.addIceCandidate(candidate);
    } else if(message === 'bye' && isStarted) {
        handleRemoteHangup();
    }
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
    if(isInitiator){
        maybeStart();
    }
}

/**
 * Error handler for getUserMedia for when things go wrong
 */
function errorCallback(error){
    console.log("getUserMedia error: ", error);
}

getUserMedia(constraints, successCallback, errorCallback);

function maybeStart() {
    if(!isStarted && localStream && isChannelReady) {
        createPeerConnection();
        pc.addStream(localStream);
        isStarted = true;
        if(isInitiator) {
            doCall();
        }
    }
}

function createPeerConnection() {
    try {
        console.log('Create peer connectoin')
        pc = new RTCPeerConnection(pc_config, pc_constraints);
        pc.onicecandidate = handleIceCandidate;
        console.log('Created peer connection');
    } catch(e) {
        console.log('Failed to create a peer connection');
        alert("Couldn't create a peer connection");
        return;
    }
    pc.onaddstream = handleRemoteStreamAdded;
    pc.onremovestream = handleRemoteStreamRemoved;
}

function handleIceCandidate(event) {
    console.log('Handling ice candidate');
    if(event.candidate) {
        sendMessage({
            type: 'candidate',
            label: event.candidate.sdpMLineIndex,
            id: event.candidate.sdpMid,
            candidate: event.candidate.candidate});
    } else {
        console.log('End of candidates');
    }
}

function doCall() {
    var constraints = {'optional': [], 'mandatory': {'MozDontOfferDataChannel': true}};
    // Removing Moz constraints in Chrome
    if(webrtcDetectedBrowser === 'chrome'){
        for (var prop in constraints.mandatory){
            if(prop.indexOf('Moz') !== -1){
                delete constraints.mandatory[prop];
            }
        }
    }
    constraints = mergeConstraints(constraints, sdpConstraints);
    console.log('Sending offer to peer, with constraints');
    pc.createOffer(setLocalAndSendMessage, null, sdpConstraints);
}

function doAnswer(){
    console.log('Sending answer to peer');
    //pc.
    console.log(pc);
    pc.createAnswer(setLocalAndSendMessage, null, sdpConstraints); // not really sure what sdpConstraints is
}

function mergeConstraints(cons1, cons2){
    var merged = cons1;
    for (var name in cons2.mandatory){
        merged.mandatory[name] = cons2.mandatory[name];
    }
    merged.optional.concat(cons2.optional);
    return merged;
}

function setLocalAndSendMessage(sessionDescription){
    console.log('Set Local and send message');
    sessionDescription.sdp = preferOpus(sessionDescription.sdp);
    pc.setLocalDescription(sessionDescription);
    sendMessage(sessionDescription);
}

function handleRemoteStreamAdded(event){
    console.log('Remote stream added');

    attachMediaStream(remoteVideo, event.stream);
    remoteStream = event.stream;
}

function handleRemoteStreamRemoved(event){
    console.log('Remote stream ')
}

//function hangup(){
//    console.log('Hanging up');
//    stop();
//    sendMessage('bye')
//}

function handleRemoteHangup(){
    console.log('Session terminated');
    stop();
    isInitiator = false;
}

function stop(){
    isStarted = false;
    pc.close();
    pc = null;
}

function preferOpus(sdp){
    var sdpLines = sdp.split('\r\n');
    var mLineIndex;

    for(var i = 0; i < sdpLines.length; i++){
        if(sdpLines[i].search('m=audio') !== -1){
            mLineIndex = i;
            break;
        }
    }

    if(mLineIndex === null){
        return sdp;
    }
    //console.log(sdpLines);
    for(i = 0; i < sdpLines.length; i++){
        if(sdpLines[i].search('opus/48000') !== -1){
            var opusPayLoad = extractSdp(sdpLines[i], /:(\d+) opus\/48000/i);
            if (opusPayLoad){
                //console.log('MlineIndex');
                //console.log(mLineIndex);
                //console.log(sdpLines[mLineIndex]);
                sdpLines[mLineIndex] = setDefaultCodec(sdpLines[mLineIndex], opusPayLoad);
            }
            break;
        }
    }

    sdpLines = removeCN(sdpLines, mLineIndex);

    sdp = sdpLines.join('\r\n');
    return sdp;
}

function extractSdp(sdpLine, pattern){
    var result = sdpLine.match(pattern);
    return result && result.length === 2 ? result[1] : null;
}

function setDefaultCodec(mLine, payload){
    //console.log(mLine);
    //console.log(typeof(mLine));
    var elements = mLine.split(' ');
    var newLine = [];
    var index = 0;
    for(var i = 0; i < elements.length; i++){
        if(index === 3){
            newLine[index++] = payload;
        }
        if(elements[i] !== payload){
            newLine[index++] = elements[i];
        }
    }
    return newLine.join(' ');
}

function removeCN(sdpLines, mLineIndex){
    var mLineElements = sdpLines[mLineIndex].split(' ');

    for(var i = sdpLines.length-1; i >= 0; i--){
        var payload = extractSdp(sdpLines[i], /a=rtpmap:(\d+) CN\/\d+/i);
        if(payload) {
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
























///**
// * Start streaming own video
// */
//function start() {
//    console.log('Getting user media');
//    startButton.disabled = true;
//    getUserMedia(constraints, successCallback, errorCallback);
//}
//
//function call() {
//    callButton.disabled = true;
//    hangupButton.disabled = false;
//
//    var servers = null;
//
//    //Set up the local peer connection
//    localPeerConnection = new RTCPeerConnection(servers);
//    localPeerConnection.onicecandidate = gotLocalIceCandidate;
//
//    //Set up remote Peer Connection
//    remotePeerConnection = new RTCPeerConnection(servers);
//    remotePeerConnection.onicecandidate = gotRemoteIceCandidate;
//    remotePeerConnection.onaddstream = gotRemoteStream;
//
//    localPeerConnection.addStream(localStream);
//    localPeerConnection.createOffer(gotLocalDescription, handleError);
//}
//
//function gotLocalDescription(description){
//    localPeerConnection.setLocalDescription(description); // step 1 set the localDescription to to the local peer connection
//    sendSignal
//
//    remotePeerConnection.setRemoteDescription(description); // ----> step 2 grap
//    remotePeerConnection.createAnswer(gotRemoteDescription,handleError);
//}
//
//function gotRemoteDescription(description){
//    remotePeerConnection.setLocalDescription(description);
//
//    localPeerConnection.setRemoteDescription(description);
//}
//
//function hangup() {
//    localPeerConnection.close();
//    remotePeerConnection.close();
//    localPeerConnection = null;
//    remotePeerConnection = null;
//    hangupButton.disabled = true;
//    callButton.disabled = false;
//}
//
//function gotRemoteStream(event){
//    remoteVideo.src = URL.createObjectURL(event.stream);
//}
//
//function gotLocalIceCandidate(event){
//    if (event.candidate) {
//        remotePeerConnection.addIceCandidate(new RTCIceCandidate(event.candidate));
//    }
//}
//
//function gotRemoteIceCandidate(event){
//    if (event.candidate) {
//        localPeerConnection.addIceCandidate(new RTCIceCandidate(event.candidate));
//    }
//}
//
//function handleError(){}