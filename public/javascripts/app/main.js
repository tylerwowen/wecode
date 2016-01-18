define(function(require) {
    var $ = require('jquery'),
        EditorController = require('app/controller/editorcontroller'),
        UserController = require('app/controller/userscontroller'),
        UserManager = require('app/model/usermanager');

    require(['draggableObjects', 'bootstrap']);
    var editorController = new EditorController(),
        userController = new UserController();

    //if (userController.userManager.isLoggedIn()) {
    //    init();
    //}
    //else {
    //    userController.loginRequest(init);
    //}
    init();
    function init() {
        requirejs(['webrtc', 'widgets']);
        userController.init();
        editorController.init();
    }
});