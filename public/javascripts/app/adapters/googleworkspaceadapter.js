define(function (require) {
    "use strict";

    var gapi = require('gapi'),
        Q = require('q'),
        File = require('app/model/file'),
        Folder = require('app/model/folder');

    function WorkspaceAdapter() {

    }

    (function () {

        this.constructor = WorkspaceAdapter;

        this.load = function() {
            var deferred = Q.defer();
            gapi.load('client', function(){
                gapi.client.load('drive', 'v3').then(function() {
                    deferred.resolve();
                });
            });
            return deferred.promise;
        };

        /**
         * MimeType for this realtime application.
         * @type {!string}
         */
        this.realtimeMimeType = 'application/vnd.google-apps.drive-sdk';
        this.folderMimeType = 'application/vnd.google-apps.folder';

        /**
         * Fetches all the files(folders as well) under a folder
         * @param {!string} folderId is the ID of the folder.
         * @return {!promise} returns a promise
         * @export
         */
        this.getContentsList = function(folderId) {
            var that = this;
            var request = {
                q: "'" + folderId + "'" + ' in parents'
            };
            return gapi.client.drive.files.list(request).then(function(response) {
                var files = response.result.files;
                var contentList = [];
                for (var i = 0; i < files.length; i++) {
                    if (files[i].mimeType.includes(that.realtimeMimeType)) {
                        contentList[i] = new File(response.result.name.id, fileName);
                    }
                    else if (files[i].mimeType == that.folderMimeType) {
                        contentList[i] = new Folder(files[i].id, files[i].name, that);
                    }
                }
                return contentList;
            });
        };

        /**
         * Creates a new realtime file.
         * @param {!string} parentID is the ID of the file's parent folder.
         * @param {!string} fileName of the file to be created.
         * @return {!promise} returns a promise
         * @export
         */
        this.createFile = function(parentID, fileName) {
            var request = {
                'resource': {
                    mimeType: this.realtimeMimeType,
                    name: fileName,
                    parents: [parentID]
                }
            };
            return gapi.client.drive.files.create(request).then(function(response) {
                return new File(response.result.name.id, fileName);
            });
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
            var that = this;
            var request = {
                'resource': {
                    mimeType: this.folderMimeType,
                    name: folderName,
                    parents: [parentID]
                }
            };
            return gapi.client.drive.files.create(request)
                .then(function(response) {
                    var id = response.result.id;
                    return new Folder(id, folderName, that);
                });
        };

        /**
         * Delete a folder.
         * @param {!string} folderId of the file to be created.
         * @return {!promise} returns a promise
         * @export
         */
        this.deleteFolder = function(folderId) {
            return this.deleteFile(folderId);
        };

    }).call(WorkspaceAdapter.prototype);

    return WorkspaceAdapter;
});