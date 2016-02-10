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

            socket.emit('saveQuestionToDB', that.getParam('name'), question);
            console.log(that.getParam('name'));
            $('#questionFormPage').hide();
        };

        this.getQuestionCollection = function() {
            $("#questionTableBody tr").remove();
            socket.emit('getQuestionCollection', this.getParam('name'));
        };

        socket.on('aclass', function(aclass) {
            that.qCollection = aclass;
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