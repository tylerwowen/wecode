define(function (require) {
    "use strict";

    var gapi = require('gapi'),
        Q = require('q');

    function SetupAdapter() {
    }

    (function(){
        this.constructor = SetupAdapter;

        this.rootFolderName = 'WeCodeApplicationData';
        this.folderMimeType = 'application/vnd.google-apps.folder';

        this.load = function() {
            var deferred = Q.defer();
            gapi.load('client', function(){
                gapi.client.load('drive', 'v3').then(function() {
                    deferred.resolve();
                });
            });
            return deferred.promise;
        };

        this.createConfigurationFile = function(rootFolderId) {
            var boundary = '-------314159265358979323846';
            var delimiter = "\r\n--" + boundary + "\r\n";
            var close_delim = "\r\n--" + boundary + "--";

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
            }).then(function(response) {
                console.log(response);
                return response;
            }, function(error) {
                console.error(error);
            });
        };

        this.updateConfigurationFile = function(config, configFileId) {
            var body = JSON.stringify(config);

            return gapi.client.request({
                'path': '/upload/drive/v3/files',
                'method': 'PATCH',
                'params': {
                    'fileId': configFileId,
                    'uploadType': 'media'
                },
                'headers': {
                    'Content-Type': 'Content-Type: application/json\r\n\r\n'
                },
                'body': body
            }).then(function(response) {
                console.log(response);
                return response;
            }, function(error) {
                console.error(error);
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
                        console.log(response.result.files);
                        console.log(response.result.files[0].id);
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
         * Create a link to a file in google that allows the file to be edited by anyone
         * @param {object} fileId - the file in google to add permissions to
         * @returns a promise for the passed file
         */
        this.addPublicPermissions = function(fileId) {
            return gapi.client.drive.permissions.create({
                fileId: fileId,
                resource: {
                    type: 'anyone',
                    role: 'writer',
                    withLink: true
                }
            });
        };

        this.getUserPermissionID = function (){
            return gapi.client.drive.about.get(
                {fields:'user'}
            ).then(function(response) {
                    return response.result.user.permissionId;
                });
        };

        this.getFilePermissionId = function (classID){
            return gapi.client.drive.permissions.list({
                fileId: classID
            }).then(function(response) {
                return response.result.permissions[0].id;
            }).then(function(permissionsId) {
                return permissionsId;
            });
        };

        this.getClassList = function(folderId) {
            console.log("in classList");
            var that = this;

            return gapi.client.drive.files.get(
                {fileId: folderId}
            ).then(function(response) {
                    var contentList ={
                        id: response.result.id,
                        name: response.result.name
                    };
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
                        contentList[i] = {
                            id: workspaces[i].id,
                            name: workspaces[i].name
                        };
                    }
                }
                return contentList;
            });
        };

        this.createRootFolder = function() {
            var folderName = this.rootFolderName;
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

        this.createWorkSpace = function(parentID, folderName) {
            var request = {
                'resource': {
                    mimeType: this.folderMimeType,
                    name: folderName,
                    parents: [parentID]
                }
            };
            return gapi.client.drive.files.create(request)
                .then(function(response) {
                    return {
                        id: response.result.id,
                        name: response.result.name
                    };
                });
        };

        this.deleteFile = function(fileId) {
            var request = {
                'fileId': fileId
            };
            return gapi.client.drive.files.delete(request);
        };
    }).call(SetupAdapter.prototype);

    return SetupAdapter;
});