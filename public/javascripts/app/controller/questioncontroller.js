define(function (require, exports, module) {
    var $                   = require('jquery');
    var io                  = require('socketio');
    var socket              = io('/questions');  // I think need to change later
    var getParam            = require('lib/getparam');
    var userManager         = require('app/model/usermanager')();
    var SimilarQuestions    = require('app/model/similarquestions');

    var QuestionController = function () {
        var that = this;
        this.classId = getParam('id');
        this.className = getParam('name');
        this.similarQuestions = new SimilarQuestions();
        socket.emit('join', that.classId); // need to change later

        this.init = function() {
            this.createButtonListeners();
            this.createSocketListeners();
            this.displayQuestionList();
        };

        this.createButtonListeners = function() {
            var isStudent = $("#questionsList") ? true : false; // Check if I'm a student
            if(isStudent) {
                $('#questionSubmitButton').on('click', function () {
                    that.submitQuestion();
                });

                $('#questionAddButton').on('click', function () {
                    $('#questionFormPage').show();
                });

                $('#questionReturn').click(function(){
                    $('#questionFormPage').hide();
                });

                $('#simquestionAddButton').click(function() {
                    $('#similarQuestionsPage').hide();
                })
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
                question: questiontext,
                email: userManager.email,
                name: userManager.userName
            };

            socket.emit('addQuestion', that.classId, question, function(question, queue) {
                that.displaySimilarQuestions(question.question, queue);
            });
            $('#questionInput').val('');
            $('#questionFormPage').hide();
        };

        socket.on('updateQuestionList', function() {
            that.displayQuestionList();
        });



        this.displayQuestionList = function() {
            socket.emit('getQuestionList', that.classId, function(queue) {
                var updateStudentQuestionList = function(questionObject, index) {
                    questionBody.append(
                        '<li>' +
                        '<a id="' + questionObject.email + index + '" href="/main?' + params + '">' + questionObject.question + '</a>' +
                        '</li>');
                };

                var updateTAQuestionList = function(questionObject) {
                    var id = Date.now();
                    questionBody.append(
                        '<li>' +
                        '<button id=' + id + '>' + questionObject.question + '</button>' +
                        '<button id=' + id + 'kick' + '>X</button>' +
                        '</li>');

                    var bringStudentIn = function() {
                        socket.emit('bringUserIn', questionObject.email, url, that.classId);
                    };

                    var kickStudentOut = function() { //TODO Not implemented yet
                        socket.emit('kickUserOut', questionObject.email, url, that.classId);
                    };

                    // Set event handlers for clicks

                    $('#' + id).click(bringStudentIn);
                    $('#' + id + 'kick').click(kickStudentOut);
                };

                // If queue is undefined, set it to empty and do nothing
                queue = queue ? queue : [];
                var params = $.param({
                    id: that.classId,
                    name: that.className
                });

                // variable = booleanExpression ? setIfTrue : setIfFalse;
                var isStudent = $('#questionList').length ? true : false; // Check if I'm a student
                var questionBody = isStudent ? $('#questionList') : $('#workSpaceList');
                var updateQuestionList = isStudent ? updateStudentQuestionList : updateTAQuestionList;
                var url = "/main_student?" + params;

                questionBody.empty(); //Clear the list in the question body

                queue.forEach(updateQuestionList); // Iterate through the question objects in the queue
            })
        };

        this.displaySimilarQuestions = function(question, questionCol) {
            this.similarQuestions.getSimilarQuestions(question, questionCol, function(similarQuestionsArray){
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

    module.exports = QuestionController;
});