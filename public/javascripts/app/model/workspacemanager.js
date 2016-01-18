define(function(require) {
    "use strict";

    var Q = require('q'),
        Adapter = require('app/adapters/googlesetupadapter');

    function WorkspaceManager() {
        this.rootFolderId = null;
        this.workspaceList = [];
        this.adapter = new Adapter();
    }

    (function(){

        this.constructor = WorkspaceManager;

        // Init operations
        this.init = function() {
            var that = this;
            return this.adapter.load()
                .then(function() {
                    return that.loadConfiguration();
                }).then(function(rootFolderId) {
                    that.rootFolderId = rootFolderId;
                    return that.getWorkspaceList();
            });
        };

        this.loadConfiguration = function() {
            var that = this;
            return this.adapter.loadConfiguration().then(function(rootFolderId) {
                if (rootFolderId != null) {
                    return rootFolderId;
                }
                // first time, create rootFolder and configuration
                return that.adapter.createRootFolder().then(function(rootFolderId) {
                    that.adapter.createConfigurationFile(rootFolderId);
                    return rootFolderId;
                });
            });
        };

        this.getWorkspaceList = function() {
            var that = this;
            if (this.workspaceList.length != 0) {
                return Q.fcall(function () {
                    return that.workspaceList;
                });
            }
            return this.adapter.getWorkspaceList(this.rootFolderId).then(function(contents) {
                that.workspaceList = contents;
                return that.workspaceList;
            });
        };

        this.refreshWrokspaceList = function() {
            this.workspaceList = [];
            return this.getWorkspaceList();
        };

        this.createWorkSpace = function(workSpaceId) {

        };

    }).call(WorkspaceManager.prototype);

    return WorkspaceManager;
});