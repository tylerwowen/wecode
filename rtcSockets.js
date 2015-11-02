/**
 * This module is responsible for setting up the socket listener.
 *
 * It will perform the following actions
 *   1. Create a socket listener
 *   2. Handle sending messages from the client side
 *   3. Handle room joining/creating from the client side
 */
rtcSockets = function(app) {
    var io = require('socket.io').listen(app);
    io.sockets.on('connection', function (socket){

        /**
         * Socket logging
         */
        function log(){
            var array = [">>> "];
            for (var i = 0; i < arguments.length; i++) {
                array.push(arguments[i]);
            }
            socket.emit('log', array);
        }

        socket.on('message', function (message) {
            log('Got message: ', message);
            socket.broadcast.emit('message', message);
        });

        socket.on('clicky', function(amount) {
            log('Number of clicks: ', amount);
            socket.broadcast.emit('clicky', amount);
        });

        socket.on('sendText', function(message) {
            log('Message stuff: ', message);
            //console.log(message + '\n\n\n\n\n\n\n\n');
            socket.broadcast.emit('back', message);
        })

        socket.on('create or join', function (room) {
            var numClients = io.sockets.clients(room).length;

            log('Room ' + room + ' has ' + numClients + ' client(s)');
            log('Request to create or join room', room);

            /**
             * Check whether to create or join a room. Also check whether it is full.
             */
            if (numClients == 0){
                socket.join(room);
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
}

module.exports = rtcSockets;
