define(function(require) {
    "use strict";

    var Parse = require('parse'),
        Q = require('q'),
        gapi = require('gapi');

    var clientId = '315862064112-anadjteqedc54o1tkhg493e0jqntlfve.apps.googleusercontent.com';
    var scopes =
        'https://www.googleapis.com/auth/drive.install ' +
        'https://www.googleapis.com/auth/drive.file ' +
        'https://www.googleapis.com/auth/drive.appdata ' +
        'https://www.googleapis.com/auth/drive.metadata '+
        'email '+
        'profile';


    function UserManager() {
        Parse.initialize('mxwTWgOduKziA6I6YTwQ5ZlqSESu52quHsqX0xId',
            'rCQqACMXvizSE5pnZ9p8efewtz8ONwsVAgm2AHCP');

        this.onGapiSuccess = this.onGapiSuccess.bind(this);
        this.onGapiFailure = this.onGapiFailure.bind(this);
        this.handleAuthResult = this.handleAuthResult.bind(this);
    }

    (function() {
        this.constructor = UserManager;

        this.auth2 = null;
        this.userName = null;
        this.gToken = null;
        this.refreshInterval = 180000;

        this.initGapi = function() {
            var that = this;
            var deferred = Q.defer();
            gapi.load('signin2', function(){
                that.auth2 = gapi.auth2.init({
                    client_id: clientId,
                    scope: scopes
                });
                that.attauchClickHandler();
                deferred.resolve();
            });
            if (this.authTimer) {
                window.clearTimeout(this.authTimer);
            }
            this.refreshAuth();
            return deferred.promise;
        };

        this.attauchClickHandler = function() {
            var that = this;
            //this.auth2.attachClickHandler('signin-button', {}, this.onGapiSuccess, this.onGapiFailure);
        };

        this.onGapiSuccess = function(googleUser) {
            console.log('Logged in as: ' + googleUser.getBasicProfile().getName());
            this.gToken = googleUser.getAuthResponse().access_token;
            this.userName = googleUser.getBasicProfile().getName();
        };

        this.onGapiFailure = function(error) {
            console.log(error);
        };

        this.isLoggedIn = function() {
            return this.auth2.isSignedIn.get();
        };

        /**
         * Attempts to authorize.
         * @private
         */
        this.authorize = function() {
            // Try with no popups first.
            gapi.auth.authorize({
                client_id: clientId,
                scope: scopes,
                immediate: true
            }, this.handleAuthResult);
        };

        /**
         * Handles the auth result before invoking the user supplied callback.
         * @param {Object} authResult from the drive service containing details about
         *     this authorization attempt.
         * @private
         */
        this.handleAuthResult = function(authResult) {
            if (authResult && !authResult.error) {
                this.gToken = authResult.access_token;
                console.log('Refreshed Auth Token');
            }
        };

        /**
         * Sets a timer that will refreshes the oauth token after an interval.
         * @private
         */
        this.refreshAuth = function() {
            var that = this;
            this.authTimer = setTimeout(function() {
                that.authorize();
                that.refreshAuth();
            }, this.refreshInterval);
        };

    }).call(UserManager.prototype);

    return UserManager;

    //function setupParseUser(userInput) {
    //
    //    user.set('username', userInput.userName);
    //    user.set('password', userInput.password);
    //
    //    // other fields can be set just like with Parse.Object
    //    // user.set('phone', '650-555-0000');
    //}
    //var user = Parse.User.current();
    //var isLoggedIn = false;
    //
    //if (user) {
    //    isLoggedIn = true;
    //}
    //else {
    //    isLoggedIn = false;
    //    user = new Parse.User();
    //}

    //return {
    //    signup: function(userInput) {
    //        var successful = new Parse.Promise();
    //
    //        setupParseUser(userInput);
    //        user.signUp(null, {
    //            success: function(user) {
    //                isLoggedIn = true;
    //                successful.resolve();
    //            },
    //            error: function(user, error) {
    //                // Show the error message somewhere and let the user try again.
    //                alert('Error: ' + error.code + ' ' + error.message);
    //            }
    //        });
    //        return successful;
    //    },
    //
    //    login: function(userInput) {
    //        var successful = new Parse.Promise();
    //
    //        setupParseUser(userInput);
    //        user.logIn( {
    //            success: function(user) {
    //                isLoggedIn = true;
    //                console.log('logged in with user: ' + user.getUsername());
    //                successful.resolve();
    //            },
    //            error: function(user, error) {
    //                console.error(error);
    //            }
    //        });
    //        return successful;
    //    },
    //
    //    logout: function() {
    //        Parse.User.logOut();
    //        isLoggedIn = false;
    //    },
    //
    //    isLoggedIn: function() {
    //        return isLoggedIn;
    //    }
    //};
});