
define(function (require) {
    "use strict";

    var gapi = require('gapi');//,
        //File = require('app/model/file'),
        //Folder = require('app/model/folder');

    function WorkspaceAdapter() {

    }

    (function () {

        this.constructor = WorkspaceAdapter;

        /**
         * MimeType for this realtime application.
         * @type {!string}
         */
        this.mimeType = 'application/vnd.google-apps.drive-sdk';

        /**
         * Creates a new realtime file.
         * @param {!string} parentID is the ID of the files parent folder.
         * @param {!string} fileName of the file to be created.
         * @return {!promise} returns a promise
         * @export
         */
        this.createFile = function(parentID, fileName) {
            return gapi.client.load('drive', 'v3').then(function() {
                var insertHash = {
                    'resource': {
                        mimeType: this.mimeType,
                        name: fileName,
                        parents: [parentID]
                    }
                };
                return gapi.client.drive.files.create(insertHash);
            }, function(reason) {
                console.error('drive api was not loaded:', reason.result.error.message);
            }, this);
        };

    }).call(WorkspaceAdapter.prototype);

    return WorkspaceAdapter;
});