var clientId = '315862064112-anadjteqedc54o1tkhg493e0jqntlfve.apps.googleusercontent.com';

var editor;
var collaborativeString;
var changeFromGoogle = false;
var realtimeUtils;
var user;
var workSpace;
var cursorPosition;

Parse.initialize('mxwTWgOduKziA6I6YTwQ5ZlqSESu52quHsqX0xId',
    'rCQqACMXvizSE5pnZ9p8efewtz8ONwsVAgm2AHCP');

window.onload = function() {
    init();
    gapi.load('drive-share', init2);
}

// Share files in the app. This requires a domain
init2 = function() {
    s = new gapi.drive.share.ShareClient(clientId);
    s.setOAuthToken(gapi.auth.getToken());
    s.setItemIds([realtimeUtils.getParam('id')]);
}

function init() {
    editor = ace.edit("editor");
    editor.setTheme("ace/theme/monokai");
    editor.getSession().setMode("ace/mode/javascript");
    editor.getSession().setUseWrapMode(true);
    editor.getSession().on('change', editorChangeHandler);
    //editor.setAutoScrollEditorIntoView(false);

    // Create a new instance of the realtime utility with Google client ID.
    realtimeUtils = new utils.RealtimeUtils({ clientId: clientId });
    authorize();

    // Parse
    user = Parse.User.current();
}

function authorize() {
    // Attempt to authorize
    realtimeUtils.authorize(function(response) {
        if(response.error) {
            // Authorization failed because this is the first time the user has used your application,
            realtimeUtils.authorize(function(response) {
                loadFileList();
            }, true);
        } else {
            loadFileList();
        }
    }, false);
}

function loadFileList() {

    var wsID = realtimeUtils.getParam('workspace');
    if (wsID) {
        // Get a list of files from work space with wsID
        showFiles(wsID);
    } else {
        // Shouldn't see this page without a work space id
        // redirect for now
        alert("You should log in");
        window.location = "/users";
    }
}

function loadFile(id) {
    if (id) {
        realtimeUtils.load(id, onFileLoaded, onFileInitialize);
    } else {
        createDriveFile('untitled');
    }
}

// The first time a file is opened, it must be initialized with the
// document structure. This function will add a collaborative string
// to our model at the root.
function onFileInitialize(model) {

    var string = model.createString();
    model.getRoot().set('demo_string', string);
}

// After a file has been initialized and loaded, we can access the
// document. We will wire up the data model to the UI.
function onFileLoaded(doc) {

    collaborativeString = doc.getModel().getRoot().get('demo_string');
    editor.setValue(collaborativeString.getText());
    editor.navigateFileStart();
    wireCodeEditor(collaborativeString);
}

// Sets a file's permission
function insertPermission(fileId, value, type, role) {
    var body = {
        'value': value,
        'type': type,
        'role': role
    };
    var request = gapi.client.drive.permissions.insert({
        'fileId': fileId,
        'resource': body
    });
    request.execute(function(resp) { });
}

// Connects the code editor to the collaborative string
function wireCodeEditor(inputString) {

    console.log(inputString);
    collaborativeString.addEventListener(gapi.drive.realtime.EventType.TEXT_INSERTED, updateCodeEditorString);
}

function updateCodeEditorString(event){

    if (!event.isLocal) {
        console.log('collaborativeString is changed');
        changeFromGoogle = true;
        editor.getSession().getDocument().setValue(collaborativeString.getText());
        editor.navigateTo(cursorPosition.row, cursorPosition.column);
        changeFromGoogle = false;
    }
}

function editorChangeHandler(e) {

    if (!changeFromGoogle) {
        cursorPosition = editor.getCursorPosition();
        console.log("editor text changed.");
        console.log("Cursor Position: ",cursorPosition);
        updateColabrativeString();
    }
}

function updateColabrativeString() {
    if (collaborativeString) {
        collaborativeString.setText(editor.getSession().getDocument().getValue());
    }
}

// File system
var WorkSpace = Parse.Object.extend('WorkSpace');
var File = Parse.Object.extend('File');

function showFiles(wsID) {
    getWorkSpace(wsID).then(function(){
        return getFiles();
    }).then(function(files) {
        if (files.length > 0) {
            files.forEach(function (file) {
                $('#files').append(
                    '<li style="color:white" onClick="loadFile(\'' + file.get('driveFileId') + '\')">' +
                    file.get('name') +
                    '</li>');
            })
        }
        else {
            createDriveFile('untitled');
        }
    }, function(error) {
        console.error(error);
    });
}

function getWorkSpace(wsID) {

    var successful = new Parse.Promise();
    var query = new Parse.Query(WorkSpace);
    query.get(wsID).then(function(fetchedWorkSpace) {
        workSpace = fetchedWorkSpace;
        successful.resolve();
    }, function(error) {
        console.error(error);
    });
    return successful;
}

function getFiles() {

    var successful = new Parse.Promise();
    var relation = workSpace.relation('files');
    var query = relation.query();
    query.find().then(function(files) {
        successful.resolve(files);
    }, function(error) {
        console.error(error);
    });
    return successful;
}

function createFile() {
    var fileName = $('#fileName').val();
    if (fileName) {
        createDriveFile(fileName).then(function(driveFileId, fileName){
            createParseFile(driveFileId, fileName);
            refreshList(driveFileId, fileName);
        }, function(error){
            console.error(error);
        });
    }
    else {
        alert('Please input a file name!');
    }
}

function createDriveFile(fileName) {
    var successful = new Parse.Promise();
    // Create a new document
    realtimeUtils.createRealtimeFile(fileName, function(createResponse) {
        // Set the file permission to public.
        // This is only for Demo
        insertPermission(createResponse.id, '', 'anyone', 'writer');
        realtimeUtils.load(createResponse.id, onFileLoaded, onFileInitialize);
        successful.resolve(createResponse.id, fileName);
    });
    return successful;
}

function createParseFile(driveFileId, fileName) {

    var file = new File();
    file.set('driveFileId', driveFileId);
    file.set('name', fileName);

    file.save().then(function() {
        var relation = workSpace.relation('files');
        relation.add(file);
        workSpace.save();
    });
}

function refreshList(driveFileId, fileName) {
    $('#fileName').val('');
    $('#files').append(
        '<li style="color:white" onClick="loadFile(\'' + driveFileId + '\')">' +
        fileName +
        '</li>');
}