define(function (require) {
    "use strict";

    var $ = require('jquery'),
        socket = require('socketio')('/terminal'),
        ss = require('lib/socket.io-stream');

    require('lib/hterm_all');

    var term;
    var buf = '';

    function Terminal(argv) {
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

    }).call(Terminal.prototype);

    function TerminalController() {
        addSocketListeners();
        this.connectToView();
    }

    (function () {
        this.connectToView = function() {
            $('#connectButton').on('click', function() {
                var remoteHost = {
                    user: $('input[name="user"]').val(),
                    host: $('input[name="host"]').val(),
                    port: $('input[name="port"]').val()
                };
                var roomId = $('input[name="roomid"]').val();
                socket.emit('createSSHConnection', remoteHost, roomId);
            });

            $('#joinButton').on('click', function() {
                var roomId = $('input[name="roomid"]').val();
                socket.emit('joinSSHConnection', roomId);
            });

            $('#loadButton').on('click', function() {
                var path = $('input[name="path"]').val();
                downloadFile(path);
            });

            $('#uploadButton').on('click', function() {
                var path = $('input[name="path"]').val();
                uploadFile(path);
            });
        };

    }).call(TerminalController.prototype);

    function addSocketListeners() {
        socket.on('connect', function () {
            lib.init(setupTerminal);
        });

        socket.on('output', function (data) {
            if (!term) {
                buf += data;
                return;
            }
            term.io.writeUTF16(data);
        });

        socket.on('disconnect', function () {
            console.log("Socket.io connection closed");
        });
    }

    function setupTerminal() {
        hterm.defaultStorage = new lib.Storage.Local();
        /**
         * opt_profileName is the name of the terminal profile to load, or "default" if
         * not specified.  If you're using one of the persistent storage
         * implementations then this will scope all preferences read/writes to this
         * name.
         */
        term = new hterm.Terminal();
        term.decorate($('#terminal')[0]);

        term.setCursorPosition(0, 0);
        term.setCursorVisible(true);
        term.prefs_.set('ctrl-c-copy', true);
        term.prefs_.set('ctrl-v-paste', true);
        term.prefs_.set('use-default-window-copy', true);

        term.runCommandClass(Terminal, null);
        socket.emit('resize', {
            col: term.screenSize.width,
            row: term.screenSize.height
        });

        if (buf && buf != '') {
            term.io.writeUTF16(buf);
            buf = '';
        }
    }

    function downloadFile(path) {
        var stream = ss.createStream();
        var fileData = "";

        ss(socket).emit('downloadFile', stream, {path: path});

        stream.on('data', function(data) {
            for (var i = 0; i < data.length; i++) {
                fileData += String.fromCharCode(data[i]);
            }
        });

        stream.on('end', function () {
            console.log(fileData);
        });
    }

    function uploadFile(path, fileData) {
        var blob = new Blob([fileData]);
        var stream = ss.createStream();

        ss(socket).emit('uploadFile', stream, {path: path});
        ss.createBlobReadStream(blob).pipe(stream);

        stream.on('end', function () {
            console.log(fileData);
        });
    }

    return TerminalController;
});