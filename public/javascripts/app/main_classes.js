/**
 * The start for the classes page
 */
define(function(require) {
    var Classes = require('app/controller/classcontroller');
    var UserController = require('app/controller/userscontroller');
    var userController = new UserController();

    userController.init(onEventuallySuccess);

    function onEventuallySuccess() {
        var classes = new Classes();
        classes.init();
    }
});