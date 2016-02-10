var classes = {};

var QuestionSocket = function(socket) {

    socket.on('getQuestionCollection', function(id) {
        var aclass = classes[id];
        socket.emit('aclass', aclass);
    });

    socket.on('saveQuestionToDB', function(classId, question) {
        console.log("save question is called");
        classes[classId].append(question);
        socket.emit();
    });

    socket.on('disconnect', function() {
        socket.removeAllListeners();
    });

};

module.exports = QuestionSocket;

