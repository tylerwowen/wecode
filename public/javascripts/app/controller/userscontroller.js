define(function(require) {
    "use strict";

    var $ = require('jquery'),
        UserManager = require('app/model/usermanager'),
        WorkSpaceManager = require('app/model/workspacemanager');

    function getUserInput() {
        var userName = $('#userName').val();
        var password = $('#password').val();

        return {
            userName: userName,
            password: password
        };
    }

    function updateStatus() {
        if (UserManager.isLoggedIn()) {
            showLoggedInMessage();
            showWorkSpaceList();
        } else {
            showNotLoggedInMessage();
        }
    }

    function showLoggedInMessage() {
        $('#status').text('You are logged in.');
    }

    function showNotLoggedInMessage() {
        $('#status').text('You are NOT logged in.');
    }

    function showWorkSpaceList() {

        WorkSpaceManager.getWorkSpaceList().then(function(workSpaceList) {
            $('#workSpaceList').empty();
            workSpaceList.forEach(function(workSpace) {
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

    function Controller() {

        $('#signup').click(function() {
            var userInput = getUserInput();
            UserManager.signup(userInput).then(function() {
                updateStatus();
            }, function (error) {
                console.error(error);
            });
        });

        $('#login').click(function() {
            var userInput = getUserInput();
            UserManager.login(userInput).then(function() {
                updateStatus();
            }, function (error) {
                console.error(error);
            });
        });

        $('#logout').click(function() {
            UserManager.logout();
            updateStatus();
        });

        $('#saveWorkSpaceBtn').click(function() {
            var id = $('#workSpaceId').val();
            WorkSpaceManager.saveWorkSpace(id).then(function() {
                showWorkSpaceList();
            });
        });
    }

    (function() {
        this.constructor = Controller;

        this.updateStatus = function() {
            updateStatus();
        };

    }).call(Controller.prototype);


    return Controller;
});