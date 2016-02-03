define(function (require) {
    "use strict";

    var $ = require('jquery');

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
                that.submitQuestion();
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

    }).call(Controller.prototype);

    return Controller;
});