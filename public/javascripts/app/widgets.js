define(function(require) {

    var angular = require('angular'),
        $ = require('jquery'),
        io = require('socketio'),
        queue = new require('app/controller/questioncontroller')();

    angular.element(document).ready(function () {
        var app = angular.module("app", []);
        app.controller("selected", function ($scope) {
            $scope.show = false;
        });
        angular.bootstrap(document, ["app"]);
    });

    $('#openTerminal').click(function () {
        if ($(this).hasClass('selected')) {
            //$(this).removeClass('selected');
            //$('#termwrapper').hide();
            //        //$('#editor').css('width', '100%').trigger('resize');
        }
        else {
            //        $(this).addClass('selected');
            //$('#termwrapper').show();
            $('#termwrapper').animate({
                right: "0%",
                width: "toggle"
            }, 250);
            //        //$('#editor').css('width', '55%').trigger('resize');
        }
    });

    $(".non-psersistent").click(function() {
        var presenting = $('.non-psersistent.selected');
        if (presenting.hasClass('terminal')) {
            $('#termwrapper').animate({
                right: "0%",
                width: "toggle"
            }, 250);
            //$('#termwrapper').hide();
        }
        else {
            $(presenting.attr('associated')).animate({
                right: "4%",
                width: "toggle"
            }, 250);
        }
        presenting.removeClass('selected');
        console.log("Removed");

        if (presenting && presenting[0] != $(this)[0]) {
            console.log("Click");
            if ($(this).hasClass('terminal')) {
                //$('#termwrapper').show();
                $(this).addClass('selected');
            }
            else {
                $($(this).attr('associated')).animate({
                    right: "4%",
                    width: "toggle"
                }, 250);
                $(this).addClass('selected');
                console.log("Add non-terminal class");
            }
        }
    });


    function showWorkSpaceList() {
        queue.displayQuestionList();
    }
    showWorkSpaceList();


    $('#inviteEmail').on('click', function() {
        window.location.href="mailto:?subject=Join%20me%20at%20WeCode!"+document.title+"&body="+escape(window.location.href);
    });

});