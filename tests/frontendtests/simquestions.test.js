define(function(require) {

    var expect = require('chai').expect;
    var ace = require('ace/ace');

    var SimilarQuestions = require('app/model/similarquestions');
    var queue;

    describe("Similar Questions tests ", function () {

        this.timeout(5000);

        var similarQuestions = null;

        before(function() {
            similarQuestions = new SimilarQuestions();
        });

        it('testing 1 is equal to 1', function () {
            expect(1).to.be.equal(1);
        });

        describe("Test Similar questions feature", function () {
            it('Successfully reads questions from file', function (done) {
                readTextFile("questions.txt");
                expect(queue.length).to.be.equal(50);
                done();
            });

            it('Successfully returns similar queston 1', function (done) {
                var currentQuestion = "JavaScript function that returns AJAX call data";
                // How to call javascript validate function before form submit on an ajax call
                var simQuestion = similarQuestions.getSimilarQuestionsWOTopics(currentQuestion, queue);
                console.log(simQuestion);
                //expect(simQuestion).to.be.equal("Return data after ajax call success");
                done();
            });
        });


    });

    function readTextFile(file) {
        var rawFile = new XMLHttpRequest();
        rawFile.open("GET", file, false);
        rawFile.onreadystatechange = function () {
            if(rawFile.readyState === 4) {
                if(rawFile.status === 200 || rawFile.status == 0) {
                    queue = String(rawFile.responseText).split('\n');
                }
            }
        };
        rawFile.send(null);
    }


});