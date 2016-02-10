/**
 * The start for the classes page
 */
define(function(require) {
    var ClassController = require('app/controller/classcontroller');
    var UserController = require('app/controller/userscontroller');
    var userController = new UserController();

    userController.init(onEventuallySuccess);

    function onEventuallySuccess() {
        var classController = new ClassController();
        classController.init();
    }

    $('#studentSelector').addClass('selected');
    $('#TAselector').addClass('inactive');

    $('#studentSelector').on('click', function(){
        $('li').addClass('inactive');
        $('li').removeClass('selected');
        $(this).addClass('selected');
        $(this).removeClass('inactive');
        $('#student').show();
        $('#instructor').hide();
    });

    $('#TAselector').on('click', function(){
        $('li').addClass('inactive');
        $('li').removeClass('selected');
        $(this).addClass('selected');
        $(this).removeClass('inactive');
        $('#student').hide();
        $('#instructor').show();
    });

});