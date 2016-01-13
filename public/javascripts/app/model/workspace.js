define(function (require) {
    "use strict";

    var File = require('app/model/file'),
        Adapter = require('app/adapters/googleworkspaceadapter');

    function Workspace() {
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
            var contents = this.adapter.getContentsList();
            this.contentList = this.makeContentList(contents);
            return this.contentList;
        };

        this.refreshFileList = function() {
            var contents = this.adapter.getContentsList();
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

        this.createFile = function(dir, fileName) {
            var file = File(fileName);
            this.adapter.createFile(dir, file);
            this.files.push(file);
        };

        this.loadFile = function(fileId) {
            this.getObjectWithId(folderId).load();
        };

        this.deleteFile = function(fileId) {
            this.adapter.deleteFile(fileId);
        };

        // Folder operations

        this.createFolder = function(dir, folderName) {
            this.adapter.createFolder(dir, folderName);
        };

        this.loadFolderContents = function(folderId) {
            this.getObjectWithId(folderId).load()
        };

        this.deleteFolder = function(folderId) {
            this.adapter.deleteFolder(folderId);
        };

        // Helpers
        this.getObjectWithId = function(id) {
            for (var i = 0; i < this.contentList.length; i++) {
                if (this.contentList[i].id == id) {
                    return this.contentList[i];
                }
            }
        }

    }).call(Workspace.prototype);

    return Workspace;
});