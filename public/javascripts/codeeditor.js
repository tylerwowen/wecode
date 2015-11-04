var clientId = '315862064112-anadjteqedc54o1tkhg493e0jqntlfve.apps.googleusercontent.com';

window.onload = function() {
    init();
}

var editor;
var collaborativeString;
var changeFromGoogle = false;
var realtimeUtils;

function init() {
    editor = ace.edit("editor");
    editor.setTheme("ace/theme/monokai");
    editor.getSession().setMode("ace/mode/javascript");
    editor.getSession().setUseWrapMode(true);
    editor.getSession().on('change', editorChangeHandler);

    // Create a new instance of the realtime utility with your client ID.
    realtimeUtils = new utils.RealtimeUtils({ clientId: clientId });
    authorize();
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
            start();
        }
    }, false);
}

function start() {
    // With auth taken care of, load a file, or create one if there
    // is not an id in the URL.
    var id = realtimeUtils.getParam('id');
    if (id) {
        // Load the document id from the URL
        realtimeUtils.load(id.replace('/', ''), onFileLoaded, onFileInitialize);
    } else {
        // Create a new document, add it to the URL
        realtimeUtils.createRealtimeFile('WeStudy File', function(createResponse) {
            window.history.pushState(null, null, '?id=' + createResponse.id);
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

// Connects the code editor to the collaborative string
function wireCodeEditor(inputString) {
    //var textArea1 = document.getElementById('text_area_1');
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