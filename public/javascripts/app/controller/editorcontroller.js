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
    editor.setOption("highlightActiveLine", false)

    var languages = new Array();
    languages["js"] = "javascript";
    languages["cpp"] = "c_cpp";
    languages["c"] = "c_cpp";
    languages["java"] = "java";


    function loadFileSystem() {
        var wsID = realtimeUtils.getParam('workspace');
        // Get a list of files from work space with wsID
        fs = new FileSystem(wsID);
        fs.getFileList().then(function (files) {
            showList(files);
        });
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
            createFile('Demo');
        }
    }

    function refreshList(driveFileId, fileName) {
        $('#fileName').val('');
        $('#files').append(
            '<li style="color:white" class="file" id="' + driveFileId + '">' +
            fileName +
            '</li>');
    }

    function createFile(fileName) {
        if (fileName) {
            checkFileExtension(fileName);
            $.when(googleAdapter.createDriveFile(fileName)).then(function (driveFileId, fileName) {
                fs.createParseFile(driveFileId, fileName);
                refreshList(driveFileId, fileName);
            });
        }
        else {
            alert('Please input a file name!');
        }
    }

    function checkFileExtension(fileName) {
        var fn = fileName.split(".");
        if(fn.length > 2) {
            alert('Incorrect extension for the file');
        }
    }

    function setEditorMode(fileName) {
        console.log('The file name is: ', fileName);
        var fn = fileName.split(".");
        var fileExtension = fn[1];
        console.log("File extension is:", fileExtension);
        editor.getSession().setMode("ace/mode/" + languages[fileExtension]);
    }

    function Controller() {

        $('#fileButton').click(function () {
            createFile($('#fileName').val());
        });

        $('#files').on('click', 'li.file', function () {
            var id = $(this).attr('id');
            setEditorMode(document.getElementById(id).innerHTML);
            googleAdapter.loadDriveFile(id);
        });

        $('#refreshButton').click(function () {
            $('#files').empty();
            loadFileSystem();
        });

        editor.setTheme("ace/theme/monokai");
        //editor.getSession().setMode("ace/mode/javascript");
        editor.getSession().setUseWrapMode(true);
        editor.$blockScrolling = Infinity;
    }

    (function () {

        this.constructor = Controller;

        this.init = function() {
            $.when(googleAdapter.authorize()).done(function () {
                loadFileSystem();
            });
        }

    }).call(Controller.prototype);

    return Controller;
});