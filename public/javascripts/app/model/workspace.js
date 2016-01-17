define(function (require) {
    "use strict";

    var File = require('app/model/file'),
        Folder = require('app/model/folder');

    function Workspace(id, name, adapter) {
        this.id = id;
        this.name = name;
        this.rootFolder = new Folder(id, name);
        this.contentList = this.rootFolder.contentList;
        this.isShared = false;
        this.adapter = adapter;
    }

    (function () {

        this.constructor = Workspace;

        // Init operations

        this.init = function() {
            return this.getContentsList();
        };

        this.getContentsList = function() {
          return this.rootFolder.load();
        };

        this.refreshContentList = function() {
            return this.rootFolder.reload();
        };

        // File operations

        this.createFile = function(parentId, fileName) {
            var that = this;
            return this.adapter.createFile(parentId, fileName).then(function(file) {
                that.contentList[id] = file;
                return file;
            });
        };

        this.loadFile = function(fileId) {
            return this.contentList[fileId].load();
        };

        this.deleteFile = function(fileId) {
            var that = this;
            return this.adapter.deleteFile(fileId).then(function() {
                delete that.contentList[fileId];
            });
        };

        // Folder operations

        this.createFolder = function(parentId, folderName) {
            var that = this;
            return this.adapter.createFolder(parentId, folderName).then(function(folder) {
                that.contentList[folder.id] = folder;
                return folder;
            });
        };

        this.loadFolderContents = function(folderId) {
            return this.contentList[folderId].load()
        };

        this.deleteFolder = function(folderId) {
            var that = this;
            return this.adapter.deleteFolder(folderId).then(function() {
                delete that.contentList[folderId];
            });
        };

    }).call(Workspace.prototype);

    return Workspace;
});