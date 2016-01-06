define(function (require) {
    "use strict";

    var $ = require('jquery'),
        UserManager = require('app/model/usermanager'),
        WorkSpaceManager = require('app/model/workspacemanager');

    function Controller() {

        var that = this;

        $('#signup').click(function () {
            var userInput = that.getUserInput();
            UserManager.signup(userInput).then(function () {
                that.updateStatus();
            }, function (error) {
                console.error(error);
            });
        });

        $('#login').click(function () {
            var userInput = that.getUserInput();
            UserManager.login(userInput).then(function () {
                $('#login-hovering').hide();
            }, function (error) {
                console.error(error);
            });
        });

        $('#logout').click(function () {
            UserManager.logout();
            that.updateStatus();
        });

        $('#saveWorkSpaceBtn').click(function () {
            var id = $('#workSpaceId').val();
            WorkSpaceManager.saveWorkSpace(id).then(function () {
                that.showWorkSpaceList();
            });
        });
    }

    (function () {
        this.constructor = Controller;

        this.updateStatus = function () {
            this.updateStatus();
        };

        this.getUserInput = function() {
            var userName = $('#userName').val();
            var password = $('#password').val();

            return {
                userName: userName,
                password: password
            };
        };

        this.updateStatus = function() {
            if (UserManager.isLoggedIn()) {
                this.showLoggedInMessage();
                this.showWorkSpaceList();
            } else {
                this.showNotLoggedInMessage();
            }
        };

        this.showLoggedInMessage = function() {
            $('#status').text('You are logged in.');
        };

        this.showNotLoggedInMessage = function() {
            $('#status').text('You are NOT logged in.');
        };

        this.showWorkSpaceList = function() {

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
        };

        this.loginRequest = function (init) {
            $('#login-hovering').show();
            this.callback = init;
        };
    }).call(Controller.prototype);


    return Controller;
});