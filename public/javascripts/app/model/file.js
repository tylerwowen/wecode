define(function(require) {
    "use strict";

    var RealTimeData = require('app/model/realtimedata');

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
        this.aceAdapter = null;
        this.realtimeData = null;

        /**
         * Calls a load function for Google Drive and passes necessary functions.
         * @param {!string} aceAdapter Ace editor adapter
         * @param {!string} fileAdapter GoogleFileAdapter
         */
        this.load = function (aceAdapter, fileAdapter) {

            if (this.realtimeData != null) {
                this.connectWithEditor();
            }
            else {
                this.editor = aceAdapter.ace;
                this.fileAdapter = fileAdapter;
                this.aceAdapter = aceAdapter;
                this.fileAdapter.loadDriveFile(this.id, this.onFileLoaded, this.onFileInitialize);
            }
        };

        /**
         * Initializes a file is opened for the first time,
         * it must be initialized with the document structure.
         * This function will add a collaborative string to our model at the root..
         * @param {!string} model
         */
        this.onFileInitialize = function(model) {
            var string = model.createString();
            model.getRoot().set('text', string);

            var map = model.createMap();
            model.getRoot().set('cursors', map);
        };

        /**
         * After a file has been initialized and loaded,
         * we can access the document.
         * We will wire up the data model to the UI.
         * @param {!string} doc
         */
        this.onFileLoaded = function(doc) {
            this.realtimeData = new RealTimeData(doc);
            this.connectWithEditor();
        };

        /**
         * Connects the realtime data to the collaborative string
         */
        this.connectWithEditor = function() {

            this.removeAllListeners();
            this.editor.setValue(this.realtimeData.text.getText());

            var currentUserId = this.realtimeData.getCurrentUserId();
            var cursor = this.realtimeData.getCursorFor(currentUserId);

            if (cursor != null) {
                var position = this.aceAdapter.posFromIndex(cursor.selectionEnd);
                this.editor.navigateTo(position.row, position.column);
            }
            else {
                this.realtimeData.initCursorFor(currentUserId);
            }

            this.addRealTimeDataListeners();
            this.aceAdapter.addListeners(this.realtimeData, currentUserId);
        };

        /**
         * Removes all the listeners from both realtimeData and ACEAdapter
         */
        this.removeAllListeners = function() {
            if (this.realtimeData) {
                this.aceAdapter.detach();
                this.realtimeData.removeAllListeners();
            }
        };

        this.updateEditorText = function(event) {
            if (!event.isLocal) {
                this.aceAdapter.applyOperation(event)
            }
        };

        this.updateEditorCursors = function(event) {
            if (!event.isLocal) {
                var userId = event.property;
                var cursor = event.newValue;
                this.aceAdapter.setOtherCursor(cursor, this.getColor(userId), userId);
            }
        };

        this.addRealTimeDataListeners = function() {
            this.realtimeData.addTextChangeListener(this.updateEditorText);
            this.realtimeData.addCursorChangeListener(this.updateEditorCursors);
        };

        this.getColor = function(string) {
            return '#' + this.intToRGB(this.hashCode(string));
        };

        this.hashCode = function(str) {
            var hash = 0;
            for (var i = 0; i < str.length; i++) {
                hash = str.charCodeAt(i) + ((hash << 5) - hash);
            }
            return hash;
        };

        this.intToRGB = function(i) {
            var c = (i & 0x00FFFFFF)
                .toString(16)
                .toUpperCase();

            return "00000".substring(0, 6 - c.length) + c;
        };

    }).call(File.prototype);

    return File;
});