define(function(require) {
    "use strict";

    var RealTimeData = require('app/model/realtimedata'),
        ACEAdapter = require('app/adapters/aceadapter'),
        Cursor = require('app/model/cursor'),
        gapi = require('gapi');

    function File(id, fileName) {
        this.id = id;
        this.name = fileName;
        this.updateEditorText = this.updateEditorText.bind(this);
        this.updateEditorCursors = this.updateEditorCursors.bind(this);
        this.onFileLoaded = this.onFileLoaded.bind(this);
        this.onFileInitialize = this.onFileInitialize.bind(this);
    }

    (function () {

        this.constructor = File;
        this.fileAdapter = null;
        this.editor = null;
        this.adapter = null;
        this.realtimeData = null;

        this.load = function (editor, fileAdapter) {
            this.editor = editor;
            this.fileAdapter = fileAdapter;

            if (this.realtimeData != null) {
                this.connectWithEditor();
            }
            else {
                this.adapter = new ACEAdapter(editor);
                this.fileAdapter.loadDriveFile(this.id, this.onFileLoaded, this.onFileInitialize);
            }
        };

        // The first time a file is opened, it must be initialized with the
        // document structure. This function will add a collaborative string
        // to our model at the root.
        this.onFileInitialize = function(model) {
            var string = model.createString();
            model.getRoot().set('text', string);

            var map = model.createMap();
            model.getRoot().set('cursors', map);
        };

        // After a file has been initialized and loaded, we can access the
        // document. We will wire up the data model to the UI.
        this.onFileLoaded = function(doc) {
            this.realtimeData = new RealTimeData();
            this.realtimeData.text = doc.getModel().getRoot().get('text');
            this.realtimeData.cursors = doc.getModel().getRoot().get('cursors');
            this.realtimeData.collaborators = doc.getCollaborators();

            this.connectWithEditor();
        };

        // Connects the realtime data to the collaborative string
        this.connectWithEditor = function() {

            this.removeAllListeners();
            this.editor.setValue(this.realtimeData.text.getText());

            var currentUserId = this.realtimeData.getCurrentUserId();
            var cursor = this.realtimeData.cursors.get(currentUserId);

            if (cursor != null) {
                var position = this.adapter.posFromIndex(cursor.selectionEnd);
                this.editor.navigateTo(position.row, position.column);
            }
            else {
                cursor = new Cursor(0, 0);
                this.realtimeData.cursors.set(currentUserId, cursor);
            }

            this.addRealTimeDataListeners(this.realtimeData);
            this.adapter.addListeners(this.realtimeData, currentUserId);
        };

        this.removeAllListeners = function() {
            if (this.realtimeData) {
                this.adapter.detach();
                this.realtimeData.text.removeAllEventListeners();
                this.realtimeData.cursors.removeAllEventListeners();
            }
        };

        this.updateEditorText = function(event) {
            if (!event.isLocal) {
                this.adapter.applyOperation(event)
            }
        };

        this.updateEditorCursors = function(event) {
            if (!event.isLocal) {
                var userId = event.property;
                var cursor = event.newValue;
                this.adapter.setOtherCursor(cursor, this.realtimeData.getColor(userId), userId);
            }
        };

        this.addRealTimeDataListeners = function() {
            this.realtimeData.text.addEventListener(gapi.drive.realtime.EventType.TEXT_INSERTED, this.updateEditorText);
            this.realtimeData.text.addEventListener(gapi.drive.realtime.EventType.TEXT_DELETED, this.updateEditorText);
            this.realtimeData.cursors.addEventListener(gapi.drive.realtime.EventType.VALUE_CHANGED, this.updateEditorCursors);
        };

    }).call(File.prototype);

    return File;
});