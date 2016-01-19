define(function(require) {

    var angular = require('angular'),
        $ = require('jquery'),
        WorkSpaceManager = require('app/model/workspacemanager');

    angular.element(document).ready(function () {
        var app = angular.module("app", []);
        app.controller("test", function ($scope) {
            $scope.show = false;
        });
        angular.bootstrap(document, ["app"]);
    });

    function showWorkSpaceList() {

        WorkSpaceManager.getWorkSpaceList().then(function (workSpaceList) {
            $('#workSpaceList').empty();
            workSpaceList.forEach(function (workSpace) {
                $('#workSpaceList').append(
                    '<li>' +
                    '<a href="/main?workspace=' + workSpace.id + '">' +
                    workSpace.get('name') + '</a>' +
                    '</li>');
            })
        }, function (error) {
            console.error(error);
        });
    }

    var browser = false;
    var workspace = false;
    var textchat = false;

    showWorkSpaceList();



    $("#search").click(function () {
        $("#framewrapper").animate({
            right: "4%",
            width: "toggle"
        }, 1000, function () {
        });
        browser = !browser;
        if (workspace==true){
            $("#workwrapper").animate({
                right: "4%",
                width: "toggle"
            }, 1000, function () {
            });
            workspace = false;
        }
        else if (textchat==true){
            $("#chatwrapper").animate({
                right: "4%",
                width: "toggle"
            }, 1000, function () {
            });
            textchat = false;
        }
    });

    $("#workspace").click(function () {
        $("#workwrapper").animate({
            right: "4%",
            width: "toggle"
        }, 1000, function () {
        });
        workspace = !workspace;
        if (browser==true){
            $("#framewrapper").animate({
                right: "4%",
                width: "toggle"
            }, 1000, function () {
            });
            browser = false;
        }
        else if (textchat==true){
            $("#chatwrapper").animate({
                right: "4%",
                width: "toggle"
            }, 1000, function () {
            });
            textchat = false;
        }
    });

    $("#chat").click(function () {
        $("#chatwrapper").animate({
            right: "4%",
            width: "toggle"
        }, 1000, function () {
        });
        textchat = !textchat;
        if (workspace==true){
            $("#workwrapper").animate({
                right: "4%",
                width: "toggle"
            }, 1000, function () {
            });
            workspace = false;
        }
        else if (browser==true){
            $("#framewrapper").animate({
                right: "4%",
                width: "toggle"
            }, 1000, function () {
            });
            browser = false;
        }
    });

});