define(function(require) {
    var EditorController = require('app/controller/editorcontroller'),
        UserController = require('app/controller/userscontroller'),
        TerminalController = require('app/controller/terminalcontroller');

    require(['bootstrap']);

    var editorController = new EditorController(),
        userController = new UserController(),
        terminalController = new TerminalController();

    userController.init(onEventuallySuccess);

    function onEventuallySuccess() {
        requirejs(['app/webrtc', 'app/widgets','app/controller/draggableObjects']);
        editorController.init();
    }

});