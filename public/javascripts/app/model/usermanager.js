define(function(require) {
    "use strict";

    var Parse = require('parse');

    Parse.initialize('mxwTWgOduKziA6I6YTwQ5ZlqSESu52quHsqX0xId',
        'rCQqACMXvizSE5pnZ9p8efewtz8ONwsVAgm2AHCP');

    var user = Parse.User.current();
    var isLoggedIn = false;

    if (user) {
        isLoggedIn = true;
    }
    else {
        isLoggedIn = false;
        user = new Parse.User();
    }

    function setupParseUser(userInput) {

        user.set('username', userInput.userName);
        user.set('password', userInput.password);

        // other fields can be set just like with Parse.Object
        // user.set('phone', '650-555-0000');
    }

    return {
        signup: function(userInput) {
            var successful = new Parse.Promise();

            setupParseUser(userInput);
            user.signUp(null, {
                success: function(user) {
                    isLoggedIn = true;
                    successful.resolve();
                },
                error: function(user, error) {
                    // Show the error message somewhere and let the user try again.
                    alert('Error: ' + error.code + ' ' + error.message);
                }
            });
            return successful;
        },

        login: function(userInput) {
            var successful = new Parse.Promise();

            setupParseUser(userInput);
            user.logIn( {
                success: function(user) {
                    isLoggedIn = true;
                    console.log('logged in with user: ' + user.getUsername());
                    successful.resolve();
                },
                error: function(user, error) {
                    console.error(error);
                }
            });
            return successful;
        },

        logout: function() {
            Parse.User.logOut();
            isLoggedIn = false;
        },

        isLoggedIn: function() {
            return isLoggedIn;
        }
    };
});