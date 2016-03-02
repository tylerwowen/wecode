var FileSocket = function(sio, socket, questionNSP) {
    var self = this;

    socket.on('updateEveryone', function(classId) {
        console.log('received');
        socket.to(classId).emit('updateEveryone');
    });

    socket.on('join', function(roomId) {
        console.log('socket joined');
        socket.join(roomId);
    });
};

module.exports = FileSocket;