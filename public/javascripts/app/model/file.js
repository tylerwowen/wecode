define(function(require) {
    "use strict";

    var RealTimeData = require('app/model/realtimedata');
    var ACEAdapter = require('app/adapters/aceadapter');
    var gapi = require('gapi');

    var bind = function (fn, me) {
        return function () {
            return fn.apply(me, arguments);
        };
    };

    function File(fileName, id, editor, fileAdapter) {
        this.id = id;
        this.name = fileName;
        this.realTimeData = new RealTimeData();
        this.googleFileAdapter = fileAdapter;
        this.editor = editor;
        this.adapter = new ACEAdapter(editor);
        this.currentData = null;
        this.updateEditorText = bind(this.updateEditorText, this);
        this.updateEditorCursors = bind(this.updateEditorCursors, this);
    }

    (function () {

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

            this.realTimeData.text = doc.getModel().getRoot().get('text');
            this.realTimeData.cursors = doc.getModel().getRoot().get('cursors');
            this.realTimeData.collaborators = doc.this.realTimeData.getCollaborators();

            this.connectWithEditor(id);
        };

        // Connects the realtime data to the collaborative string
        this.connectWithEditor = function(id) {

            if (!realTimeData) {
                return false;
            }
            this.removeAllListeners();
                this.currentData = this.realTimeData;
            this.editor.setValue(this.realTimeData.text.getText());

            var currentUserId = this.realTimeData.getCurrentUserId(this.realTimeData.collaborators);
            var cursor = this.realTimeData.cursors.get(currentUserId);

            if (cursor != null) {
                var position = this.adapter.posFromIndex(cursor.selectionEnd);
                this.editor.navigateTo(position.row, position.column);
            }
            else {
                cursor = new Cursor(0, 0);
                this.realTimeData.cursors.set(currentUserId, cursor);
            }

            this.addRealTimeDataListeners(this.realTimeData);
            this.adapter.addListeners(this.realTimeData, currentUserId);
            return true;
        };

        this.removeAllListeners = function() {
            if (this.currentData) {
                this.adapter.detach();
                this.currentData.text.removeAllEventListeners();
                this.currentData.cursors.removeAllEventListeners();
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
                this.adapter.setOtherCursor(cursor, this.realTimeData.getColor(userId), userId);
            }
        };

        this.addRealTimeDataListeners = function(realTimeData) {
            realTimeData.text.addEventListener(gapi.drive.realtime.EventType.TEXT_INSERTED, this.updateEditorText);
            realTimeData.text.addEventListener(gapi.drive.realtime.EventType.TEXT_DELETED, this.updateEditorText);
            realTimeData.cursors.addEventListener(gapi.drive.realtime.EventType.VALUE_CHANGED, this.updateEditorCursors);
        };

        this.load = function () {
            var that = this;

            return this.googleFileAdapter.loadDriveFile(that.id).then(function(doc) {
                if (doc) {
                    console.log("On File Loaded called");
                    that.onFileLoaded(doc);
                }
                else {
                    console.log("On File Initialized called");
                    that.onFileInitialize()
                }
            });
        };

    }).call(File.prototype);

    return File;
});