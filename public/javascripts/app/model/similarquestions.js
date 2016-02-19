define(function (require) {
    "use strict";

    function SimilarQuestions() {
    }

    (function () {

        this.constructor = SimilarQuestions;
        var that = this;

        this.init = function() {

        };

        this.connectToView = function() {
            var that = this;
        };

        this.getSimilarQuestions = function(currentquestion, queue) {
            console.log("here");
            //this.ques = currentquestion.question;
            //this.topic = currentquestion.topic;
            //this.queue = queue;
            //var array = this.ques.split(" ");
            //var counter = 0;
            //var queueQues;
            //var countQuestArray = [];
            //for (var k = 0; k < this.queue.length; k++) {
            //    queueQues = this.queue[k].split(" ");
            //    for (var i = 0; i < array.length; i++) {
            //        for (var j = 0; j < this.queueQues.length; j++) {
            //            if(array[i] == queueQues[j]){
            //                counter++;
            //            }
            //        }
            //    }
            //    countQuestArray.push(counter);
            //}
        };
    }).call(SimilarQuestions.prototype);

    return SimilarQuestions;
});