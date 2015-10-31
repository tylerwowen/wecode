Parse.initialize('mxwTWgOduKziA6I6YTwQ5ZlqSESu52quHsqX0xId',
    'rCQqACMXvizSE5pnZ9p8efewtz8ONwsVAgm2AHCP');

var user = Parse.User.current();
var TokenStorage = Parse.Object.extend("TokenStorage");

if (user) {
    console.log("Username",user.getUsername());
} else {
    console.error("User is not logged in");
}

function getAccessToken() {
    var query = new Parse.Query(TokenStorage);
    query.equalTo('user', user);
    query.ascending('createdAt');
    Parse.Promise.as().then(function() {
        return query.first({ useMasterKey: true });
    }).then(function(tokenData) {
        if (!tokenData) {
            return Parse.Promise.error('No Google data found.');
        }
        return tokenData.get('accessToken');
    }, function(error) {
        response.error(error);
    });
}

console.log(getAccessToken());