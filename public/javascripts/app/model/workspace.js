define(function (require) {
    "use strict";

    var Folder = require('app/model/folder');

    function Workspace(id, name, adapter) {
        this.id = id;
        this.name = name;
        this.rootFolder = new Folder(id, name, adapter);
        this.adapter = adapter;
    }

    (function () {

        this.constructor = Workspace;

        this.contentList = null;
        this.isShared = false;


        // Init operations

        this.init = function() {
            return this.getContentsList();
        };

        this.getContentsList = function() {
            var that = this;
            return this.rootFolder.load().then(function() {
                that.contentList = that.rootFolder.contentList;
                return that.contentList;
            });
        };

        this.refreshContentList = function() {
            return this.rootFolder.update();
        };

        // File operations

        this.createFile = function(parentId, fileName) {
            var that = this;
            return this.adapter.createFile(parentId, fileName).then(function(file) {
                that.contentList[file.id] = file;
                return file;
            });
        };

        this.loadFile = function(fileId, aceAdapter, fileAdapter) {
            return this.contentList[fileId].load(aceAdapter, fileAdapter);
        };

        this.unloadFile = function(fileId) {
            return this.contentList[fileId].removeAllListeners();
        };

        this.deleteFile = function(fileId) {
            var that = this;
            this.unloadFile(fileId);
            return this.adapter.deleteFile(fileId).then(function() {
                delete that.contentList[fileId];
            });
        };

        // Folder operations

        this.createFolder = function(parentId, folderName) {
            var that = this;
            return this.adapter.createFolder(parentId, folderName).then(function(folderId) {
                that.contentList[folderId] = new Folder(folderId, folderName, that.adapter);
                return that.contentList[folderId];
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