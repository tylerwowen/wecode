define(function (require) {
    "use strict";

    var $ = require('jquery'),
        ace = require('ace/ace'),
        Workspace = require('app/model/workspace'),
        WorkspaceAdapter = require('app/adapters/googleworkspaceadapter'),
        FileAdapter = require('app/adapters/googlefileadapter');

    ace.config.set("packaged", true);
    ace.config.set("basePath", require.toUrl("ace"));


    function Controller() {

        this.workspaceAdapter = new WorkspaceAdapter();
        this.fileAdapter = new FileAdapter();

        this.editor = ace.edit('editor');
        this.editor.setTheme("ace/theme/monokai");
        this.editor.getSession().setMode("ace/mode/javascript");
        this.editor.getSession().setUseWrapMode(true);
        this.editor.$blockScrolling = Infinity;
    }

    (function () {

        this.constructor = Controller;

        this.workspace = null;

        this.init = function() {
            var that = this;
            this.fileAdapter.load();
            this.workspaceAdapter.load().then(function() {
                that.loadWorkspace();
                that.connectToView();
            });
        };

        this.loadWorkspace = function() {
            var that = this;
            var wsID = this.getParam('id');
            var wsName = this.getParam('name');
            // Get a list of files from work space with wsID
            this.workspace = new Workspace(wsID, wsName, this.workspaceAdapter);
            this.workspace.getContentsList().then(function (contents) {
                that.showList(contents);
            });
        };

        this.connectToView = function() {
            var that = this;
            $('#fileButton').click(function () {
                that.workspace.createFile(that.workspace.id, $('#fileName').val());
            });

            $('#files').on('click', 'li.file', function () {
                var id = $(this).attr('id');
                that.workspace.loadFile(id, that.editor, that.fileAdapter);
            });

            $('#files').on('click', 'li.folder', function () {
                var id = $(this).attr('id');
                that.workspace.loadFolderContents(id);
            });

            $('#refreshButton').click(function () {
                $('#files').empty();
                that.loadWorkspace();
            });

        };

        this.createFile = function(fileName) {
            if (fileName) {
                $.when(googleAdapter.createDriveFile(fileName)).then(function (driveFileId, fileName) {
                    fs.createParseFile(driveFileId, fileName);
                    refreshList(driveFileId, fileName);
                });
            }
            else {
                alert('Please input a file name!');
            }
        };

        this.showList = function(contents) {
            if (contents != null) {
                for (var id in contents) {
                    if (contents.hasOwnProperty(id)) {
                        if (contents[id].constructor.name == 'File') {
                            $('#files').append(
                                '<li style="color:white" class="file" id="' + id + '">' +
                                contents[id].name +
                                '</li>');
                        }
                        if (contents[id].constructor.name == 'Folder') {
                            $('#files').append(
                                '<li style="color:white" class="folder" id="' + id + '">' +
                                contents[id].name +
                                '</li>');
                        }
                    }
                }
            }
            else {
                createFile('Demo');
            }
        };

        this.refreshList = function(driveFileId, fileName) {
            $('#fileName').val('');
            $('#files').append(
                '<li style="color:white" class="file" id="' + driveFileId + '">' +
                fileName +
                '</li>');
        };

        /**
         * Examines url query parameters for a specific parameter.
         * @param {!string} urlParam to search for in url parameters.
         * @return {?(string)} returns match as a string of null if no match.
         * @export
         */
        this.getParam = function(urlParam) {
            var regExp = new RegExp(urlParam + '=(.*?)($|&)', 'g');
            var match = window.location.search.match(regExp);
            if (match && match.length) {
                match = match[0];
                match = match.replace(urlParam + '=', '').replace('&', '');
            } else {
                match = null;
            }
            return match;
        };


    }).call(Controller.prototype);

    return Controller;
});