define(function(require) {
    "use strict";

    var $ = require('jquery'),
        gapi = require('gapi');

    function GoogleFileAdapter(file) {
        this.file = file;
    }

    (function() {

        this.constructor = GoogleFileAdapter;

        /**
         * Loads an existing realtime file.
         * @param {!string} id for the document to load.
         * @export
         */

        // Function from RealtimeUtils:
        // load: function(documentId, onFileLoaded, initializeModel) {
        //    var that = this;
        //    gapi.drive.realtime.load(documentId, function(doc) {
        //        window.doc = doc;  // Debugging purposes
        //        onFileLoaded(doc);
        //    }, initializeModel, this.onError);
        // },

        this.loadDriveFile = function(id) {
            var that = this;
            if (id) {
                var isDataCached = this.file.connectWithEditor(id);
                if(!isDataCached) {
                    gapi.drive.realtime.load(id, function(doc) {
                        that.file.onFileLoaded(doc, id);
                    }, this.file.onFileInitialize. this.onError);
                }
                return true;
            } else {
                return false;
            }
        };

    }).call(GoogleFileAdapter.prototype);

    return GoogleFileAdapter;
});