// Mongodb
var monk = require('monk');
var db = monk('127.0.0.1:27017/westudy');

var Database = function(socket) {
    var that = this;

    socket.on('grabQuestionList', function() {
        that.getCollection()
            .then(function(questionCollection) {
                socket.emit('questionCollection', questionCollection);
            });
    });

    var collection = db.get('questioncollection');
    this.getCollection = function() {
        return collection.find().then(function(questioncollection){
            return questioncollection;
        });
    }
};

module.exports = Database;

