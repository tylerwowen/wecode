define(function (require) {
    "use strict";

    var File = require('app/model/file'),
        Folder = require('app/model/folder'),
        Adapter = require('app/adapters/googleworkspaceadapter');

    function Workspace(id) {
        this.id = id;
        this.contentList = {};
        this.isShared = false;
        this.adapter = new Adapter();
    }

    (function () {

        this.constructor = Workspace;

        // List operations

        this.getContentsList = function() {
            if (this.contentList.length > 0) {
                return this.contentList;
            }
            var contents = this.adapter.getContentsList(this.id);
            this.contentList = this.makeContentList(contents);
            return this.contentList;
        };

        this.refreshFileList = function() {
            var contents = this.adapter.getContentsList(this.id);
            this.contentList = this.makeContentList(contents);
        };

        this.makeContentList = function(contents) {
            var list = {};
            for (var i = 0; i < contents.length; i++) {
                var id = contents[i].id;
                list[id] = contents[i];
            }
            return list;
        };

        // File operations

        this.createFile = function(parentId, fileName) {
            var file;
            return this.adapter.createFile(parentId, fileName).then(function(response) {
                var id = response.result.name.id;
                file = File(fileName, id);
                this.contentList[id] = file;
            }, function(reason) {
                console.error(name, 'was not created:', reason.result.error.message);
            });
        };

        this.loadFile = function(fileId) {
            this.contentList[fileId].load();
        };

        this.deleteFile = function(fileId) {
            this.adapter.deleteFile(fileId);
            delete this.contentList[fileId];
        };

        // Folder operations

        this.createFolder = function(parentId, folderName) {
            var folder;
            return this.adapter.createFolder(parentId, folderName).then(function(response) {
                var id = response.result.name.id;
                folder = Folder(folderName, id);
                this.contentList[id] = folder;
            }, function(reason) {
                console.error(name, 'was not created:', reason.result.error.message);
            });
        };

        this.loadFolderContents = function(folderId) {
            this.contentList[folderId].load()
        };

        this.deleteFolder = function(folderId) {
            this.adapter.deleteFolder(folderId);
            delete this.contentList[folderId];
        };

    }).call(Workspace.prototype);

    return Workspace;
});