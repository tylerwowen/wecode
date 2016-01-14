define(function(require) {
    "use strict";

    var ACEAdapter = require('app/model/aceadapter'),
        Cursor = require('app/model/cursor'),
        gapi = require('gapi');

    var bind = function (fn, me) {
        return function () {
            return fn.apply(me, arguments);
        };
    };

    var data = {};

    // Realtime data structure
    function RealTimeData() {
        this.id = null;
        this.text = null;
        this.cursors = null;
        this.collaborators = null;
    }

    function getCurrentUserId(collaborators) {
        for (var i = 0; i < collaborators.length; i++) {
            if (collaborators[i].isMe) {
                return collaborators[i].userId;
            }
        }
    }

    function getColor(string) {
        return '#' + intToRGB(hashCode(string));
    }

    function hashCode(str) {
        var hash = 0;
        for (var i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        return hash;
    }

    function intToRGB(i) {
        var c = (i & 0x00FFFFFF)
            .toString(16)
            .toUpperCase();

        return "00000".substring(0, 6 - c.length) + c;
    }



});