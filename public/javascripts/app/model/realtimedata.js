define(function(require) {
    "use strict";
    
    // Realtime data structure
    function RealTimeData() {
        this.text = null;
        this.cursors = null;
        this.collaborators = null;
    }
    (function () {
        this.getCurrentUserId = function(collaborators) {
            for (var i = 0; i < collaborators.length; i++) {
                if (collaborators[i].isMe) {
                    return collaborators[i].userId;
                }
            }
        };

        this.getColor = function(string) {
            return '#' + intToRGB(hashCode(string));
        };

        this.hashCode = function(str) {
            var hash = 0;
            for (var i = 0; i < str.length; i++) {
                hash = str.charCodeAt(i) + ((hash << 5) - hash);
            }
            return hash;
        };

        this.intToRGB = function(i) {
            var c = (i & 0x00FFFFFF)
                .toString(16)
                .toUpperCase();

            return "00000".substring(0, 6 - c.length) + c;
        };

    }).call(RealTimeData.prototype);

    return RealTimeData;

});