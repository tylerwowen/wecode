define(function(require) {
    var QuestionController = require('app/controller/questioncontroller');
    var UserController = require('app/controller/userscontroller');
    var userController = new UserController();
    var questionController = new QuestionController();

    userController.init(onEventuallySuccess);

    function onEventuallySuccess() {
        questionController.init();
    }
});