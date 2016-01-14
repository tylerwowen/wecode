define(function(require) {
    "use strict";

    var GoogleWorkspaceAdapter = require('app/adapters/googleworkspaceadapter');

    function Folder() {
        this.id = null;
        this.name = null;
        this.googleWorkspaceAdapter = new GoogleWorkspaceAdapter();
    }

    (function () {

        this.load = function () {
            this.googleWorkspaceAdapter.load();
        };

        this.deleteFolder = function (id) {

        };

        this.createFolder = function () {

        };

    }).call(Folder.prototype);

    return Folder;
});