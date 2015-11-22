
function getGDriveAuthentication() {
    //if (isGoogleLibLoaded) {
    //    checkAuth();
    //}
    if (!Parse.User.current()) {
        alert('You must log in first');
        //window.location.href='/';
    } else {
        Parse.Cloud.run('getGoogleData', {}).then(function(response) {
            $('#name').text(response.name);
            $('#email').text(response.email);
            $('#locale').text(response.locale);
        }, function(error) {
            window.location.href = 'http://westudy.parseapp.com/authorize/' + user.id;
            console.log(error);
        });
    }
}

var CLIENT_ID = '315862064112-anadjteqedc54o1tkhg493e0jqntlfve.apps.googleusercontent.com';
var SCOPES = [
    'https://www.googleapis.com/auth/drive',
    'email',
    'profile'
    // Add other scopes needed by your application.
];
var isGoogleLibLoaded = false;

/**
 * Called when the client library is loaded.
 */
function handleClientLoad() {
    isGoogleLibLoaded = true;
}

/**
 * Check if the current user has authorized the application.
 */
function checkAuth() {
    gapi.auth.authorize(
        {
            'client_id': CLIENT_ID,
            'scope': SCOPES,
            'immediate': true
        }, handleAuthResult);
}

/**
 * Called when authorization server replies.
 *
 * @param {Object} authResult Authorization result.
 */
function handleAuthResult(authResult) {

    if (authResult && !authResult.error) {
        // Hide auth UI, then load client library.
        $('#authorizeDiv').css('display', 'none');
        console.log(authResult.code);
        loadDriveApi(listFiles);
    } else {
        // Show auth UI, allowing the user to initiate authorization by
        // clicking authorize button.
        $('#authorizeDiv').css('display', 'inline');;
    }
}

/**
 * Initiate auth flow in response to user clicking authorize button.
 *
 * @param {Event} event Button click event.
 */
function handleAuthClick(event) {

    gapi.auth.authorize(
        {client_id: CLIENT_ID, scope: SCOPES, immediate: false},
        handleAuthResult);
    return false;
}


/**
 * Load the Drive API client.
 * @param {Function} callback Function to call when the client is loaded.
 */
function loadDriveApi(callback) {
    gapi.client.load('drive', 'v2', callback);
}

/**
 * Print files.
 */
function listFiles() {
    var request = gapi.client.drive.files.list({
        'maxResults': 10
    });

    request.execute(function(resp) {
        appendPre('Files:');
        var files = resp.items;
        if (files && files.length > 0) {
            for (var i = 0; i < files.length; i++) {
                var file = files[i];
                appendPre(file.title + ' (' + file.id + ')');
            }
        } else {
            appendPre('No files found.');
        }
    });
}

/**
 * Print a file's metadata.
 *
 * @param {String} fileId ID of the file to print metadata for.
 */
function printFile(fileId) {
    var request = gapi.client.drive.files.get({
        'fileId': fileId
    });
    request.execute(function(resp) {
        if (!resp.error) {
            console.log('Title: ' + resp.title);
            console.log('Description: ' + resp.description);
            console.log('MIME type: ' + resp.mimeType);
        } else if (resp.error.code == 401) {
            // Access token might have expired.
            checkAuth();
        } else {
            console.log('An error occured: ' + resp.error.message);
        }
    });
}

/**
 * Append a pre element to the body containing the given message
 * as its text node.
 *
 * @param {string} message Text to be placed in pre element.
 */
function appendPre(message) {
    var pre = document.getElementById('output');
    var textContent = document.createTextNode(message + '\n');
    pre.appendChild(textContent);
}


