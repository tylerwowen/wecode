define(function(require) {
    var EditorController = require('app/controller/editorcontroller'),
        UserController = require('app/controller/userscontroller'),
        TerminalController = require('app/controller/terminalcontroller');

    require(['bootstrap']);

    var editorController = new EditorController(),
        userController = new UserController(),
        terminalController = new TerminalController(editorController);

    userController.init(onEventuallySuccess);

    function onEventuallySuccess() {
        requirejs(['app/controller/draggableObjects']);
        editorController.init();
        userController.userManager.onProfileReady(function(){
            requirejs(['app/webrtc', 'app/widgets']);
        });
    }
});