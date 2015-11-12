var clientId = '315862064112-anadjteqedc54o1tkhg493e0jqntlfve.apps.googleusercontent.com';

var editor;
var changeFromGoogle = false;
var collaborativeString;
var realtimeUtils;
var user;
var cursorPosition;
var fs;
var editorObject;
var collabs;
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
    editor.getSession().on('change', editorChangeHandler);
    editor.getSession().getSelection().on("changeCursor", cursorChangeHandler);
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
    editorObject = new EditorObject();
    collabs = doc.getCollaborators();

    editorObject.collaborativeString = doc.getModel().getRoot().get('text');
    editorObject.collaborativeMap = doc.getModel().getRoot().get('cursors');

    editor.setValue(editorObject.collaborativeString.getText());

    currentUserId = getCurrentUserId();
    var cursor = editorObject.collaborativeMap.get(currentUserId);

    if(cursor != null) {
        editor.navigateTo(cursor.row, cursor.column);
    } else {
        cursor = {row: 0, column: 0};
        editorObject.collaborativeMap.set(currentUserId, cursor);
    }

    editor.navigateFileStart();
    wireCodeEditor();
}

function getCurrentUserId() {
    for(var i = 0; i < collabs.length; i++) {
        if(collabs[i].isMe) {
            return collabs[i].userId;
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
function wireCodeEditor() {
    editorObject.collaborativeString.addEventListener(gapi.drive.realtime.EventType.TEXT_INSERTED, updateCodeEditorString);
    editorObject.collaborativeMap.addEventListener(gapi.drive.realtime.EventType.VALUE_CHANGED, updateCodeEditorCursors);
}

function updateCodeEditorString(event) {

    if (!event.isLocal) {
        console.log('collaborativeString is changed');
        changeFromGoogle = true;
        editor.getSession().getDocument().setValue(editorObject.collaborativeString.getText());
        changeFromGoogle = false;
    }
}

function updateCodeEditorCursors(event) {
    if(!event.isLocal) {
        console.log('cursor changed');
        changeFromGoogle2 = true;
        var marker = {};
        for(var i = 0; i < collabs.length; i++) {
            if(!collabs[i].isMe) {
                marker.cursors.push(editorObject.collaborativeMap.get(collabs[i].userId));
            }
        }
        console.log(marker);
        marker.update = function(html, markerLayer, session, config) {
            var start = config.firstRow, end = config.lastRow;
            var cursors = this.cursors;
            for (var i = 0; i < cursors.length; i++) {
                var pos = this.cursors[i];
                if (pos.row < start) {
                    continue;
                } else if (pos.row > end) {
                    break;
                } else {
                    // compute cursor position on screen
                    // this code is based on ace/layer/marker.js
                    var screenPos = session.documentToScreenPosition(pos);

                    var height = config.lineHeight;
                    var width = config.characterWidth;
                    var top = markerLayer.$getTop(screenPos.row, config);
                    var left = markerLayer.$padding + screenPos.column * width;
                    // can add any html here
                    html.push(
                        "<div class='MyCursorClass' style='",
                        "height:", height, "px;",
                        "top:", top, "px;",
                        "left:", left, "px; width:", width, "px'></div>"
                    );
                }
            }
        };
        marker.redraw = function() {
            this.session.signal("changeFrontMarker");
        };
        marker.addCursor = function() {
            // add to this cursors
            //....
            // trigger redraw
            marker.redraw()
        };
        marker.session = editor.getSession();
        marker.session.addDynamicMarker(marker, true);

        changeFromGoogle2 = false;
    }
}


function editorChangeHandler(event) {

    if (!changeFromGoogle) {
        console.log("editor text changed.");
        updateColabrativeString();
    }
}

function updateColabrativeString() {
    if (editorObject.collaborativeString) {
        editorObject.collaborativeString.setText(editor.getSession().getDocument().getValue());
    }
}

function cursorChangeHandler() {
    if (editorObject.collaborativeMap && !changeFromGoogle2) {
        console.log('Cursor ', editor.getSession().getSelection().getCursor());
        editorObject.collaborativeMap.set(currentUserId, editor.getSession().getSelection().getCursor());
    }
}

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