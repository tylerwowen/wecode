define(function(require) {
    var $ = require('jquery'),
        EditorController = require('app/controller/editorcontroller'),
        UserController = require('app/controller/userscontroller'),
        UserManager = require('app/model/usermanager');

    require(['draggableObjects', 'bootstrap']);

    var editorController = new EditorController(),
        userController = new UserController();

    userController.init(onEventuallySuccess);

    function onEventuallySuccess() {
        requirejs(['webrtc', 'widgets']);
        editorController.init();
    }

});