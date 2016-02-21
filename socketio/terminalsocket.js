var pty = require('pty.js');
var spawn = require('child_process').spawn;
var ss = require('socket.io-stream');

var sshAuth = 'password';
var existingConnections = {};
var nsp;

function TerminalSocket(sio, socket, terminalNSP) {
    nsp = terminalNSP;

    socket.on('createSSHConnection', function(remoteHost, roomId) {
        console.log(remoteHost, roomId);
        if (existingConnections[roomId] != null) {
            socket.emit('connectionAlreadyCreated', roomId);
        }
        else if (isRemoteHostValid(remoteHost)) {
            socket.join(roomId);
            setupSSH(socket, remoteHost, roomId);
            socket.emit('createSucceed', roomId);
        }
    });

    socket.on('joinSSHConnection', function(roomId) {
        if (existingConnections[roomId] == null) {
            socket.emit('connectionNotExist', roomId);
        }
        else {
            joinSSHConnection(socket, roomId);
            socket.emit('joinSucceed', roomId);
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
        nsp.to(roomId).emit('output', data);
    });

    term.on('exit', function(code) {
        if (existingConnections[roomId]) {
            disconnectAllInRoom(nsp.adapter.rooms[roomId].sockets);
            delete existingConnections[roomId];
        }
        console.log((new Date()) + " PID=" + term.pid + " ENDED");
        socket.removeAllListeners();
        socket.disconnect();
    });

    socket.on('resize', function(data) {
        term.resize(data.col, data.row);
    });

    socket.on('input', function(data) {
        term.write(data);
    });

    socket.on('disconnect', function() {
        term.destroy();
        socket.removeAllListeners();
    });

    downloadFile(socket, remoteHost.user, remoteHost.host, remoteHost.port);
    uploadFile(socket, remoteHost.user, remoteHost.host, remoteHost.port);
}

function disconnectAllInRoom(room) {
    for (var client in room) {
        if (!room.hasOwnProperty(client)) continue;
        nsp.connected[client].disconnect();
    }
}

function joinSSHConnection(socket, roomId) {
    var term = existingConnections[roomId];
    console.log('asked to join room: ' + roomId);

    socket.join(roomId);

    if (term.readonly == false) {
        socket.on('input', function(data) {
            term.write(data);
        });
    }
}

function downloadFile(socket, user, host, port) {
    ss(socket).on('downloadFile', function(stream, opts) {
        var ssh = spawn('ssh',['-p', port, user+'@'+host, 'cat ' + opts.path]);
        console.log('downloading');

        ssh.stdout.pipe(stream);

        ssh.stderr.on('data', function(data) {
            console.log('stderr: ', data);
        });
    });
}

function uploadFile(socket, user, host, port) {
    ss(socket).on('uploadFile', function(stream, opts) {
        var ssh = spawn('ssh',['-p', port, user+'@'+host, 'cat > ' + opts.path]);
        console.log('uploading');

        stream.pipe(ssh.stdin);

        ssh.stderr.on('data', function(data) {
            console.log('stderr: ', data);
        });
    });
}

module.exports = TerminalSocket;
