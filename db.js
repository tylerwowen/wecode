// Mongodb
var monk = require('monk');
var db = monk('127.0.0.1:27017/westudy');

var Database = function(socket) {

    var that = this;
    var collection = db.get('questioncollection');

    socket.on('getQuestionCollection', function() {
        that.getCollection()
            .then(function(questionCollection) {
                socket.emit('questionCollection', questionCollection);
            });
    });

    socket.on('saveQuestionToDB', function(newQuestion) {
        that.saveQuestion(newQuestion)
            .then(function(){
               socket.emit();
            });
    });

    this.getCollection = function() {
        return collection.find().then(function(questioncollection){
            return questioncollection;
        });
    };

    this.saveQuestion = function(newQuestion) {
        return collection.insert(newQuestion);
    };
};

module.exports = Database;

