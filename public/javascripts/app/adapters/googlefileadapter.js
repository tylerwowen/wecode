define(function(require) {
    "use strict";

    var $ = require('jquery'),
        gapi = require('gapi'),
        RealTimeUtils = require('lib/realtimeutils');

    var clientId = '315862064112-anadjteqedc54o1tkhg493e0jqntlfve.apps.googleusercontent.com';
    var realtimeUtils = new RealTimeUtils({clientId: clientId});

    function GoogleFileAdapter(realTimeData) {
        this.realtimeUtils = realtimeUtils;
        this.realTimeData = realTimeData;
    }

    (function() {

        this.constructor = GoogleFileAdapter;

        this.loadDriveFile = function(id) {
            var that = this;
            if (id) {
                var isDataCached = this.realTimeData.connectWithEditor(id);
                if(!isDataCached) {
                    realtimeUtils.load(id,
                        function (doc) {
                            that.realTimeData.onFileLoaded(doc, id);
                        },
                        this.realTimeData.onFileInitialize);
                }
            } else {
                this.createDriveFile('untitled');
            }
        };

    }).call(GoogleFileAdapter.prototype);

    return GoogleFileAdapter;
});