define(function(require) {
    "use strict";

    var WorkSpace = require('app/model/file'),
        Adapter = require('app/adapters/googleworkspaceadapter');

    function WorkspaceManager() {

        this.workspaceList = [];

    }

    (function(){

        this.constructor = WorkspaceManager;

        this.getWorkSpaceList = function() {

            var successful = new Parse.Promise();
            var relation = Parse.User.current().relation('workSpaceList');
            var query = relation.query();

            query.find().then(function(workSpaceList) {
                successful.resolve(workSpaceList);
            }, function(error) {
                console.error(error);
            });
            return successful;
        };

        this.saveWorkSpace = function(workSpaceId) {

            var successful = new Parse.Promise();
            var user = Parse.User.current();
            var query = new Parse.Query(WorkSpace);

            query.get(workSpaceId).then(function(workSpace) {
                var relation = user.relation('workSpaceList');
                relation.add(workSpace);
                user.save().then(function() {
                    successful.resolve();
                });
            }, function(error) {
                console.error(error);
                alert('We cannot find the work space id. Please check it.');
            });
            return successful;
        };

    }).call(WorkspaceManager.prototype);

    return WorkspaceManager;
});