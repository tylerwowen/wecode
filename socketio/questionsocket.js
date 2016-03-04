var _ = require('lodash');
var classes = new Map();
var QuestionSocket = function(sio, socket, questionNSP) {
    var self = this;

    this.classes = classes;
    socket.on('getQuestionList', function(classId, callback) {
        callback(self.classes.get(classId));
    });

    socket.on('addQuestion', function(classId, question, callback) {
        callback(question, self.classes.get(classId));
        if(self.classes.has(classId)) {
            self.classes.get(classId).push(question);
        }
        else {
            self.classes.set(classId, [question]);
        }

        questionNSP.to(classId).emit('updateQuestionList');
    });

    socket.on('joinQuestions', function(questionToMerge, matchedQuestion, classId) {
        var newQuestionList = _.compact(_.map(self.classes.get(classId), function(questionObject) {
            if(_.isEqual(matchedQuestion, questionObject)) {
                questionToMerge.email.forEach(function(email) {
                    questionObject.email.push(email);
                });
                return questionObject;
            } else
                return _.isEqual(questionToMerge, questionObject) ? null : questionObject
        }));

        self.classes.set(classId, newQuestionList);
        questionNSP.to(classId).emit('updateQuestionList');
    });

    socket.on('bringUserIn', function(email, href, classId) {
        questionNSP.to(classId).emit('bringUserIn', email, href, classId);
    });

    socket.on('kickUserOut', function(questionObject, href, classId) { //TODO Not done yet
        _.remove(self.classes.get(classId), function(question) {
            return _.isEqual(question, questionObject);
        });

        questionNSP.to(classId).emit('updateQuestionList');
        questionNSP.to(classId).emit('kickUserOut', questionObject, href, classId);
    });

    socket.on('join', function(roomId) {
        socket.join(roomId);
    });
};

module.exports = QuestionSocket;