define(function (require) {
    "use strict";

    var Q = require('q');
    /**
     *
     * @param id
     * @param name
     * @param adapter this is required to eliminate circular dependency
     * @constructor
     */
    function Folder(id, name, adapter) {
        this.id = id;
        this.name = name;
        this.contentList = null;
        this.adapter = adapter;
    }

    (function () {

        this.constructor = Folder;

        this.load = function () {
            var that = this;
            if (this.contentList != null) {
                return Q.fcall(function () {
                    return that.contentList;
                });
            }
            return this.adapter.getContentsList(this.id).then(function(contents) {
                that.contentList = that.makeContentList(contents);
                return that.contentList;
            });
        };

        this.reload = function() {
            this.contentList = null;
            return this.load();
        };

        this.makeContentList = function(contents) {
            var list = {};
            for (var i = 0; i < contents.length; i++) {
                var id = contents[i].id;
                list[id] = contents[i];
            }
            return list;
        };

    }).call(Folder.prototype);

    return Folder;
});