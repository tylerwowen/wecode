
var editor;
var realtimeUtils;
var user;
var fs;
var adapter;
var realtimeData;
var collaborators;
var currentUserId;

Parse.initialize('mxwTWgOduKziA6I6YTwQ5ZlqSESu52quHsqX0xId',
    'rCQqACMXvizSE5pnZ9p8efewtz8ONwsVAgm2AHCP');

window.onload = function () {
    init();
    gapi.load('drive-share', init2);
};

// Share files in the app. This requires a domain
init2 = function () {
    s = new gapi.drive.share.ShareClient(clientId);
    s.setOAuthToken(gapi.auth.getToken());
    s.setItemIds([realtimeUtils.getParam('id')]);
};

function init() {

    // Parse
    user = Parse.User.current();

    adapter = new firepad.ACEAdapter(editor);
}

