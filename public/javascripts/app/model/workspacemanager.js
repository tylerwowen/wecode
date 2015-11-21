define(function(require) {
    "use strict";

    var Parse = require('parse');

    Parse.initialize('mxwTWgOduKziA6I6YTwQ5ZlqSESu52quHsqX0xId',
        'rCQqACMXvizSE5pnZ9p8efewtz8ONwsVAgm2AHCP');

    var WorkSpace = Parse.Object.extend('WorkSpace');
    var File = Parse.Object.extend('File');


    function createWorkSpace() {

        var workSpace = new WorkSpace();
        var relation = workSpace.relation('files');
        var user = Parse.User.current();

        var query = new Parse.Query(File);
        query.get("Zw0gCNNahz").then(function(fetchedFile) {
            relation.add(fetchedFile)
        }).then(function(){
            return workSpace.save();
        }).then(function() {
            var userWorkSpaceRelation = user.relation('workSpaceList');
            userWorkSpaceRelation.add(workSpace);
            user.save();
        }, function(error) {
            console.error(error);
        });
    }

    return {

        getWorkSpaceList: function() {

            var successful = new Parse.Promise();
            var relation = Parse.User.current().relation('workSpaceList');
            var query = relation.query();

            query.find().then(function(workSpaceList) {
                successful.resolve(workSpaceList);
            }, function(error) {
                console.error(error);
            });
            return successful;
        },

        saveWorkSpace: function(workSpaceId) {

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
        }
    }
});