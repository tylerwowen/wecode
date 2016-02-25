var classes = new Map();
var QuestionSocket = function(sio, socket, questionNSP) {
    var self = this;

    this.classes = classes;
    socket.on('getQuestionList', function(classId, callback) {
        callback(self.classes.get(classId));
    });

    socket.on('addQuestion', function(classId, question) {
        if(self.classes.has(classId)) {
            self.classes.get(classId).push(question);
        }
        else {
            self.classes.set(classId, [question]);
        }

        questionNSP.to(classId).emit('updateQuestionList');
    });

    socket.on('bringUserIn', function(email, href, classId) {
        questionNSP.to(classId).emit('bringUserIn', email, href, classId);
    });

    socket.on('kickUserOut', function(email, href, classId) { //TODO Not done yet
        questionNSP.to(classId).emit('kickUserOut', email,href, classId);
    });

    socket.on('create or join', function(roomId) {
        socket.join(roomId);
    });
};

module.exports = QuestionSocket;