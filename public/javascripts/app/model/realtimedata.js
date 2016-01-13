define(function(require) {
    "use strict";

    var ACEAdapter = require('app/model/aceadapter'),
        Cursor = require('app/model/cursor'),
        gapi = require('gapi');

    var bind = function (fn, me) {
        return function () {
            return fn.apply(me, arguments);
        };
    };

    var data = {};

    // Realtime data structure
    function RealTimeData() {
        this.id = null;
        this.text = null;
        this.cursors = null;
        this.collaborators = null;
    }

    function getCurrentUserId(collaborators) {
        for (var i = 0; i < collaborators.length; i++) {
            if (collaborators[i].isMe) {
                return collaborators[i].userId;
            }
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

    function intToRGB(i) {
        var c = (i & 0x00FFFFFF)
            .toString(16)
            .toUpperCase();

        return "00000".substring(0, 6 - c.length) + c;
    }

    function RealTimeDataManager(editor) {
        this.editor = editor;
        this.adapter = new ACEAdapter(editor);
        this.currentData = null;
        this.updateEditorText = bind(this.updateEditorText, this);
        this.updateEditorCursors = bind(this.updateEditorCursors, this);
    }

    (function () {

        this.data = data;

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
        this.onFileLoaded = function(doc, id) {

            var realTimeData = new RealTimeData();
            data[id] = realTimeData;

            realTimeData.id = id;
            realTimeData.text = doc.getModel().getRoot().get('text');
            realTimeData.cursors = doc.getModel().getRoot().get('cursors');
            realTimeData.collaborators = doc.getCollaborators();

            this.connectWithEditor(id);
        };

        // Connects the realtime data to the collaborative string
        this.connectWithEditor = function(id) {
            var realTimeData = data[id];

            if (!realTimeData) {
                return false;
            }
            this.removeAllListeners();
            this.currentData = realTimeData;
            this.editor.setValue(realTimeData.text.getText());

            var currentUserId = getCurrentUserId(realTimeData.collaborators);
            var cursor = realTimeData.cursors.get(currentUserId);

            if (cursor != null) {
                var position = this.adapter.posFromIndex(cursor.selectionEnd);
                this.editor.navigateTo(position.row, position.column);
            }
            else {
                cursor = new Cursor(0, 0);
                realTimeData.cursors.set(currentUserId, cursor);
            }

            this.addRealTimeDataListeners(realTimeData);
            this.adapter.addListeners(realTimeData, currentUserId);
            return true;
        };

        this.addRealTimeDataListeners = function(realTimeData) {
            realTimeData.text.addEventListener(gapi.drive.realtime.EventType.TEXT_INSERTED, this.updateEditorText);
            realTimeData.text.addEventListener(gapi.drive.realtime.EventType.TEXT_DELETED, this.updateEditorText);
            realTimeData.cursors.addEventListener(gapi.drive.realtime.EventType.VALUE_CHANGED, this.updateEditorCursors);
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
                this.adapter.setOtherCursor(cursor, getColor(userId), userId);
            }
        };

        this.removeAllListeners = function() {
            if (this.currentData) {
                this.adapter.detach();
                this.currentData.text.removeAllEventListeners();
                this.currentData.cursors.removeAllEventListeners();
            }
        };


    }).call(RealTimeDataManager.prototype);

    return RealTimeDataManager;

});