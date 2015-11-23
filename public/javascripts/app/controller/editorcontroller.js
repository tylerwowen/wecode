define(function (require) {
    "use strict";

    var $ = require('jquery'),
        ace = require('ace/ace'),
        FileSystem = require('app/model/filesystem'),
        GoogleAdapter = require('app/model/googleadapter'),
        RealtimeDataManager = require('app/model/realtimedatamanager');

    ace.config.set("packaged", true);
    ace.config.set("basePath", require.toUrl("ace"));

    var fs,
        editor = ace.edit('editor'),
        realtimeDataManager = new RealtimeDataManager(editor),
        googleAdapter = new GoogleAdapter(realtimeDataManager),
        realtimeUtils = googleAdapter.realtimeUtils;

    function loadFileSystem() {
        var wsID = realtimeUtils.getParam('workspace');
        if (wsID) {
            // Get a list of files from work space with wsID
            fs = new FileSystem(wsID);
            fs.getFileList().then(function (files) {
                showList(files);
            });
        } else {
            // Shouldn't see this page without a work space id
            // redirect for now
            alert("You should log in");
            window.location = "/users";
        }
    }

    function showList(files) {
        if (files.length > 0) {
            files.forEach(function (file) {
                $('#files').append(
                    '<li style="color:white" class="file" id="' + file.get('driveFileId') + '">' +
                    file.get('name') +
                    '</li>');
            })
        }
        else {
            fs.createDriveFile('untitled');
        }
    }

    function refreshList(driveFileId, fileName) {
        $('#fileName').val('');
        $('#files').append(
            '<li style="color:white" class="file" id="' + driveFileId + '">' +
            file.get('name') +
            '</li>');
    }

    function createFile(fileName) {
        if (fileName) {
            $.when(googleAdapter.createDriveFile(fileName)).then(function (driveFileId, fileName) {
                fs.createParseFile(driveFileId, fileName);
                refreshList(driveFileId, fileName);
            });
        }
        else {
            alert('Please input a file name!');
        }
    }

    function Controller() {

        $.when(googleAdapter.authorize()).done(function () {
            loadFileSystem();
        });

        $('#fileButton').click(function () {
            createFile($('#fileName').val());
        });

        $('#files').on('click', 'li.file', function () {
            var id = $(this).attr('id');
            googleAdapter.loadDriveFile(id);
        });

        editor.setTheme("ace/theme/monokai");
        editor.getSession().setMode("ace/mode/javascript");
        editor.getSession().setUseWrapMode(true);
        editor.$blockScrolling = Infinity;
    }

    (function () {

        this.constructor = Controller;

    }).call(Controller.prototype);

    return Controller;
});