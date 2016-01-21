define(function(require) {

    var angular = require('angular'),
        $ = require('jquery'),
        WorkSpaceManager = require('app/model/workspacemanager');

    var browser = false;
    var workspace = false;
    var textchat = false;
    var mute = true;
    var camera = true;


    $("#search").click(function () {
        camera = false;
        mute = false;
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
        camera = false;
        mute = false;
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
        workspaceManager.createWorkSpace(name)
            .then(function(){
                return workspaceManager.refreshWorkspaceList();
            })
            .then(function() {
                showWorkSpaceList();
            });
    });

    $("#chat").click(function () {
        camera = false;
        mute = false;
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

    $("#microphone").on('click', function(){
        camera = true;
        mute = true;
    });

    $("#videoButton").on('click', function(){
        camera = true;
        mute = true;
    });

    $('.sidebar li').on('click', function(){
        if (!mute && !camera) {
            $('.sidebar li').removeClass('selected');
        }
        if ((workspace || browser || textchat) && !mute && !camera) {
            $(this).addClass('selected');
        }
    });

    $('ul').on('click', 'li', function() {
        $('#files li.current').removeClass('current');
        $(this).addClass('current');
    });

});