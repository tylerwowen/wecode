define(function(require) {
    "use strict";
    
    // Realtime data structure
    function RealTimeData() {

    }
    (function () {

        this.text = null;
        this.cursors = null;
        this.collaborators = null;

        this.getCurrentUserId = function() {
            for (var i = 0; i < this.collaborators.length; i++) {
                if (this.collaborators[i].isMe) {
                    return this.collaborators[i].userId;
                }
            }
        };

        this.getColor = function(string) {
            return '#' + this.intToRGB(this.hashCode(string));
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