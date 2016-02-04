define(function (require) {
    "use strict";

    require(['bootstrap']);
    var $ = require('jquery');
    var io = require('socketio');
    var socket = io.connect();

    function Controller() {
        this.topic = null;
        this.question = null;
    }

    (function () {

        this.constructor = Controller;

        this.init = function() {
            this.connectToView();
        };

        this.connectToView = function() {
            var that = this;
            $('#questionSubmitButton').on('click', function() {
                //that.submitQuestion();
                that.grabQuestionList();
            });
        };

        this.submitQuestion = function() {
            this.topic = "";
            this.question = document.getElementById("questionInput").value;
            console.log(this.question);
            this.findSimilarQuestions();
            this.saveQuestionToDB();
        };

        this.findSimilarQuestions = function() {

        };

        this.saveQuestionToDB = function() {

        };

        this.grabQuestionList = function() {
            socket.emit('grabQuestionList');
        };

        socket.on('questionCollection', function(questionCollection) {
            console.log(questionCollection);
        });

    }).call(Controller.prototype);

    return Controller;
});