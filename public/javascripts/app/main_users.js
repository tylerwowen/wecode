define(function(require) {
    var $ = require('jquery'),
        Controller = require('app/controller/userscontroller');
        //Jquery  = require('//code.jquery.com/jquery.min'),
        //Bootstrap = require('//netdna.bootstrapcdn.com/twitter-bootstrap/2.3.2/js/bootstrap.min');


    require(['login.jquery', 'login.bootstrap']);
    var controller = new Controller();
    controller.init();
});