var classes = [];

var QuestionSocket = function(sio, socket) {
    socket.on('getQuestionCollection', function(classId) {
        socket.emit('questions', getClassesWithClassId(classId));
    });

    socket.on('addQuestion', function(classId, question) {
        addQuestion(classId, question);
        socket.emit();

    });
};

module.exports = QuestionSocket;

function getClassesWithClassId(classId) {
    return classes.filter(function (entry) {
        return entry.classId === classId
    });
}
function containClassId(classId) {
    return getClassesWithClassId(classId).length != 0
}

function addQuestion(classId, question) {
    if (containClassId(classId)) {
        return getClassesWithClassId(classId)[0].questions.push(question)
    }
    else {
        return classes.push({classId: classId, questions : [question]});
    }
}