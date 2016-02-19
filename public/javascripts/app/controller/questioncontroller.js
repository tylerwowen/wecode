define(function (require) {
    "use strict";

    var $ = require('jquery');
    var io = require('socketio');
    require(['bootstrap']);
    var socket = io.connect();
    //var SimilarQuestions = require('app/model/similarquestions');

    function Controller() {
        this.qCollection = null;
        //this.similarQuestions = SimilarQuestions();
    }

    (function () {

        this.constructor = Controller;
        var that = this;

        this.init = function() {
            this.connectToView();
            this.getQuestionCollection();
            this.displayQuestionCollection();
        };

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
        }

        this.connectToView = function() {
            var that = this;
            $('#questionSubmitButton').on('click', function() {
                that.submitQuestion();
                that.getQuestionCollection();
            });
            $('#questionAddButton').on('click', function() {
                that.displayAddQuestionForm();
            });
        };

        this.submitQuestion = function() {
            var that = this;
            var topic = "github";
            var questiontext = $('#questionInput').val();

            var question = {
                topic: topic,
                question: questiontext
            };

            socket.emit('addQuestion', that.getParam('name'), question);
            $('#questionInput').val('');
            $('#questionFormPage').hide();
            //this.similarQuestions.getSimilarQuestions(question, null);
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
            } else {
                for (var q = 0; q < this.qCollection.length; q++) {
                    var question =  '<tr><td id=' + this.qCollection[q]._id + '>' +
                            this.qCollection[q].topic + '</td>' +
                            '<td><a href="/main_student?id='+ that.getParam('id') + '&name='+ that.getParam('name') +'">' + this.qCollection[q].question +
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