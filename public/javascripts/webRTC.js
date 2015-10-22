var constraints = {video: true, audio: true};

function successCallback(stream) {
    window.stream = stream; // stream available to console
    var video = document.querySelector("video");
    video.src = window.URL.createObjectURL(stream);
    video.play();
}

function errorCallback(error){
    console.log("getUserMedia error: ", error);
}

getUserMedia(constraints, successCallback, errorCallback);