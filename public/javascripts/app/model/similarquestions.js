define(function (require) {
    "use strict";

    var $ = require('jquery');
    var io = require('socketio');
    var socket = io.connect();

    function SimilarQuestions(questionJson, queueJson) {
        this.question = JSON.parse(questionJson).question;
        this.topic = JSON.parse(questionJson).topic;
        this.queue = JSON.parse(queueJson).list;
    }

    (function () {

        this.constructor = SimilarQuestions;
        var that = this;

        this.init = function() {

        };

        this.connectToView = function() {
            var that = this;
        };

        this.getSimilarQuestions = function() {
            var array = this.question.split(" ");
            var newList;
            for (var i = 0; i < this.queue.length; i++) {

            }
        };

    }).call(SimilarQuestions.prototype);

    return SimilarQuestions;
});