define(function (require) {
    "use strict";

    var gapi = require('gapi'),
        File = require('app/model/file'),
        Folder = require('app/model/folder'),
        Workspace = require('app/model/workspace');

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


        this.createConfigurationFile = function(rootFolderId) {
            const boundary = '-------314159265358979323846';
            const delimiter = "\r\n--" + boundary + "\r\n";
            const close_delim = "\r\n--" + boundary + "--";

            var metadata = {
                'name': 'config.json',
                'mimeType': 'application/json',
                'parents': [ 'appDataFolder']
            };

            var configuration = JSON.stringify({
                'rootFolderId': rootFolderId
            });

            var body =
                delimiter +
                'Content-Type: application/json\r\n\r\n' +
                JSON.stringify(metadata) +
                delimiter +
                'Content-Type: application/json\r\n\r\n' +
                configuration +
                close_delim;

            return gapi.client.request({
                'path': '/upload/drive/v3/files',
                'method': 'POST',
                'params': {'uploadType': 'multipart'},
                'headers': {
                    'Content-Type': 'multipart/mixed; boundary="' + boundary + '"'
                },
                'body': body
            });
        };

        this.loadConfiguration = function() {
            var request = {
                spaces: 'appDataFolder',
                q: 'name = "config.json"'
            };
            return gapi.client.drive.files.list(request)
                .then(function(response) {
                    if (response.result.files.length < 1) {
                        return null;
                    }
                    if (response.result.files[0].name == 'config.json') {
                        return gapi.client.drive.files.get({
                            fileId: response.result.files[0].id,
                            alt: 'media'
                        }).then(function(json) {
                            return JSON.parse(json.body).rootFolderId;
                        });
                    }
                });
        };

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
                        //contentList[i] = new File(files[i].name);
                    }
                    else if (files[i].mimeType == that.folderMimeType) {
                        contentList[i] = new Folder(files[i].id, files[i].name, that);
                    }
                }
                return contentList;
            });
        };

        /**
         * Fetches all the workspace
         * @param {!string} folderId is the ID of the root folder.
         * @return {!promise} returns a promise
         * @export
         */
        this.getWorkspaceList = function(folderId) {
            var that = this;
            var request = {
                q: "'" + folderId + "'" + ' in parents'
            };
            return gapi.client.drive.files.list(request).then(function(response) {
                var workspaces = response.result.files;
                var contentList = [];
                for (var i = 0; i < workspaces.length; i++) {
                    if (workspaces[i].mimeType == that.folderMimeType) {
                        contentList[i] = new Workspace(workspaces[i].id, workspaces[i].name, that);
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

        this.createRootFolder = function() {
            var folderName = 'WeCodeApplicationData';
            var request = {
                'resource': {
                    mimeType: this.folderMimeType,
                    name: folderName
                }
            };
            return gapi.client.drive.files.create(request)
                .then(function(response) {
                    return response.result.id;
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

        // Sets a file's permission
        this.insertPermission = function(fileId, value, type, role) {
            var body = {
                'value': value,
                'type': type,
                'role': role
            };
            var request = {
                'fileId': fileId,
                'resource': body
            };
            return gapi.client.drive.permissions.create(request);
        }

    }).call(WorkspaceAdapter.prototype);

    return WorkspaceAdapter;
});