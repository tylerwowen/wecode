/**
 * Created by tyler on 10/16/15.
 */

Parse.initialize("mxwTWgOduKziA6I6YTwQ5ZlqSESu52quHsqX0xId", "rCQqACMXvizSE5pnZ9p8efewtz8ONwsVAgm2AHCP");

var user = new Parse.User();
user.set("username", "my name");
user.set("password", "my pass");
user.set("email", "email@example.com");

// other fields can be set just like with Parse.Object
user.set("phone", "650-555-0000");

user.signUp(null, {
    success: function(user) {
        // Hooray! Let them use the app now.
    },
    error: function(user, error) {
        // Show the error message somewhere and let the user try again.
<<<<<<< HEAD
        //alert("Error: " + error.code + " " + error.message);
=======
        alert("Error: " + error.code + " " + error.message);
>>>>>>> 1. Added raw parse signup page
    }
});