define(function (require) {
    "use strict";

    var $ = require('jquery'),
        io = require('socketio'),
        ss = require('lib/socket.io-stream');

    require('lib/hterm_all');

    var term, socket;
    var buf = '';

    function TerminalController(editorController) {
        this.editorController = editorController;
        this.connectToView();
    }

    (function () {
        this.connectToView = function() {
            var that = this;

            $('#openTerminal').click(function () {
                if (!$(this).hasClass('selected') && !term) {
                    console.log('try join');
                    addSocketListeners();
                    var roomId = that.editorController.workspace.id;
                    socket.emit('joinSSHConnection', roomId);
                }
            });

            $('#terminalForm').submit(function() {
                if (!term) {
                    addSocketListeners();
                }
                var remoteHost = {
                    user: $('#terminalUser').val(),
                    host: $('#terminalHost').val(),
                    port: $('#terminalPort').val()
                };
                var roomId = that.editorController.workspace.id;
                socket.emit('createSSHConnection', remoteHost, roomId);
            });

            $('#downloadButton').on('click', function() {
                var path = $('#terminalGroup').find('input').val();
                that.downloadFile(path);
            });

            $('#uploadButton').on('click', function() {
                var path = $('#terminalGroup').find('input').val();
                that.uploadFile(path);
            });
        };

        this.downloadFile = function(path) {
            var stream = ss.createStream();
            var fileData = "";
            var that = this;

            ss(socket).emit('downloadFile', stream, {path: path});

            stream.on('data', function(data) {
                for (var i = 0; i < data.length; i++) {
                    fileData += String.fromCharCode(data[i]);
                }
            });

            stream.on('end', function () {
                that.editorController.resetEditorText(fileData);
            });
        };

        this.uploadFile = function(path) {
            var fileData = this.editorController.getEditorText();
            var blob = new Blob([fileData]);
            var stream = ss.createStream();

            ss(socket).emit('uploadFile', stream, {path: path});
            ss.createBlobReadStream(blob).pipe(stream);

            stream.on('end', function () {
                alert('Your file is saved.');
            });
        };
    }).call(TerminalController.prototype);

    function addSocketListeners() {
        socket = io('/terminal');

        socket.on('output', function (data) {
            if (!term) {
                buf += data;
                return;
            }
            term.io.writeUTF16(data);
        });

        socket.on('connectionNotExist', function() {
            $('#connectionForm').find('.glyphicon').hide();
            $('#terminalOps').show();
        });

        socket.on('createSucceed', function() {
            $('#connectionForm').hide();
            $('#terminalGroup').find('.input-group').css('display', 'table');
            lib.init(function() {});
            setupTerminal(true);
        });

        socket.on('joinSucceed', function() {
            $('#connectionForm').hide();
            lib.init(setupTerminal);
        });

        socket.on('disconnect', function () {
            term = null;
            $('#connectionForm').show();
            $('#terminal').empty();
            $('#terminalGroup').hide().find('.input-group').hide();
            console.log("Socket.io connection closed");
        });
    }

    function setupTerminal(forCreate) {
        hterm.defaultStorage = new lib.Storage.Local();
        /**
         * opt_profileName is the name of the terminal profile to load, or "default" if
         * not specified.  If you're using one of the persistent storage
         * implementations then this will scope all preferences read/writes to this
         * name.
         */
        term = new hterm.Terminal();
        term.decorate($('#terminal')[0]);
        $('#terminalGroup').show();

        term.setCursorPosition(0, 0);
        term.setCursorVisible(true);
        term.prefs_.set('ctrl-c-copy', true);
        term.prefs_.set('ctrl-v-paste', true);
        term.prefs_.set('use-default-window-copy', true);

        term.runCommandClass(CommandClass, null);

        if (forCreate) {
            socket.emit('resize', {
                col: term.screenSize.width,
                row: term.screenSize.height
            });
        }
        else {
            term.onTerminalResize = null;
        }

        if (buf && buf != '') {
            term.io.writeUTF16(buf);
            buf = '';
        }
    }

    function CommandClass(argv) {
        this.argv_ = argv;
        this.io = null;
        this.pid_ = -1;
    }

    (function() {

        this.run = function () {
            this.io = this.argv_.io.push();

            this.io.onVTKeystroke = this.sendString_.bind(this);
            this.io.sendString = this.sendString_.bind(this);
            this.io.onTerminalResize = this.onTerminalResize.bind(this);
        };

        this.sendString_ = function (str) {
            socket.emit('input', str);
        };

        this.onTerminalResize = function (col, row) {
            socket.emit('resize', {col: col, row: row});
        };

    }).call(CommandClass.prototype);

    return TerminalController;
});