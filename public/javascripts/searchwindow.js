define(function(require) {

    var angular = require('angular'),
        $ = require('jquery');

    angular.element(document).ready(function () {
        var app = angular.module("app", []);
        app.controller("test", function ($scope) {
            $scope.show = false;
        });
        angular.bootstrap(document, ["app"]);
    });

    $("#framewrapper").animate({
        right: "4%",
        width: "toggle"
    }, 1000, function () {
    });

    $("#search").click(function () {
        $("#framewrapper").animate({
            right: "4%",
            width: "toggle"
        }, 1000, function () {
        });
    });

    $("#workwrapper").animate({
        right: "4%",
        width: "toggle"
    }, 1000, function () {
    });

    $("#workspace").click(function () {
        $("#workwrapper").animate({
            right: "4%",
            width: "toggle"
        }, 1000, function () {
        });
    });

    $("#back").click(function(){
        document.getElementById('frame').contentWindow.history.back(-1);
    });
});