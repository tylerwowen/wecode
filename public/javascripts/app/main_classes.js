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

    $('#studentSelector').on('click', function(){
            $('li').removeClass('selected');
            $(this).addClass('selected');
            $('#student').show();
            $('#instructor').hide();
    });

    $('#TAselector').on('click', function(){
        $('li').removeClass('selected');
        $(this).addClass('selected');
        $('#student').hide();
        $('#instructor').show();
    });
});