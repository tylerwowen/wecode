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

    $("#back").click(function(){
        $('#frame').contentWindow.history.back(-1);
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

    var workspaceManager = new WorkSpaceManager();

    function showWorkSpaceList() {

        workspaceManager.init().then(function (workSpaceList) {
            $('#workSpaceList').empty();
            workSpaceList.forEach(function (workSpace) {
                var params = $.param({
                    id: workSpace.id,
                    name: workSpace.name
                });
                $('#workSpaceList').append(
                    '<li>' +
                    '<a href="/main?' + params + '">' +
                    workSpace.name+ '</a>' +
                    '</li>');
            })
        }, function (error) {
            console.error(error);
        });
    }
    showWorkSpaceList();

    $('#workSpaceButton').click(function() {
        var name = $('#newWorkSpaceInput').val();
        console.log(name);
        workspaceManager.createWorkSpace(name);
    });

});