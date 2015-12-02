define(function(require) {
    var $ = require('jquery'),
        EditorController = require('app/controller/editorcontroller'),
        UserController = require('app/controller/userscontroller'),
        UserManager = require('app/model/usermanager');

    require(['draggableObjects', 'searchwindow', 'bootstrap']);
    var editorController = new EditorController(),
        userController = new UserController();

    function init() {
        requirejs(['webrtc']);
        editorController.init();
    }
    if (UserManager.isLoggedIn()) {
        init();
    }
    else {
        userController.loginRequest(init);
    }
});