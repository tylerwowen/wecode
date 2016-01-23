define(function(require) {
    "use strict";

    var gapi = require('gapi'),
        Cursor = require('app/model/cursor');

    // Realtime data structure
    function RealTimeData(doc) {
        this.text = doc.getModel().getRoot().get('text');
        this.cursors = doc.getModel().getRoot().get('cursors');
        this.collaborators = doc.getCollaborators();
    }

    (function () {

        this.constructor = RealTimeData;

        this.removeAllListeners = function() {
            this.text.removeAllEventListeners();
            this.cursors.removeAllEventListeners();
        };

        this.addTextChangeListener = function(listener) {
            this.text.addEventListener(gapi.drive.realtime.EventType.TEXT_INSERTED, listener);
            this.text.addEventListener(gapi.drive.realtime.EventType.TEXT_DELETED, listener);
        };

        this.addCursorChangeListener = function(listener) {
            this.cursors.addEventListener(gapi.drive.realtime.EventType.VALUE_CHANGED, listener);
        };

        this.getCursorFor = function(id) {
            return this.cursors.get(id);
        };

        this.initCursorFor = function(id) {
            var cursor = new Cursor(0, 0);
            return this.cursors.set(id, cursor);
        };

        this.getCurrentUserId = function() {
            for (var i = 0; i < this.collaborators.length; i++) {
                if (this.collaborators[i].isMe) {
                    return this.collaborators[i].userId;
                }
            }
        };

    }).call(RealTimeData.prototype);

    return RealTimeData;
});