var clientId = '315862064112-anadjteqedc54o1tkhg493e0jqntlfve.apps.googleusercontent.com';

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
    editor.$blockScrolling = Infinity;

    // Create a new instance of the realtime utility with Google client ID.
    realtimeUtils = new utils.RealtimeUtils({ clientId: clientId });
    authorize();

    // Parse
    user = Parse.User.current();

    adapter = new firepad.ACEAdapter(editor);
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
        fs = new FileSystem(wsID);
        fs.showFiles();
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
    model.getRoot().set('text', string);

    var map = model.createMap();
    model.getRoot().set('cursors', map);
}

// After a file has been initialized and loaded, we can access the
// document. We will wire up the data model to the UI.
function onFileLoaded(doc) {
    realtimeData = new RealtimeData();
    collaborators = doc.getCollaborators();

    realtimeData.text = doc.getModel().getRoot().get('text');
    realtimeData.cursors = doc.getModel().getRoot().get('cursors');

    editor.setValue(realtimeData.text.getText());

    currentUserId = getCurrentUserId();
    var cursor = realtimeData.cursors.get(currentUserId);

    if(cursor != null) {
        var position = adapter.posFromIndex(cursor.selectionEnd);
        editor.navigateTo(position.row, position.column);
    }
    else {
        cursor = new firepad.Cursor(0, 0);
        realtimeData.cursors.set(currentUserId, cursor);
    }

    addRealTimeDataListeners();
}

function getCurrentUserId() {
    for(var i = 0; i < collaborators.length; i++) {
        if(collaborators[i].isMe) {
            return collaborators[i].userId;
        }
    }
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
function addRealTimeDataListeners() {
    realtimeData.text.addEventListener(gapi.drive.realtime.EventType.TEXT_INSERTED, updateEditorText);
    realtimeData.text.addEventListener(gapi.drive.realtime.EventType.TEXT_DELETED, updateEditorText);
    realtimeData.cursors.addEventListener(gapi.drive.realtime.EventType.VALUE_CHANGED, updateEditorCursors);
}

function updateEditorText(event) {
    if (!event.isLocal) {
        adapter.applyOperation(event)
    }
}

function updateEditorCursors(event) {
    if(!event.isLocal) {
        var userId = event.property;
        var cursor = event.newValue;
        console.log(getColor(userId));
        adapter.setOtherCursor(cursor, getColor(userId), userId);
    }
}

function getColor(string) {
    return '#' + intToRGB(hashCode(string));
}

function hashCode(str) {
    var hash = 0;
    for (var i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return hash;
}

function intToRGB(i){
    var c = (i & 0x00FFFFFF)
        .toString(16)
        .toUpperCase();

    return "00000".substring(0, 6 - c.length) + c;
}

function cursorChangeHandler() {
    if (realtimeData.cursors && !changeFromGoogle2) {
        console.log('Cursor ', editor.getSession().getSelection().getCursor());
        realtimeData.cursors.set(currentUserId, editor.getSession().getSelection().getCursor());
    }
}

// Realtime data structure
function RealtimeData() {
    this.text = null;
    this.cursors = null;
}

(function() {

}).call(RealtimeData.prototype);

// File system
function FileSystem(wsID) {
    this.wsID = wsID;
    this.workSpace = null;
}

(function() {

    var WorkSpace = Parse.Object.extend('WorkSpace');
    var File = Parse.Object.extend('File');

    this.showFiles = function() {

        var that = this;

        this.getWorkSpace().then(function(){
            return that.getFiles();
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
    };

    this.getWorkSpace = function() {

        var that = this;
        var successful = new Parse.Promise();
        var query = new Parse.Query(WorkSpace);
        query.get(this.wsID).then(function(fetchedWorkSpace) {
            that.workSpace = fetchedWorkSpace;
            successful.resolve();
        }, function(error) {
            console.error(error);
        });
        return successful;
    };

    this.getFiles = function() {

        var successful = new Parse.Promise();
        var relation = this.workSpace.relation('files');
        var query = relation.query();
        query.find().then(function(files) {
            successful.resolve(files);
        }, function(error) {
            console.error(error);
        });
        return successful;
    };

    this.createDriveFile = function(fileName) {
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
    };

    this.createParseFile = function(driveFileId, fileName) {
        var that = this;
        var file = new File();
        file.set('driveFileId', driveFileId);
        file.set('name', fileName);

        file.save().then(function() {
            var relation = that.workSpace.relation('files');
            relation.add(file);
            that.workSpace.save();
        });
    };

    this.refreshList = function(driveFileId, fileName) {
        $('#fileName').val('');
        $('#files').append(
            '<li style="color:white" onClick="loadFile(\'' + driveFileId + '\')">' +
            fileName +
            '</li>');
    };

}).call(FileSystem.prototype);

function createFile() {
    var fileName = $('#fileName').val();

    if (fileName) {
        fs.createDriveFile(fileName).then(function(driveFileId, fileName){
            fs.createParseFile(driveFileId, fileName);
            fs.refreshList(driveFileId, fileName);
        }, function(error){
            console.error(error);
        });
    }
    else {
        alert('Please input a file name!');
    }
};