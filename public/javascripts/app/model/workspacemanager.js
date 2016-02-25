define(function(require) {
    "use strict";

    var Q = require('q'),
        Adapter = require('app/adapters/googlesetupadapter');

    var instance = null;

    function WorkspaceManager() {
        if (instance != null) {
            throw new Error('Cannot instantiate more than one WorkspaceManager, ' +
                'use WorkspaceManager.sharedInstance')
        }
        this.rootFolderId = null;
        this.workspaceList = [];
        this.configId = null;
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
                }).then(function(rootFolderId) {
                    that.configId = rootFolderId[1].id;
                    that.rootFolderId = rootFolderId[0].result.rootFolderId;
                    console.log(that.configId);
                    console.log(that.rootFolderId);
                }).then(function() {
                    return that.getWorkspaceList().then(function(){
                        return that.getStudentClassList();
                    });
                }).then(function(){
                    return [that.workspaceList, that.classList]
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
                    return Q.all([
                        rootFolderId,
                        that.adapter.createConfigurationFile(rootFolderId).then(function(response) {

                        })
                    ]).spread(function(rootFolderId) {
                        return rootFolderId;
                    });
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

        this.getStudentClassList = function () {
            var that = this;

            return this.adapter.getStudentList().then(function(classes){
                that.classList = classes;
                return that.classList;
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
                        return that.adapter.getClassName(classID)
                            .then( function(response) {
                                return className = response;
                            }).then( function (){
                                return that.adapter.loadConfiguration().then(function(response){
                                    var config = response[0];
                                    console.log("pushing " + classID + " " + className);
                                    config.result.joinedClasses.push({
                                        'id': classID,
                                        'name': className
                                    });
                                    return that.adapter.updateConfigurationFile(config.result,that.configId).then(function(response){
                                        return that.getStudentClassList()
                                    });
                                });
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