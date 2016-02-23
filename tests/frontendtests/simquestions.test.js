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
            it('Reads questions from file', function (done) {
                readTextFile("questions.txt");
                expect(queueTemp.length).to.be.equal(50);
                done();
            });

            it('Removes punctuation', function (done) {
                var s = "This., -/ is #! an $ % ^ & * example ;: {} of a = -_ string with `~)()hello's punctuation";
                var array = similarQuestions.getStringArray(s);
                expect(array).to.deep.equal(["this", "is", "an", "example", "of", "a", "string", "with", "hellos", "punctuation"]);
                done();
            });

            it('Checks stop word', function (done) {
                var s = "this is that to be if anything is here";
                var array = similarQuestions.getStringArray(s);
                for(var i = 0; i < array.length; i++) {
                    expect(similarQuestions.isStopWord(array[i])).to.be.equal(true);
                }
                done();
            });

            it('Sort by word count example', function (done) {
                var arr = [[0, 10], [3, 9], [1, 8], [9, 7]];
                var resArr = [[9, 7], [1, 8], [3, 9], [0, 10]];
                arr.sort(function(a, b) { return (a[1] < b[1] ? -1 : (a[1] > b[1] ? 1 : 0)); });
                expect(arr).to.deep.equal(resArr);
                done();
            });

            //it('Sort by word count questions', function (done) {
            //    var currentQuestion = "JavaScript function that return AJAX call data";
            //    // How to call javascript validate function before form submit on an ajax call
            //    var simQuestion = similarQuestions.getSimilarQuestionsWOTopics(currentQuestion, queueTemp);
            //    console.log(simQuestion);
            //    //expect(simQuestion).to.be.equal("Return data after ajax call success");
            //    done();
            //});

            it('Returns similar questons 1', function (done) {
                var currentQuestion = "JavaScript function that return AJAX call data";
                // How to call javascript validate function before form submit on an ajax call
                var simQuestion = similarQuestions.getSimilarQuestionsWOTopics(currentQuestion, queueTemp);
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
                    queueTemp = String(rawFile.responseText).split('\n');
                }
            }
        };
        rawFile.send(null);
    }


});