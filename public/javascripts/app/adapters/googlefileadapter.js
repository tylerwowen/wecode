define(function(require) {
    "use strict";

    var Q = require('q'),
        gapi = require('gapi');

    function GoogleFileAdapter() {}


    (function() {

        this.constructor = GoogleFileAdapter;

        /**
         * Loads an existing realtime file.
         * @param {!string} id for the document to load.
         * @export
         */

        this.loadDriveFile = function(id) {
            var deferred = Q.defer();
            gapi.drive.realtime.load(id, function(doc) {
                deferred.resolve(doc);
            },function(){
                deferred.resolve();
            },function(error) {
                deferred.reject(new Error(error));
            });
            return deferred.promise;
        };

    }).call(GoogleFileAdapter.prototype);

    return GoogleFileAdapter;
});