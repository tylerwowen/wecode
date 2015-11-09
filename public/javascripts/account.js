/**
 * Created by tyler on 10/16/15.
 */

Parse.initialize('mxwTWgOduKziA6I6YTwQ5ZlqSESu52quHsqX0xId',
    'rCQqACMXvizSE5pnZ9p8efewtz8ONwsVAgm2AHCP');

var user;

window.onload = function() {
    user = Parse.User.current();
    if (user) {
        showLoggedInMessage();
        showWorkSpaceList();
    } else {
        user = new Parse.User();
        showNotLoggedInMessage();
    }
}

function setupParseUser() {

    var userName = $('#userName').val();
    var password = $('#password').val();

    user.set('username', userName);
    user.set('password', password);

// other fields can be set just like with Parse.Object
//    user.set('phone', '650-555-0000');
}

function signup() {

    setupParseUser();
    user.signUp(null, {
        success: function(user) {
            // Hooray! Let them use the app now.
        },
        error: function(user, error) {
            // Show the error message somewhere and let the user try again.
            alert('Error: ' + error.code + ' ' + error.message);
        }
    });
}

function login() {

    setupParseUser();
    user.logIn( {
        success: function(user) {
            console.log('logged in with user: ' + user.getUsername());
            showLoggedInMessage();
            showWorkSpaceList();
        },
        error: function(user, error) {
            console.error(error);
        }
    });
}

function showLoggedInMessage() {
    $('#status').text('You are logged in.');
}


function showNotLoggedInMessage() {
    $('#status').text('You are NOT logged in.');
}

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
    'profile',
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


// Experimental
var WorkSpace = Parse.Object.extend('WorkSpace');
var File = Parse.Object.extend('File');

function showWorkSpaceList() {

    getWorkSpaceList().then(function(workSpaceList){
        workSpaceList.forEach(function(workSpace){
            $('#workSpaceList').append(
                '<li>' +
                    '<a href="/main/?workspace=' + workSpace.id +'">' +
                    workSpace.get('name') + '</a>' +
                '</li>');
        })
    }, function(error){
        console.error(error);
    });
}

function getWorkSpaceList() {

    var successful = new Parse.Promise();
    var relation = user.relation('workSpaceList');
    var query = relation.query();
    query.find().then(function(workSpaceList) {
        successful.resolve(workSpaceList);
    }, function(error) {
        // there was some error.
        console.error(error);
    });
    return successful;
}

function createWorkSpace() {

    var workSpace = new WorkSpace();

    var relation = workSpace.relation('files');

    var query = new Parse.Query(File);
    query.get("Zw0gCNNahz", {
        success: function(fetchedFile) {
            relation.add(fetchedFile)
        },
        error: function(object, error) {
            // The object was not retrieved successfully.
            // error is a Parse.Error with an error code and message.
        }
    }).then(function(){
        return workSpace.save();
    }).then(function() {
        var userWorkSpaceRelation = user.relation('workSpaceList');
        userWorkSpaceRelation.add(workSpace);
        user.save();
    });
}
