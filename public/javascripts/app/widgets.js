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
        if (!$(this).hasClass('selected')) {
            $('#termwrapper').show();
        }
    });

    $(".non-psersistent").click(function() {
        var presenting = $('.non-psersistent.selected');
        if (presenting.hasClass('terminal')) {
            $('#termwrapper').hide();
        }
        else {
            $(presenting.attr('associated')).animate({
                right: "4%",
                width: "toggle"
            }, 250);
        }
        presenting.removeClass('selected');

        if (presenting && presenting[0] != $(this)[0]) {
            $($(this).attr('associated')).animate({
                right: "4%",
                width: "toggle"
            }, 250);
            $(this).addClass('selected');
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