/**
 * This module is responsible for setting up the socket listener.
 *
 * It will perform the following actions
 *   1. Create a socket listener
 *   2. Handle sending messages from the client side
 *   3. Handle room joining/creating from the client side
 */
rtcSockets = function(app) {
    var io = require('socket.io').listen(app, { log: false });
    io.sockets.on('connection', function (socket){

        socket.on('message', function (message, room) {
            console.log(message);
            socket.broadcast.to(room).emit('message', message);
        });

        socket.on('clicky', function(amount) {
            socket.broadcast.emit('clicky', amount);
        });

        socket.on('sendText', function(message) {
            socket.broadcast.emit('back', message);
        });

        socket.on('create or join', function (room) {
            var numClients = io.sockets.clients(room).length;
            console.log('Joining room ' + room + ' has ' + numClients + ' client(s)');

            /**
             * Check whether to create or join a room. Also check whether it is full.
             */
            if (numClients == 0){
                socket.join(room);

                console.log(socket.manager.rooms);
                //socket.room = room;
                socket.emit('created', room);
            } else if (numClients == 1) {
                io.sockets.in(room).emit('join', room);
                socket.join(room);
                socket.emit('joined', room);
            } else {
                socket.emit('full', room);
            }
            socket.emit('emit(): client ' + socket.id + ' joined room ' + room);
            socket.broadcast.emit('broadcast(): client ' + socket.id + ' joined room ' + room);
        });
    });
};

module.exports = rtcSockets;
