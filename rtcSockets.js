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

        /**
         * Listens to a message from a client to handle peer connections, the different steps
         * it performs are:
         * 1. Listens to a offer and delivers it to the remote client with id remoteId
         * 2. Listens to a answer and delivers it to the remote client with id remoteId
         * 3. Listens to a message type of candidate and deliverse it to the remote client with id remoteId
         * 4. Listens to a message bye and delivers it to all the clients connected to the room
         */
        socket.on('message', function (message, room, remoteId) {
            var newRemoteId = socket.store.id;
            var findAndSendMessageToMatchingClient = function(message, remoteId, newRemoteId) {
                var clients = io.sockets.clients(room);
                for(var i = 0; i < clients.length; i++){
                    if(clients[i].id === remoteId){
                        clients[i].emit('message', message, newRemoteId);
                    }
                }
            }
            
            if(message.type === 'offer') {
                findAndSendMessageToMatchingClient(message, remoteId, newRemoteId);
            }
            else if(message.type === 'answer') {
                findAndSendMessageToMatchingClient(message, remoteId, newRemoteId);
            }
            else if(message.type === 'candidate') {
                findAndSendMessageToMatchingClient(message, remoteId, newRemoteId);  
            }
            else if(message === 'bye') {
                socket.broadcast.to(room).emit('message', message, newRemoteId);
            }
        });

        /**
         *  gotUserMedia sends a signal that the userMedia has been activated
         */
        socket.on('gotUserMedia', function(message) {
            socket.emit('gotUserMedia', true);
        })

        /**
         *  Deals with clients joining the room for video chat
         */
        socket.on('create or join', function (room) {
            var getCurrentConnectedUsers = function() {
                var currentlyConnected = [];
                var clients = io.sockets.clients(room);
                for(var i = 0; i < clients.length; i++)
                    currentlyConnected.push(clients[i].id);
                return currentlyConnected;
            }

            var clientsInRoom = io.sockets.clients(room).length;
            if (clientsInRoom < 5) {
                socket.join(room);
                socket.emit('joined', getCurrentConnectedUsers());
            } else {
                socket.emit('full', room);
            }
        });
    });
};

module.exports = rtcSockets;
