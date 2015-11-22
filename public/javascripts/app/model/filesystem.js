define(function(require) {
    "use strict";

    var Parse = require('parse');

    Parse.initialize('mxwTWgOduKziA6I6YTwQ5ZlqSESu52quHsqX0xId',
        'rCQqACMXvizSE5pnZ9p8efewtz8ONwsVAgm2AHCP');

    var WorkSpace = Parse.Object.extend('WorkSpace');
    var File = Parse.Object.extend('File');

    function FileSystem(wsID) {
        this.wsID = wsID;
        this.workSpace = null;
    }

    (function() {

        this.constructor = FileSystem;

        this.getFileList = function() {

            var successful = new Parse.Promise();
            var that = this;

            var query = new Parse.Query(WorkSpace);
            query.get(this.wsID).then(function(fetchedWorkSpace) {
                that.workSpace = fetchedWorkSpace;
                var relation = fetchedWorkSpace.relation('files');
                var query = relation.query();
                return query.find();
            }).then(function (files) {
                successful.resolve(files);
            }, function (error) {
                console.error(error);
            });
            return successful;
        };

        this.createParseFile = function(driveFileId, fileName) {
            var that = this;
            var file = new File();
            file.set('driveFileId', driveFileId);
            file.set('name', fileName);

            file.save().then(function () {
                var relation = that.workSpace.relation('files');
                relation.add(file);
                that.workSpace.save();
            });
        };

    }).call(FileSystem.prototype);

    return FileSystem;
});