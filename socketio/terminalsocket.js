var fs = require('fs');
var pty = require('pty.js');
var spawn = require('child_process').spawn;
var ss = require('socket.io-stream');

var sshAuth = 'password';
var existingConnections = {};
var io;

function TerminalSocket(sio, socket) {
    io = sio;

    socket.on('createSSHConnection', function(remoteHost, roomId) {
        console.log(remoteHost, roomId);
        if (existingConnections[roomId] != null) {
            socket.emit('connectionAlreadyCreated', roomId);
        }
        else if (isRemoteHostValid(remoteHost)) {
            // WARNING: should be deleted after integrated
            socket.join(roomId);
            setupSSH(socket, remoteHost, roomId);
        }
    });

    socket.on('joinSSHConnection', function(roomId) {
        if (existingConnections[roomId] == null) {
            socket.emit('connectionNotExist', roomId);
        }
        else {
            joinSSHConnection(socket, roomId)
        }
    });
}

function isRemoteHostValid(remoteHost) {
    return remoteHost.host != 'localhost'
        && parseInt(remoteHost.port) < 65535
        && parseInt(remoteHost.port) > 0 ;
}

function setupSSH(socket, remoteHost, roomId) {
    var sshUser = remoteHost.user + '@';
    var term = pty.spawn('ssh', [sshUser + remoteHost.host, '-p', remoteHost.port, '-o', 'PreferredAuthentications=' + sshAuth], {
        name: 'xterm-256color',
        cols: 80,
        rows: 30
    });

    existingConnections[roomId] = term;

    console.log((new Date()) + " PID=" + term.pid + " STARTED on behalf of user=" + sshUser);
    term.on('data', function(data) {
        io.sockets.in(roomId).emit('output', data);
    });
    term.on('exit', function(code) {
        if (existingConnections[roomId]) delete existingConnections[roomId];
        console.log((new Date()) + " PID=" + term.pid + " ENDED");
    });

    socket.on('resize', function(data) {
        term.resize(data.col, data.row);
    });
    socket.on('input', function(data) {
        term.write(data);
    });
    socket.on('disconnect', function() {
        if (existingConnections[roomId]) delete existingConnections[roomId];
        term.destroy();
        socket.removeAllListeners();
    });

    downloadFile(socket, remoteHost.user, remoteHost.host, remoteHost.port)
}

function joinSSHConnection(socket, roomId) {
    var term = existingConnections[roomId];
    console.log('asked to join room: ' + roomId);

    socket.join(roomId);

    socket.on('input', function(data) {
        term.write(data);
    });
}

function downloadFile(socket, user, host, port) {
    ss(socket).on('downloadFile', function(stream, opts) {
        var scp = spawn('scp',['-P', port, user+'@'+host+':'+opts.path, '/dev/stdout']);
        console.log('downloading');
        scp.stdout.pipe(stream);

        scp.stderr.on('data', function(data) {
            console.log('stderr: ', data);
        });
    });
}

module.exports = TerminalSocket;
