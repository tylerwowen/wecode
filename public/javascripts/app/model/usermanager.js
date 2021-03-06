define(function(require) {
    "use strict";

    var Q = require('q'),
        gapi = require('gapi');

    var clientId = '315862064112-anadjteqedc54o1tkhg493e0jqntlfve.apps.googleusercontent.com';
    var scopes =
        'https://www.googleapis.com/auth/drive.install ' +
        'https://www.googleapis.com/auth/drive.file ' +
        'https://www.googleapis.com/auth/drive.appdata ' +
        'https://www.googleapis.com/auth/drive.metadata '+
        'email '+
        'profile';

    var instance = null;

    function UserManager() {
        if (instance != null) {
            throw new Error('Cannot instantiate more than one UserManager, use UserManager.sharedInstance')
        }

        this.onGapiSuccess = this.onGapiSuccess.bind(this);
        this.onGapiFailure = this.onGapiFailure.bind(this);
        this.handleAuthResult = this.handleAuthResult.bind(this);
    }

    (function() {
        this.constructor = UserManager;

        this.auth2 = null;
        this.userName = null;
        this.email = null;
        this.gToken = null;
        this.refreshInterval = 1800000;

        this.initGapi = function() {
            var that = this;
            var deferred = Q.defer();
            gapi.load('auth2', function(){
                that.auth2 = gapi.auth2.init({
                    client_id: clientId,
                    scope: scopes
                });
                that.auth2.isSignedIn.listen(function(isSignedIn) {
                    if (isSignedIn) {
                        that.onGapiSuccess(that.auth2.currentUser.get());
                    }
                });

                deferred.resolve();
            });
            return deferred.promise;
        };

        this.onGapiSuccess = function(googleUser) {
            console.log('Logged in as: ' + googleUser.getBasicProfile().getName());
            this.userName = googleUser.getBasicProfile().getName();
            this.email = googleUser.getBasicProfile().getEmail();
            if (this.authTimer) {
                window.clearTimeout(this.authTimer);
            }
            if (!this.gToken) {
                this.authorize(false);
            }
            this.refreshAuth();
        };

        this.onGapiFailure = function(error) {
            console.log(error);
        };

        this.isLoggedIn = function() {
            return this.auth2.isSignedIn.get();
        };

        this.startAuthorizing = function() {
            var that = this;
            var deferred = Q.defer();

            gapi.auth.authorize({
                client_id: clientId,
                scope: scopes,
                immediate: true
            }, function(authResult) {
                if (authResult && !authResult.error) {
                    that.gToken = authResult.access_token;
                }
                deferred.resolve(authResult);
            });

            return deferred.promise;
        };

        /**
         * Attempts to authorize.
         * @private
         */
        this.authorize = function(usePopup) {
            // Try with no popups first.
            gapi.auth.authorize({
                client_id: clientId,
                scope: scopes,
                immediate: !usePopup
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
                that.authorize(false);
                that.refreshAuth();
            }, this.refreshInterval);
        };

    }).call(UserManager.prototype);

    UserManager.sharedInstance = function() {
        if (instance == null) {
            instance = new UserManager();
        }
        return instance;
    };

    return UserManager.sharedInstance;
});
