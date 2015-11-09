var clientId = '315862064112-anadjteqedc54o1tkhg493e0jqntlfve.apps.googleusercontent.com';

var editor;
var collaborativeString;
var changeFromGoogle = false;
var realtimeUtils;
var user;
var workSpace;

Parse.initialize('mxwTWgOduKziA6I6YTwQ5ZlqSESu52quHsqX0xId',
    'rCQqACMXvizSE5pnZ9p8efewtz8ONwsVAgm2AHCP');

window.onload = function() {
    init();
    gapi.load('drive-share', init2);
}
// Share files in the app. This requires
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
                start();
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
        // Load the document id from the URL
        realtimeUtils.load(id, onFileLoaded, onFileInitialize);
    } else {
        // Create a new document, add it to the URL
        realtimeUtils.createRealtimeFile('code_weStudy.txt', function(createResponse) {
            window.history.pushState(null, null, '&id=' + createResponse.id);
            // Set the file permission to public.
            // This is only for Demo
            insertPermission(createResponse.id, '', 'anyone', 'writer');
            realtimeUtils.load(createResponse.id, onFileLoaded, onFileInitialize);
        });
    }
}

// The first time a file is opened, it must be initialized with the
// document structure. This function will add a collaborative string
// to our model at the root.
function onFileInitialize(model) {

    var string = model.createString();
    string.setText(editor.getValue());
    model.getRoot().set('demo_string', string);
}

// After a file has been initialized and loaded, we can access the
// document. We will wire up the data model to the UI.
function onFileLoaded(doc) {

    collaborativeString = doc.getModel().getRoot().get('demo_string');
    editor.setValue(collaborativeString.getText());
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

function updateCodeEditorString(event ){

    if (!event.isLocal) {
        console.log('collaborativeString is changed');
        changeFromGoogle = true;
        editor.getSession().getDocument().setValue(collaborativeString.getText());
        changeFromGoogle = false;
    }
}

function editorChangeHandler(e) {

    if (!changeFromGoogle) {
        console.log("editor text changed.");
        updateColabrativeString();
    }
}

function updateColabrativeString() {
    collaborativeString.setText(editor.getSession().getDocument().getValue());
}

// File system
var WorkSpace = Parse.Object.extend('WorkSpace');
var File = Parse.Object.extend('File');

function showFiles(wsID) {
    getWorkSpace(wsID).then(function(){
        return getFiles();
    }).then(function(files) {
        files.forEach(function(file){
            $('#files').append(
                '<li style="color:white" onClick="loadFile(\'' + file.get('driveFileId') + '\')">' +
                    file.get('name') +
                '</li>');
        })
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

function addFileToWorkSpace(fileObjectId){
    var relation = workSpace.relation('files');
    var query = new Parse.Query(File);
    query.get(fileObjectId, {
        success: function(fetchedFile) {
            relation.add(fetchedFile)
            workSpace.save();
        },
        error: function(object, error) {
            console.error(error);
        }
    })
}