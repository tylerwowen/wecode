define(function (require) {
    "use strict";

    var $ = require('jquery'),
        ace = require('ace/ace'),
        Workspace = require('app/model/workspace'),
        WorkspaceAdapter = require('app/adapters/googleworkspaceadapter'),
        FileAdapter = require('app/adapters/googlefileadapter'),
        ACEAdapter = require('app/adapters/aceadapter');

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

        this.aceAdapter = new ACEAdapter(this.editor);
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

        this.refreshWorkSpace = function() {
            $('#files').empty();
            this.loadWorkspace();
        };

        this.connectToView = function() {
            var that = this;
            $('#fileButton').click(function() {
                that.createFile($('#fileName').val());
            });

            $('#files').on('click', 'li.file', function(event) {
                var id = $(this).attr('id');
                that.workspace.loadFile(id, that.aceAdapter, that.fileAdapter);
            });

            $('#files').on('click', 'li.folder', function() {
                var id = $(this).attr('id');
                that.workspace.loadFolderContents(id);
            });

            $('#files').on('contextmenu','li.content', function(event) {
                console.log('right clicked');
                var id = $(this).attr('id');
                $("#rmenu").css('top', event.pageY);
                $("#rmenu").css('left', event.pageX);
                $("#rmenu").attr('contentId', id);
                $("#rmenu").show();

                window.event.returnValue = false;
            });

            $(document).on('click', function() {
                $("#rmenu").hide();
                $("#rmenu").removeAttr('contentId');
            });

            $('#refreshButton').on('click', function() {
                that.refreshWorkSpace();
            });

            $('#renameContent').on('click', function() {
                var id = $(this).parents('div').attr('contentId');
                that.renameFile(id);
            });

            $('#deleteContent').on('click', function() {
                var id = $(this).parents('div').attr('contentId');
                that.deleteFile(id);
            });
        };

        this.showList = function(contents) {
            var that = this;

            if (contents != null) {
                for (var id in contents) {
                    if (contents.hasOwnProperty(id)) {
                        if (contents[id].constructor.name == 'File') {
                            var file =  '<li style="color:white" class="content file" id=' + id + '>' +
                                contents[id].name +
                                '</li>';
                            $('#files').append(file);
                        } else if (contents[id].constructor.name == 'Folder') {
                            var folder = '<li style="color:white" class="content folder" id="' + id + '">' +
                                contents[id].name +
                                '</li>';
                            $('#files').append(folder);
                        }
                    }
                }
            }
            else {
                this.workspace.createFile(this.workspace.id, 'demo')
                    .then(function (file) {
                        that.addContentToList(file.id, file.name);
                    });
            }

        };

        this.addContentToList = function(contentId, fileName) {
            $('#fileName').val('');
            $('#files').append(
                '<li style="color:white" class="file content" id="' + contentId + '">' +
                fileName +
                '</li>');
        };

        this.createFile = function(fileName) {
            if (fileName) {
                var that = this;
                this.workspace.createFile(that.workspace.id, fileName)
                    .then(function (file) {
                    that.addContentToList(file.id, file.name);
                });
            }
            else {
                alert('Please input a file name!');
            }
        };

        /**
         * Starts off renaming a file
         * @param {string} id
         */
        this.renameFile = function(id) {
            var fileName = prompt("Please enter the new file name", "");
            if (fileName != null) {
                this.workspaceAdapter.renameFile(id, fileName);
            }
        };

        /**
         * Starts off deleting a file
         * @param {string} id
         */
        this.deleteFile = function(id) {
            var that = this;
            this.workspaceAdapter.deleteFile(id).then(function (res) {
                that.refreshWorkSpace();
            });
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