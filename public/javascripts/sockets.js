// Setting to hardcoded room initially
var room = 'foo';
var socket = io.connect();
var isChannelReady;
var isInitiator;

//window.onbeforeunload = function(e){
//    sendMessage('bye');
//};

socket.on('created', function (room){
    console.log('Created room ' + room);
    isInitiator = true;
});

socket.on('full', function (room){
    console.log('Room ' + room + ' is full');
});

socket.on('join', function (room){
    console.log('Someone else is joining the room :)');
    isChannelReady = true;
});

socket.on('joined', function (room){
    console.log('Someone just joined :D');
    isChannelReady = true;
});

socket.on('message', function (message){
    console.log('Received message:', message);
    if (message === 'got user media') {
        maybeStart();
    } else if (message.type === 'offer') {
        if (!isInitiator && !isStarted) {
            maybeStart();
        }
        pc.setRemoteDescription(new RTCSessionDescription(message));
        doAnswer();
    } else if (message.type === 'answer' && isStarted) {
        pc.setRemoteDescription(new RTCSessionDescription(message));
    } else if (message.type === 'candidate' && isStarted) {
        var candidate = new RTCIceCandidate({sdpMLineIndex:message.label,
            candidate:message.candidate});
        pc.addIceCandidate(candidate);
    } else if (message === 'bye' && isStarted) {
        handleRemoteHangup();
    }
});