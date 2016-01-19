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

        this.connectToView = function() {
            var that = this;
            $('#fileButton').click(function () {
                taht.createFile($('#fileName').val());
            });

            $('#files').on('click', 'li.file', function () {
                var id = $(this).attr('id');
                that.workspace.loadFile(id, that.aceAdapter, that.fileAdapter);
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
                var that = this;
                this.workspace.createFile(that.workspace.id, fileName)
                    .then(function (file) {
                    that.refreshList(file.id, file.name);
                });
            }
            else {
                alert('Please input a file name!');
            }
        };

        this.showList = function(contents) {
            var that = this;

            function mouseX(evt) {
                if (evt.pageX) {
                    return evt.pageX;
                } else if (evt.clientX) {
                    return evt.clientX + (document.documentElement.scrollLeft ?
                            document.documentElement.scrollLeft :
                            document.body.scrollLeft);
                } else {
                    return null;
                }
            }

            function mouseY(evt) {
                if (evt.pageY) {
                    return evt.pageY;
                } else if (evt.clientY) {
                    return evt.clientY + (document.documentElement.scrollTop ?
                            document.documentElement.scrollTop :
                            document.body.scrollTop);
                } else {
                    return null;
                }
            }

            if (contents != null) {
                for (var id in contents) {
                    if (contents.hasOwnProperty(id)) {
                        var menu = '<div class="hide" id="rmenu">' +
                            '<ul> ' +
                            '<li>' +
                            '<a id="rename' + id + '">Rename</a>' +
                            '</li>' +
                            '<li>' +
                            '<a id="delete' + id + '">Delete</a>' +
                            '</li> ' +
                            '</ul>' +
                            '</div>';

                        $('#files').append(menu);

                        if (contents[id].constructor.name == 'File') {

                            var file =  '<li style="color:white" class="file" id=' + id + '>' +
                                            contents[id].name +
                                        '</li>';

                            $('#files').append(file);

                            document.getElementById("rename" + id).addEventListener('click', function(e) {
                                that.renameFile(id);
                            });

                            document.getElementById("delete" + id).addEventListener('click', function(e) {
                                that.deleteFile(id);
                            });


                        } else if (contents[id].constructor.name == 'Folder') {

                            var folder = '<li style="color:white" class="folder" id="' + id + '">' +
                                            contents[id].name +
                                        '</li>';

                            $('#files').append(folder);

                            //document.getElementById("rename" + id).addEventListener('click', function(e) {
                            //    that.renameFolder(id);
                            //});
                            //
                            //document.getElementById("delete" + id).addEventListener('click', function(e) {
                            //    that.deleteFolder(id);
                            //});
                        }

                        document.getElementById(id).addEventListener('contextmenu', function(e) {
                            console.log('right clicked');
                            document.getElementById("rmenu").className = "showMenu";
                            document.getElementById("rmenu").style.top =  mouseY(event) + 'px';
                            document.getElementById("rmenu").style.left = mouseX(event) + 'px';

                            window.event.returnValue = false;
                        });

                        $(document).bind("click", function(event) {
                            document.getElementById("rmenu").className = "hideMenu";
                        });
                    }
                }

            }
            else {
                this.workspace.createFile(this.workspace.id, 'demo')
                    .then(function (file) {
                        that.refreshList(file.id, file.name);
                    });
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
            console.log("Deleting the file");
            this.workspaceAdapter.deleteFile(id);
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