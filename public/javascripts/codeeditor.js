

var editor = ace.edit("editor");
editor.setTheme("ace/theme/monokai");
editor.getSession().setMode("ace/mode/javascript");
editor.getSession().setUseWrapMode(true);

var collaborativeString;

var clientId = '863094468582-16kemg10hk5ac7i4ud35lrkjd183o725.apps.googleusercontent.com';

if (!/^([0-9])$/.test(clientId[0])) {
    alert('Invalid Client ID - did you forget to insert your application Client ID?');
}
// Create a new instance of the realtime utility with your client ID.
var realtimeUtils = new utils.RealtimeUtils({ clientId: clientId });

authorize();

function authorize() {
    // Attempt to authorize
    realtimeUtils.authorize(function(response) {
        // Commented out the code below since we should not have a button anymore
        //if(response.error){
        //    // Authorization failed because this is the first time the user has used your application,
        //    // show the authorize button to prompt them to authorize manually.
        //    var button = document.getElementById('auth');
        //    button.classList.add('visible');
        //    button.addEventListener('click', function () {
        //        realtimeUtils.authorize(function(response){
        //            start();
        //        }, true);
        //    });
        //} else {
        start();
        //}
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
        realtimeUtils.createRealtimeFile('New Quickstart File', function(createResponse) {
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

var changeFromGoogle = false;

var updateCodeEditorString = function(event ){
    if (!event.isLocal) {
        console.log('collaborativeString is changed');
        changeFromGoogle = true;
        editor.getSession().getDocument().setValue(collaborativeString.getText());
        changeFromGoogle = false;
    }
}

editor.getSession().on('change', function(e){
    if (!changeFromGoogle) {
        console.log("editor text changed.");
        updateColabrativeString();
    }
});

function updateColabrativeString() {
    collaborativeString.setText(editor.getSession().getDocument().getValue());
}