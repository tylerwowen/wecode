define(function(require) {

    var expect = require('chai').expect;
    var ace = require('ace/ace');

    var SimilarQuestions = require('app/model/similarquestions');

    describe("Similar Questions tests ", function () {

        this.timeout(5000);

        var similarQuestions = null;
        var totalQuestionsCount = 0;
        var score = 0;
        
        before(function() {
            similarQuestions = new SimilarQuestions();
        });

        it('testing 1 is equal to 1', function () {
            expect(1).to.be.equal(1);
        });

        describe("Test Similar questions feature", function () {
            it('Reads questions from file', function (done) {
                readTextFile("questions.txt");
                expect(queueTemp.length).to.be.equal(83);
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

            it('Returns similar queston 1', function (done) {
                var currentQuestion = "Return data after ajax call success";
                similarQuestions.getSimilarQuestionsWOTopics(currentQuestion, queueTemp, function(similarQuestionsArray){

                    var len = similarQuestionsArray.length;
                    console.log(similarQuestionsArray, len);
                    totalQuestionsCount =+ len;
                    if( len != 0) {
                        for(var i = 0; i < len; i++) {
                            if(similarQuestionsArray[i] === "How to return data to variable after ajax call success") {
                                score +=((len - i) / len);
                            }
                        }
                        console.log(score);
                    }
                });
                done();
            });

            it('Returns similar queston 2', function (done) {
                var currentQuestion = "How to change commit message?";
                similarQuestions.getSimilarQuestionsWOTopics(currentQuestion, queueTemp, function(similarQuestionsArray){

                    var len = similarQuestionsArray.length;
                    console.log(similarQuestionsArray, len);
                    if( len != 0) {
                        for(var i = 0; i < len; i++) {
                            if(similarQuestionsArray[i] === "Edit an incorrect commit message in command line Git") {
                                score +=((len - i) / len);
                            }
                        }
                        console.log(score);
                    }
                });
                done();
            });

            it('Returns similar queston 3', function (done) {
                var currentQuestion = "A simple explanation of Naive Bayes Classification";
                similarQuestions.getSimilarQuestionsWOTopics(currentQuestion, queueTemp, function(similarQuestionsArray){

                    var len = similarQuestionsArray.length;
                    console.log(similarQuestionsArray, len);
                    if( len != 0) {
                        for(var i = 0; i < len; i++) {
                            if(similarQuestionsArray[i] === "Explain Naive Bayes classifier") {
                                score +=((len - i) / len);
                            }
                        }
                        console.log(score);
                    }
                });
                done();
            });

            it('Returns similar queston 4', function (done) {
                var currentQuestion = "How to create a generic array in Java?";
                similarQuestions.getSimilarQuestionsWOTopics(currentQuestion, queueTemp, function(similarQuestionsArray){

                    var len = similarQuestionsArray.length;
                    console.log(similarQuestionsArray, len);
                    if( len != 0) {
                        for(var i = 0; i < len; i++) {
                            if(similarQuestionsArray[i] === "How to create an array of a generic object in java") {
                                score +=((len - i) / len);
                            }
                        }
                        console.log(score);
                    }
                });
                done();
            });

            it('Returns similar queston 5', function (done) {
                var currentQuestion = "Replacing all occurrences of a string in JavaScript";
                similarQuestions.getSimilarQuestionsWOTopics(currentQuestion, queueTemp, function(similarQuestionsArray){

                    var len = similarQuestionsArray.length;
                    console.log(similarQuestionsArray, len);
                    if( len != 0) {
                        for(var i = 0; i < len; i++) {
                            if(similarQuestionsArray[i] === "How to replace all occurrences of a string in a HTML page using Javascript") {
                                score +=((len - i) / len);
                            }
                        }
                        console.log(score);
                    }
                });
                done();
            });

            it('Returns similar queston 6', function (done) {
                var currentQuestion = "What is an efficient way to implement a singleton pattern in Java?";
                similarQuestions.getSimilarQuestionsWOTopics(currentQuestion, queueTemp, function(similarQuestionsArray){

                    var len = similarQuestionsArray.length;
                    console.log(similarQuestionsArray, len);
                    if( len != 0) {
                        for(var i = 0; i < len; i++) {
                            if(similarQuestionsArray[i] === "How to implement a singleton in java") {
                                score +=((len - i) / len);
                            }
                        }
                        console.log(score);
                    }
                });
                done();
            });

            it('Returns similar queston 7', function (done) {
                var currentQuestion = "Regular Expression split with white spaces";
                similarQuestions.getSimilarQuestionsWOTopics(currentQuestion, queueTemp, function(similarQuestionsArray){

                    var len = similarQuestionsArray.length;
                    console.log(similarQuestionsArray, len);
                    if( len != 0) {
                        for(var i = 0; i < len; i++) {
                            if(similarQuestionsArray[i] === "How to split regex with soaces") {
                                score +=((len - i) / len);
                            }
                        }
                        console.log(score);
                    }
                });
                done();
            });

            it('Returns similar queston 8', function (done) {
                var currentQuestion = "Sort array of objects by string property value in JavaScript";
                similarQuestions.getSimilarQuestionsWOTopics(currentQuestion, queueTemp, function(similarQuestionsArray){

                    var len = similarQuestionsArray.length;
                    console.log(similarQuestionsArray, len);
                    if( len != 0) {
                        for(var i = 0; i < len; i++) {
                            if(similarQuestionsArray[i] === "how to sort array of objects in javascript?") {
                                score +=((len - i) / len);
                            }
                        }
                        console.log(score);
                    }
                });
                done();
            });

            it('Returns similar queston 9', function (done) {
                var currentQuestion = "How to revert to previous commit";
                similarQuestions.getSimilarQuestionsWOTopics(currentQuestion, queueTemp, function(similarQuestionsArray){

                    var len = similarQuestionsArray.length;
                    console.log(similarQuestionsArray, len);
                    if( len != 0) {
                        for(var i = 0; i < len; i++) {
                            if(similarQuestionsArray[i] === "How do you undo the last commit?"
                            || similarQuestionsArray[i] === "Remove or revert previous commit in master from local") {
                                score +=((len - i) / len);
                            }
                        }
                        console.log(score);
                    }
                });
                done();
            });

            it('Returns similar queston 10', function (done) {
                var currentQuestion = "How to create a file and write to a file in Java?";
                similarQuestions.getSimilarQuestionsWOTopics(currentQuestion, queueTemp, function(similarQuestionsArray){

                    var len = similarQuestionsArray.length;
                    console.log(similarQuestionsArray, len);
                    if( len != 0) {
                        for(var i = 0; i < len; i++) {
                            if(similarQuestionsArray[i] === "How to create and write a .Txt file in Java?") {
                                score +=((len - i) / len);
                            }
                        }
                        console.log(score/10);
                    }
                });
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