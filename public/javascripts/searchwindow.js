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

    var browser = false;
    var workspace = false;
    $("#framewrapper").animate({
        right: "3%",
        width: "toggle"
    }, 1000, function () {
    });

    $("#search").click(function () {
        $("#framewrapper").animate({
            right: "3%",
            width: "toggle"
        }, 1000, function () {
        });
        browser = !browser;
        if(workspace==true){
            $("#workwrapper").animate({
                right: "3%",
                width: "toggle"
            }, 1000, function () {
            });
            workspace = false;
        }
    });

    $("#workwrapper").animate({
        right: "3%",
        width: "toggle"
    }, 1000, function () {
    });

    $("#workspace").click(function () {
        $("#workwrapper").animate({
            right: "3%",
            width: "toggle"
        }, 1000, function () {
        });
        workspace = !workspace;
        if(browser==true){
            $("#framewrapper").animate({
                right: "3%",
                width: "toggle"
            }, 1000, function () {
            });
            browser = false;
        }
    });

    $("#back").click(function(){
        document.getElementById('frame').contentWindow.history.back(-1);
    });
});