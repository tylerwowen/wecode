define(function (require) {
    "use strict";

    var $ = require('jquery'),
        gapi = require('gapi'),
        UserManager = require('app/model/usermanager'),
        WorkSpaceManager = require('app/model/workspacemanager');

    function Controller() {
        this.userManager = new UserManager();
        this.workspaceManager = new WorkSpaceManager();

        this.onGapiSuccess = this.onGapiSuccess.bind(this);
        this.onGapiFailure = this.onGapiFailure.bind(this);
    }

    (function () {
        this.constructor = Controller;

        this.init = function(onEventuallySuccess) {
            var that = this;
            this.onEventuallySuccess = onEventuallySuccess;
            return this.userManager.initGapi()
                .then(function() {
                    return that.userManager.startAuthorizing();
                })
                .then(function(authResult) {
                    if (authResult && authResult.error) {
                        that.renderButton();
                        that.loginRequest();
                    }
                    else if (authResult && !authResult.error){
                        onEventuallySuccess();
                    }
                });
        };

        this.connectToView = function() {
            var that = this;

            this.renderButton();

            //$('#signup').click(function () {
            //    var userInput = that.getUserInput();
            //    UserManager.signup(userInput).then(function () {
            //        that.updateStatus();
            //    }, function (error) {
            //        console.error(error);
            //    });
            //});
            //
            //$('#login').click(function () {
            //    var userInput = that.getUserInput();
            //    UserManager.login(userInput).then(function () {
            //        $('#login-hovering').hide();
            //    }, function (error) {
            //        console.error(error);
            //    });
            //});
            //
            //$('#logout').click(function () {
            //    UserManager.logout();
            //    that.updateStatus();
            //});
            //
            //$('#saveWorkSpaceBtn').click(function () {
            //    var id = $('#workSpaceId').val();
            //    WorkSpaceManager.saveWorkSpace(id).then(function () {
            //        that.showWorkSpaceList();
            //    });
            //});
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
            if (this.userManager.isLoggedIn()) {
                this.showLoggedInMessage();
                this.showWorkSpaceList();
                console.log('signed in')
                window.location.href = ('/main');
            } else {
                this.showNotLoggedInMessage();
            }
        };

        this.renderButton = function() {
            gapi.signin2.render('signin-button', {
                'width': 214,
                'height': 30,
                'longtitle': true,
                'theme': 'dark',
                'onsuccess': this.onGapiSuccess,
                'onfailure': this.onGapiFailure
            });
        };

        this.onGapiSuccess = function(googleUser) {
            this.updateStatus();
            //this.showWorkSpaceList();
            this.onEventuallySuccess();
            $('#login-hovering').hide();
            this.userManager.onGapiSuccess(googleUser);
        };

        this.onGapiFailure = function(error) {
            console.log(error);
            this.userManager.onGapiFailure(error);
        };

        this.showLoggedInMessage = function() {
            $('#status').text('You are logged in.');
        };

        this.showNotLoggedInMessage = function() {
            $('#status').text('You are NOT logged in.');
        };

        this.showWorkSpaceList = function() {

            this.workspaceManager.init().then(function (workSpaceList) {
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
        };

        this.loginRequest = function () {
            $('#login-hovering').show();
        };
    }).call(Controller.prototype);


    return Controller;
});