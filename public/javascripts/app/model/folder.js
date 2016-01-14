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
        this.contentlList = null;
        this.adapter = adapter;
    }

    (function () {

        this.constructor = Folder;

        this.load = function () {
            if (this.contentList != null) {
                return this.contentList;
            }
            var that = this;
            return this.adapter.getContentsList(this.id).then(function(contents) {
                that.contentList = that.makeContentList(contents);
                return Q.fcall(function () {
                    return that.contentList;
                });
            });
        };

        this.refreshFileList = function() {
            this.contentList = null;
            return this.getContentsList();
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