define(function(require) {
    "use strict";

    var $ = require('jquery'),
        gapi = require('gapi'),
        RealtimeUtils = require('lib/realtimeutils');

    var clientId = '315862064112-anadjteqedc54o1tkhg493e0jqntlfve.apps.googleusercontent.com';
    var realtimeUtils = new RealtimeUtils({clientId: clientId});

    // Sets a file's permission
    function insertPermission(fileId, value, type, role) {
        var body = {
            'value': value,
            'type': type,
            'role': role
        };
        var request = gapi.client.drive.permissions.insert({
            'fileId': fileId,
            'resource': body
        });
        request.execute(function (resp) {
        });
    }

    function GoogleAdapter(realtimeDataManager) {
        this.realtimeUtils = realtimeUtils;
        this.dataManager = realtimeDataManager;
    }

    (function() {

        this.constructor = GoogleAdapter;

        this.authorize = function() {
            var deferred = $.Deferred();
            // Attempt to authorize
            realtimeUtils.authorize(function (response) {
                if (response.error) {
                    // Authorization failed because this is the first time the user has used your application,
                    realtimeUtils.authorize(function () {
                        deferred.resolve();
                    }, true);
                } else {
                    deferred.resolve();
                }
            }, false);

            return deferred.promise();
        };

        this.createDriveFile = function (fileName) {
            var deferred = $.Deferred();
            var that = this;
            // Create a new document
            realtimeUtils.createRealtimeFile(fileName, function (createResponse) {
                // Set the file permission to public.
                // This is only for Demo
                insertPermission(createResponse.id, '', 'anyone', 'writer');
                realtimeUtils.load(
                    createResponse.id,
                    function(doc) {
                        that.dataManager.onFileLoaded(doc, createResponse.id);
                    },
                    that.dataManager.onFileInitialize
                );
                deferred.resolve(createResponse.id, fileName);
            });
            return deferred.promise();
        };

        this.loadDriveFile = function(id) {
            var that = this;
            if (id) {
                var isDataCached = this.dataManager.connectWithEditor(id);
                if(!isDataCached) {
                    realtimeUtils.load(id,
                        function (doc) {
                            that.dataManager.onFileLoaded(doc, id);
                        },
                        this.dataManager.onFileInitialize);
                }
            } else {
                this.createDriveFile('untitled');
            }
        };

    }).call(GoogleAdapter.prototype);

    return GoogleAdapter;
});