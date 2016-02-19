define(function (require) {
    "use strict";

    var $ = require('jquery');

    function SimilarQuestions() {}

    (function () {

        this.constructor = SimilarQuestions;
        var that = this;

        this.init = function() {

        };

        this.connectToView = function() {
            var that = this;
        };

        this.getSimilarQuestions = function(currentquestion, queue) {
            this.ques = currentquestion.question.toLowerCase();
            this.topic = currentquestion.topic;
            this.queue = queue;

            var array = this.ques.split(" ");
            var counter = 0;
            var queueQues;
            var countQuestArray = [];
            for (var k = 0; k < this.queue.length; k++) {
                queueQues = (this.queue[k].question.toLowerCase()).split("\\s+");
                counter = 0;
                for (var i = 0; i < array.length; i++) {
                    for (var j = 0; j <queueQues.length; j++) {
                        if(array[i].localeCompare(queueQues[j]) == 0 ){
                            counter++;
                        }
                    }
                }
                countQuestArray.push(counter);
            }
            var max = countQuestArray[0];
            var maxIndex = 0;

            for (var i = 1; i < countQuestArray.length; i++) {
                if (countQuestArray[i] > max) {
                    maxIndex = i;
                    max = countQuestArray[i];
                }
            }

            return this.queue[maxIndex].question;
        };

        this.getSimilarQuestionsWOTopics = function(currentquestion, queue) {
            this.ques = currentquestion.toLowerCase();
            this.queue = queue;

            var array = this.ques.split(/\s+/);
            var counter = 0;
            var queueQues;
            var countQuestArray = [];
            for (var k = 0; k < this.queue.length; k++) {
                queueQues = (this.queue[k].toLowerCase()).split(/\s+/);
                counter = 0;
                for (var i = 0; i < array.length; i++) {
                    for (var j = 0; j < queueQues.length; j++) {
                        var res = array[i].localeCompare(queueQues[j]);
                        if(res == 0 ){
                            counter++;
                        }
                    }
                }
                countQuestArray.push(counter);
            }
            var max = countQuestArray[0];
            var maxIndex = 0;
            var secondMaxIndex = 0;

            for (var i = 1; i < countQuestArray.length; i++) {
                if (countQuestArray[i] > max) {
                    secondMaxIndex = maxIndex;
                    maxIndex = i;
                    max = countQuestArray[i];
                }
            }
            var arr = [this.queue[maxIndex], this.queue[secondMaxIndex]];
            //console.log(arr);
            return arr;
        };

    }).call(SimilarQuestions.prototype);

    return SimilarQuestions;
});