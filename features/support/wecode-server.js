/**
 * Starts a node server listening on port 3001.  Closes the server when
 * the test suite has finished
 */

module.exports = function () {
    var server = require('../../bin/www');

    this.registerHandler('AfterFeatures', function (event, callback) {
        server.close();
        callback();
    });
};
