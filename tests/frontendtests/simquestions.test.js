define(function (require) {

    var expect = require('chai').expect;
    var ace = require('ace/ace');

    var SimilarQuestions = require('app/model/similarquestions');
    var similarQuestions = null;


    var queueTemp = [];
    var queriesTemp = null;
    var simTemp = null;

    describe("Similar Questions tests ", function () {

        this.timeout(5000);

        before(function () {
            similarQuestions = new SimilarQuestions();
            readTextFile("queueQuestions.txt");
            readTextFile("queryQuestions.txt");
            readTextFile("similarQuestions.txt");
        });

        it('testing 1 is equal to 1', function () {
            expect(1).to.be.equal(1);
        });

        describe("Test Similar questions feature", function () {

            it('testing stemming', function () {
                expect(similarQuestions.stemWord("international")).to.be.equal("intern");
            });

            it('Removes punctuation', function (done) {
                var s = "This., -/ is #! an $ % ^ & * example ;: {} of a = -_ string with `~)()hello's punctuation?";
                var array = similarQuestions.getStringArray(s);
                expect(array).to.deep.equal(["this", "is", "an", "example", "of", "a", "string", "with", "hellos", "punctuation"]);
                done();
            });

            it('Checks stop word', function (done) {
                var s = "this is that to be if anything is here how to";
                var array = similarQuestions.getStringArray(s);
                for (var i = 0; i < array.length; i++) {
                    expect(similarQuestions.isStopWord(array[i])).to.be.equal(true);
                }
                done();
            });

            it('Checks synonym', function (done) {
                var s = "modify change eliminate remove delete";
                var array = similarQuestions.getStringArray(s);
                for (var i = 0; i < array.length; i++) {
                    array[i] = similarQuestions.getSynonym(array[i]);
                }
                expect(array).to.deep.equal(["edit", "edit", "remove", "remove", "remove"]);
                done();
            });

            it('Sort by word count example', function (done) {
                var arr = [[0, 10], [3, 9], [1, 8], [9, 7]];
                var resArr = [[9, 7], [1, 8], [3, 9], [0, 10]];
                arr.sort(function (a, b) {
                    return (a[1] < b[1] ? -1 : (a[1] > b[1] ? 1 : 0));
                });
                expect(arr).to.deep.equal(resArr);
                done();
            });

            it('Calculate similar questions accuracy', function (done) {
                var queryCount = queriesTemp.length;
                var currentQuestion, simArrayLength;
                var totalQuestionsCount = 0, score = 0;

                var start = new Date().getTime();

                for (var q = 0; q < queryCount; q++) {
                    currentQuestion = queriesTemp[q];
                    similarQuestions.getSimilarQuestions(currentQuestion, queueTemp, function (similarQuestionsArray) {
                        simArrayLength = similarQuestionsArray.length;
                        totalQuestionsCount += simArrayLength;
                        if (simArrayLength != 0) {
                            for (var i = 0; i < simArrayLength; i++) {
                                if (similarQuestionsArray[i].question === simTemp[q]) {
                                    score += (simArrayLength - i);
                                }
                            }
                        }
                    });
                }

                var end = new Date().getTime();
                var time = end - start;
                console.log("Average time for a question: ", time / 10000, "seconds");
                console.log("Total accuracy: ", (score / totalQuestionsCount * 100).toFixed(2), "%");
                done();
            });
        });
    });

    function readTextFile(file) {
        var rawFile = new XMLHttpRequest();
        rawFile.open("GET", file, false);
        rawFile.onreadystatechange = function () {
            if (rawFile.readyState === 4) {
                if (rawFile.status === 200 || rawFile.status == 0) {
                    if (file === "queueQuestions.txt") {
                        var questionStrings = String(rawFile.responseText).split('\n');
                        questionStrings.forEach(function (question) {
                            queueTemp.push({question: question});
                        })
                    } else if (file === "queryQuestions.txt") {
                        queriesTemp = String(rawFile.responseText).split('\n');
                    } else if (file === "similarQuestions.txt") {
                        simTemp = String(rawFile.responseText).split('\n');
                    }
                }
            }
        };
        rawFile.send(null);
    }
});