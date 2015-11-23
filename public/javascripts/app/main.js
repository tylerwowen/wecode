define(function(require) {
    var $ = require('jquery'),
        EditorController = require('app/controller/editorcontroller');
    //var rtc = require('webrtc');
    requirejs(['webrtc','draggableObjects', 'searchwindow', 'bootstrap']);
    var editorController = new EditorController();

});