/**
 * Constraints define what user media the browser will use
 */
var constraints = {video: true, audio: true};

/**
 * Success callback for getUserMedia: If succesful, stream video on the browser
 */
function successCallback(stream) {
    window.stream = stream; // stream available to console
    var video = document.querySelector("video");
    video.src = window.URL.createObjectURL(stream);
    video.play();
}

/**
 * Error handler for when things go wrong
 */
function errorCallback(error){
    console.log("getUserMedia error: ", error);
}

getUserMedia(constraints, successCallback, errorCallback);