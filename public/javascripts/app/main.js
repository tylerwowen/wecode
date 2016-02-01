define(function(require) {
    var $ = require('jquery'),
        EditorController = require('app/controller/editorcontroller'),
        UserController = require('app/controller/userscontroller');

    require(['bootstrap']);

    var editorController = new EditorController(),
        userController = new UserController();

    userController.init(onEventuallySuccess);

    function onEventuallySuccess() {
        requirejs(['app/webrtc', 'app/widgets','draggableObjects']);
        editorController.init();
    }

});