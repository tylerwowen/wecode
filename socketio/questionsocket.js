var _ = require('lodash');
var classes = new Map();
var QuestionSocket = function(sio, socket, questionNSP) {
    var self = this;

    this.classes = classes;
    socket.on('getQuestionList', function(classId, callback) {
        callback(self.classes.get(classId));
    });

    socket.on('addQuestion', function(classId, question, callback) {
        callback(question, _.map(self.classes.get(classId), function(questionObject) { return questionObject.question}));
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
        _.remove(self.classes.get(classId), function(question) {
            return question.email === email;
        });

        questionNSP.to(classId).emit('updateQuestionList');
        questionNSP.to(classId).emit('kickUserOut', email, href, classId);
    });

    socket.on('join', function(roomId) {
        socket.join(roomId);
    });
};

module.exports = QuestionSocket;