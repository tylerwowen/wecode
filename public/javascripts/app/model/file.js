define(function(require) {
    "use strict";

    var RealTimeData = require('app/model/realtimedata');
    var RealTimeUtils = require('lib/realtimeutils');
    var GoogleFileAdapter = require('app/adapters/googlefileadapter');


    function File(id, fileName) {
        this.id = id;
        this.name = fileName;
        this.realTimeUtils = new RealTimeUtils();
        this.realTimeData = new RealTimeData();
        this.googleFileAdapter = new GoogleFileAdapter(this.realTimeData);
    }

    (function () {

        this.load = function (id) {
            this.googleFileAdapter.loadDriveFile(id);
        };

        this.deleteFile = function (id) {

        };

        this.createFile = function () {

        };

    }).call(File.prototype);

    return File;
});