define(function (require) {
    "use strict";

    var $ = require('jquery'),
        gapi = require('gapi'),
        UserManager = require('app/model/usermanager');

    function Controller() {
        this.userManager = UserManager();

        this.onGapiSuccess = this.onGapiSuccess.bind(this);
        this.onGapiFailure = this.onGapiFailure.bind(this);
    }

    (function () {
        var that = this;
        this.constructor = Controller;

        this.init = function(onEventuallySuccess) {
            var that = this;
            this.onEventuallySuccess = onEventuallySuccess;
            return this.userManager.initGapi()
                .then(function () {
                    return that.userManager.startAuthorizing();
                })
                .then(function (authResult) {
                    if (authResult && authResult.error) {
                        console.log('asking for login request');
                        that.loginRequest();
                    }
                    else if (authResult && !authResult.error) {
                        console.log('succeeded with stuff');
                        onEventuallySuccess();
                    }
                }, function(err) {
                    console.log('found error boss');
                    console.log(err);
                    if(window.location.href.split('/').length !== 3)
                        window.location.href = '/';
                });
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
            this.userManager.isLoggedIn()
                .then(function(loggedIn) {
                    if(loggedIn)
                        that.showLoggedInMessage();
                    else
                        that.showNotLoggedInMessage();
                });
        };

        this.attachSignin = function() {
            var that = this;
            gapi.load('signin2', function(){
                gapi.signin2.render('signin-button', {
                    'height': 50,
                    'width': 220,
                    'longtitle': true,
                    'theme': 'dark',
                    'onsuccess': that.onGapiSuccess,
                    'onfailure': that.onGapiFailure
                });
            });
        };

        this.onGapiSuccess = function(googleUser) {
            this.updateStatus();
            this.onEventuallySuccess();
            $('#login-hovering').hide();
        };

        this.onGapiFailure = function(error) {
            this.userManager.onGapiFailure(error);
        };

        this.showLoggedInMessage = function() {
            $('#status').text('You are logged in.');
        };

        this.showNotLoggedInMessage = function() {
            $('#status').text('You are NOT logged in.');
        };

        this.loginRequest = function () {
            this.attachSignin();
            $('#login-hovering').show();
        };
    }).call(Controller.prototype);


    return Controller;
});