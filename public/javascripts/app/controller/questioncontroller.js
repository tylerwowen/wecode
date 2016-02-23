define(function (require) {
    "use strict";

    var $ = require('jquery');
    var io = require('socketio');
    var socket = io.connect();
    var SimilarQuestions = require('app/model/similarquestions');

    function Controller() {
        this.qCollection = null;
        this.question = null;
        this.questiontext = null;
        this.topic = null;
        this.similarQuestions = new SimilarQuestions();
    }

    (function () {

        this.constructor = Controller;
        var that = this;

        this.init = function() {
            this.connectToView();
            this.getQuestionCollection();
            this.displayQuestionCollection();
        };

        var questionCol = ["How to change commit message", "Edit commit history", "How to revert a commit"];

        this.connectToView = function() {
            var that = this;

            $('#questionSubmitButton').on('click', function() {
                that.submitQuestion();
                that.getQuestionCollection();
                that.displaySimilarQuestions(that.question.question, questionCol);
            });
            $('#questionAddButton').on('click', function() {
                that.displayAddQuestionForm();
            });
        };

        this.submitQuestion = function() {
            var that = this;
            that.topic = "github";
            that.questiontext = $('#questionInput').val();

            that.question = {
                topic: that.topic,
                question: that.questiontext
            };
            console.log(that.question.question);
            socket.emit('addQuestion', that.getParam('name'), that.question);
            $('#questionInput').val('');
            $('#questionFormPage').hide();

        };

        this.displaySimilarQuestions = function(question, questionCol) {
            var simQuestion = this.similarQuestions.getSimilarQuestionsWOTopics(question, questionCol, function(){
                console.log("hello");
            });
        };

        this.getQuestionCollection = function() {
            $("#questionTableBody tr").remove();
            socket.emit('getQuestionCollection', this.getParam('name'));
        };

        socket.on('questions', function(questions) {
            that.qCollection = questions;
            that.displayQuestionCollection();
        });

        /**
         * Examines url query parameters for a specific parameter.
         * @param {!string} urlParam to search for in url parameters.
         * @return {?(string)} returns match as a string of null if no match.
         * @export
         */
        this.getParam = function(urlParam) {
            var regExp = new RegExp(urlParam + '=(.*?)($|&)', 'g');
            var match = window.location.search.match(regExp);
            if (match && match.length) {
                match = match[0];
                match = match.replace(urlParam + '=', '').replace('&', '');
            } else {
                match = null;
            }
            return match;
        };


        this.displayQuestionCollection = function() {
            if(this.qCollection == null) {
                console.log("qCollection is null");
            } else if( this.qCollection[0] != undefined) {
                var questions = this.qCollection[0].questions;
                for (var q = 0; q < questions.length; q++) {

                    var question =  '<tr><td>' + questions[q].topic + '</td>' +
                        '<td><a href="/main_student?id='+ that.getParam('id') + '&name='+ that.getParam('name') +'">'
                        + questions[q].question +
                        '</a></td></tr>';
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