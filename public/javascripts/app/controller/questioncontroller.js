define(function (require) {
    "use strict";

    require(['bootstrap']);
    var $ = require('jquery');
    var io = require('socketio');
    var socket = io.connect();

    function Controller() {
        this.qCollection = null;
    }

    (function () {

        this.constructor = Controller;
        var that = this;

        this.init = function() {
            this.connectToView();
            this.getQuestionCollection();
            this.displayQuestionCollection();
        };

        this.connectToView = function() {
            var that = this;
            $('#questionSubmitButton').on('click', function() {
                that.submitQuestion();
            });
            $('#questionAddButton').on('click', function() {
                that.displayAddQuestionForm();
            });
        };

        this.submitQuestion = function() {
            var topic = "github";
            var question = $('#questionInput').val();

            var questionJson = {
                topic: topic,
                question: question
            };

            socket.emit('saveQuestionToDB', questionJson);
            $('#questionFormPage').hide();
        };

        this.getQuestionCollection = function() {
            socket.emit('getQuestionCollection');
        };

        socket.on('questionCollection', function(questionCollection) {
            that.qCollection = questionCollection;
            that.displayQuestionCollection();
        });

        this.displayQuestionCollection = function() {
            if(this.qCollection == null) {
                console.log("qCollection is null");
            } else {
                for (var q = 0; q < this.qCollection.length; q++) {
                    var question =  '<tr><td id=' + this.qCollection[q]._id + '>' +
                        this.qCollection[q].topic + '</td><td>'+this.qCollection[q].question+'</td>></tr>';
                    $('#questionTableBody').append(question);
                }
            }
        };

        this.displayAddQuestionForm = function(){
            $('#questionFormPage').show();
        };

    }).call(Controller.prototype);

    return Controller;
});