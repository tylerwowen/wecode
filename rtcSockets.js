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

        socket.on('message', function (message, room, remoteId) {
            var newRemoteId = socket.store.id;
            var clients = io.sockets.clients(room);
            console.log('this is remote id ' + remoteId);
            console.log('this is current id ' + socket.store.id);
            if(message.type === 'offer') {
                for(var i = 0; i < clients.length; i++) {
                    if(clients[i].id === remoteId) {
                        console.log('found the matching id');
                        console.log('Sending Id from ' + newRemoteId + '----------> ' + remoteId);
                        clients[i].emit('message', message, newRemoteId);
                    }
                }
            }
            else if(message.type === 'answer') {
                console.log('dealing with an answer');
                for(var i = 0; i < clients.length; i++){
                    if(clients[i].id === remoteId){
                        console.log('Sending Id from ' + newRemoteId + '----------> ' + remoteId);
                        clients[i].emit('message', message, newRemoteId);
                    }
                }
            }
            else if(message.type === 'candidate') {
                console.log('dealing with a candidate');
                for(var i = 0; i < clients.length; i++) {
                    if(clients[i].id === remoteId){
                        console.log('Sending Id from ' + newRemoteId + '----------> ' + remoteId);
                        clients[i].emit('message', message, newRemoteId);
                    }
                }
            }
            else if(message === 'bye') {
                console.log('bye');
                socket.broadcast.to(room).emit('message', message, newRemoteId);
            }
        });

        socket.on('gotUserMedia', function(message) {
            console.log('got user media');
            socket.emit('gotUserMedia', true);
        })

        socket.on('create or join', function (room) {
            var clients = io.sockets.clients(room);
            var numClients = io.sockets.clients(room).length;
            console.log('Joining room ' + room + ' has ' + numClients + ' client(s)');

            var getCurrentConnectedUsers = function() {
                var currentlyConnected = [];
                var clients = io.sockets.clients(room);
                for(var i = 0; i < clients.length; i++)
                    currentlyConnected.push(clients[i].id);
                return currentlyConnected;
            }
            
            /**
             * Check whether to create or join a room. Also check whether it is full.
             */
            if (numClients == 0){
                socket.join(room);
                socket.emit('created', room);
                console.log(io.sockets.clients(room));
            } else if (numClients > 0) {
                io.sockets.in(room).emit('join', room);
                socket.join(room);
                socket.emit('joined', getCurrentConnectedUsers());
            } else {
                socket.emit('full', room);
            }
        });
    });
};

module.exports = rtcSockets;
