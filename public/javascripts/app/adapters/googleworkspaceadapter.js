
define(function (require) {
    "use strict";

    var gapi = require('gapi');//,
    //File = require('app/model/file'),
    //Folder = require('app/model/folder');

    function WorkspaceAdapter() {

    }

    (function () {

        this.constructor = WorkspaceAdapter;

        this.load = function() {
            return gapi.client.load('drive', 'v3');
        };

        /**
         * MimeType for this realtime application.
         * @type {!string}
         */
        this.realtimeMimeType = 'application/vnd.google-apps.drive-sdk';
        this.folderMimeType = 'application/vnd.google-apps.folder';

        /**
         * Creates a new realtime file.
         * @param {!string} parentID is the ID of the file's parent folder.
         * @param {!string} fileName of the file to be created.
         * @return {!promise} returns a promise
         * @export
         */
        this.createFile = function(parentID, fileName) {
            var insertHash = {
                'resource': {
                    mimeType: this.realtimeMimeType,
                    name: fileName,
                    parents: [parentID]
                }
            };
            return gapi.client.drive.files.create(insertHash);
        };

        /**
         * Delete a realtime file.
         * @param {!string} fileId of the file to be created.
         * @return {!promise} returns a promise
         * @export
         */
        this.deleteFile = function(fileId) {
            var request = {
                'fileId': fileId
            };
            return gapi.client.drive.files.delete(request);

        };

        /**
         * Creates a new folder.
         * @param {!string} parentID is the ID of the folder's parent folder.
         * @param {!string} folderName of the file to be created.
         * @return {!promise} returns a promise
         * @export
         */
        this.createFolder = function(parentID, folderName) {
            return gapi.client.load('drive', 'v3').then(function() {
                var insertHash = {
                    'resource': {
                        mimeType: this.folderMimeType,
                        name: folderName,
                        parents: [parentID]
                    }
                };
                return gapi.client.drive.files.create(insertHash);
            }, function(reason) {
                console.error('drive api was not loaded:', reason.result.error.message);
            }, this);
        };

        /**
         * Delete a folder.
         * @param {!string} folderId of the file to be created.
         * @return {!promise} returns a promise
         * @export
         */
        this.deleteFolder = function(folderId) {
            this.deleteFile(folderId);
        };

    }).call(WorkspaceAdapter.prototype);

    return WorkspaceAdapter;
});