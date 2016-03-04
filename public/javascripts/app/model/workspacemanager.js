define(function(require) {
    "use strict";

    var Q = require('q'),
        Adapter = require('app/adapters/googlesetupadapter'),
        _ = require('lodash');

    var instance = null;

    function WorkspaceManager() {
        if (instance != null) {
            throw new Error('Cannot instantiate more than one WorkspaceManager, ' +
                'use WorkspaceManager.sharedInstance')
        }
        this.rootFolderId = null;
        this.workspaceList = [];
        this.configFileId = null;
        this.classList = [];
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
                }).then(function(responseArr) {
                    that.rootFolderId = responseArr[0].rootFolderId;
                    that.configFileId = responseArr[1];
                    that.config = responseArr[0];
                    return that.getWorkspaceList();
                });
        };

        this.loadConfiguration = function() {
            var that = this;
            return this.adapter.loadConfiguration().then(function(response) {
                if (response != null) {
                    return response;
                }
                // first time, create rootFolder and configuration
                return that.adapter.createRootFolder().then(function(rootFolderId) {
                    return that.adapter.createConfigurationFile(rootFolderId);
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
                return [that.workspaceList, that.config ? that.config.joinedClasses : null];
            });
        };

        this.refreshWorkspaceList = function() {
            this.workspaceList = [];
            return this.getWorkspaceList();
        };

        this.createWorkSpace = function(workSpaceName) {
            var that = this;
            return this.adapter.createWorkSpace(this.rootFolderId, workSpaceName)
                .then(function(workspace) {
                    return that.adapter.addPublicPermissions(workspace.id);
                });
        };

        this.addClass = function(classID) {
            var that = this;
            var filePermissionID;
            var userPermissionID;
            var className;

            return this.adapter.getUserPermissionID()
                .then( function (response) {
                    userPermissionID = response;

                    return that.adapter.getFilePermissionId(classID);
                }).then( function (response) {
                    console.log(response);
                    filePermissionID = response;

                    if(userPermissionID != filePermissionID){
                        return that.adapter.getWorkspaceName(classID)
                            .then( function(response) {
                                return className = response;
                            }).then( function (){
                                that.config.joinedClasses.push({
                                    'id': classID,
                                    'name': className
                                });
                                // Gets rid/doesn't allow for duplicates
                                that.config.joinedClasses = _.uniqWith(that.config.joinedClasses, _.isEqual);
                                return that.adapter.updateConfigurationFile(that.config,that.configFileId);
                            }).then(function() {
                                return that.config.joinedClasses;
                            });
                    }
                    else{
                        console.log("Can't be a student and a TA in the same class");
                        return null;
                    }
                });
        };

    }).call(WorkspaceManager.prototype);

    WorkspaceManager.sharedInstance = function() {
        if (instance == null) {
            instance = new WorkspaceManager();
        }
        return instance;
    };

    return WorkspaceManager.sharedInstance;
});