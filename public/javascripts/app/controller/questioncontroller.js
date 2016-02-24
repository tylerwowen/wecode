/**
 * This module
 *
 */
define(function (require, exports, module) {
    var $ = require('jquery');
    var io = require('socketio');
    var socket = io('/questions');  // I think need to change later
    var getParam = require('lib/getparam');
    var userManager = require('app/model/usermanager')();
    var SimilarQuestions = require('app/model/similarquestions');

    var QuestionController = function () {
        var that = this;
        this.classId = getParam('id');
        this.className = getParam('name');
        this.similarQuestions = new SimilarQuestions();
        socket.emit('create or join', that.classId); // need to change later

        var questionCol = ["How to change commit message", "Edit commit history", "How to revert a commit"];

        this.init = function() {
            this.createButtonListeners();
            this.createSocketListeners();
            this.displayQuestionList();
        };

        this.createButtonListeners = function() {
            var isStudent = $("#questionsTableBody") ? true : false; // Check if I'm a student
            if(isStudent) {
                $('#questionSubmitButton').on('click', function () {
                    that.submitQuestion();
                });

                $('#questionAddButton').on('click', function () {
                    $('#questionFormPage').show();
                });
            } else { //If instructor
                // Add button listeners if you need to
            }
        };

        this.createSocketListeners = function() {
            var isStudent = $("#questionsTableBody") ? true : false; // Check if I'm a student
            if(isStudent) {
                socket.on('bringUserIn', function(email, href, classId) {
                    if(userManager.email === email) {
                        window.location.href = href;
                    }
                });
            } else { //If instructor

            }
        };

        this.submitQuestion = function() {
            var questiontext = $('#questionInput').val();

            var question = {
                topic: "github",
                question: questiontext,
                email: userManager.email
            };

            socket.emit('addQuestion', that.classId, question);
            $('#questionInput').val('');
            $('#questionFormPage').hide();
            that.displaySimilarQuestions(question.question, questionCol);
        };

        socket.on('updateQuestionList', function() {
            that.displayQuestionList();
        });



        this.displayQuestionList = function() {
            socket.emit('getQuestionList', that.classId, function(queue) {
                var updateStudentQuestionList = function(questionObject) {
                    questionBody.append(
                        '<li>' +
                            '<a id="' + questionObject.email + '" href="/main?' + params + '">' + questionObject.question + '</a>' +
                        '</li>');
                };

                var updateTAQuestionList = function(questionObject) {
                    questionBody.append(
                        '<li>' +
                        '<button id=' + questionObject.email + '>' + questionObject.question + '</button>' +
                        '<button id=' + questionObject.email + 'kickout>' + 'kickout ' + questionObject.question + '</button>' +
                        '</li>');

                    var bringStudentIn = function() {
                        var self = this;
                        socket.emit('bringUserIn', self.id, url, that.classId);
                    };

                    var kickStudentOut = function() { //TODO Not implemented yet
                        var self = this;
                        socket.emit('kickUserOut', self.id, url, that.classId);
                    };

                    // Set event handlers for clicks
                    document.getElementById(questionObject.email).onclick = bringStudentIn;
                    document.getElementById(questionObject.email.toString() + 'kickout').onclick = kickStudentOut; //TODO Not working atm
                };

                // If queue is undefined, set it to empty and do nothing
                queue = queue ? queue : [];
                var params = $.param({
                    id: that.classId,
                    name: that.className
                });

                // variable = booleanExpression ? setIfTrue : setIfFalse;
                var isStudent = $('#questionTableBody').length ? true : false; // Check if I'm a student
                var questionBody = isStudent ? $('#questionTableBody') : $('#workSpaceList');
                var updateQuestionList = isStudent ? updateStudentQuestionList : updateTAQuestionList;
                var url = "/main_student?" + params;

                questionBody.empty(); //Clear the list in the question body

                queue.forEach(updateQuestionList); // Iterate through the question objects in the queue
            })
        };

        this.displaySimilarQuestions = function(question, questionCol) {
            this.similarQuestions.getSimilarQuestionsWOTopics(question, questionCol, function(similarQuestionsArray){
                if(similarQuestionsArray.length != 0) {
                    for (var q = 0; q < similarQuestionsArray.length; q++) {
                        var question =  '<tr><td>' + similarQuestionsArray[q] + '</td></tr>';
                        $('#simquestionTableBody').append(question);
                    }
                    $('#similarQuestionsPage').show();
                }
            });
        };
        return that;
    };

        $('#questionReturn').click(function(){
            $('#questionFormPage').hide();
        });


    module.exports = QuestionController;
});