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
                var arr = [[0, 10, 4, 4], [3, 9, 3, 3], [1, 8, 2, 2], [9, 7, 1, 1]];
                var resArr = [[9, 7, 1, 1], [1, 8, 2, 2], [3, 9, 3, 3], [0, 10, 4, 4]];
                arr.sort(function (a, b) {
                    return (a[1] < b[1] ? -1 : (a[1] > b[1] ? 1 : 0));
                });
                expect(arr).to.deep.equal(resArr);
                done();
            });

            it('Remove duplicates', function (done) {
                var arr = ["hello", "may", "hello"];
                var resArr = ["hello", "may"];
                expect(similarQuestions.removeDuplicate(arr)).to.deep.equal(resArr);
                done();
            });

            var total = 0;
            it('Calculate similar questions accuracy 1', function (done) {
                var currentQuestion, simArrayLength;
                var totalQuestionsCount = 0, score = 0;

                var start = new Date().getTime();

                currentQuestion = "Return data after ajax call success";
                similarQuestions.getSimilarQuestionsTest(currentQuestion, queueTemp, function (similarQuestionsArray) {
                    simArrayLength = similarQuestionsArray.length;
                    totalQuestionsCount = simArrayLength;
                    if (simArrayLength != 0) {
                        for (var i = 0; i < simArrayLength; i++) {
                            if (similarQuestionsArray[i].question === "How to return data to variable after ajax call success") {
                                score += 1;
                            }
                            if (similarQuestionsArray[i].question === "Jquery Ajax Call Return") {
                                score += 1;
                            }
                        }
                    }
                });


                var accuracy = (score / totalQuestionsCount);
                var recall = (score / 2 );
                var f_score = 2*accuracy*recall / (accuracy+recall);
                var end = new Date().getTime();
                var time = end - start;
                console.log("Average time for a question: ", time / 10000, "seconds");
                console.log("f_socre: ", f_score*100 , "%");
                total +=f_score;
                console.log("total",total);
                done();
            });

            it('Calculate similar questions accuracy 2', function (done) {
                var currentQuestion, simArrayLength;
                var totalQuestionsCount = 0, score = 0;

                var start = new Date().getTime();

                currentQuestion = "How to change commit message in git?";
                similarQuestions.getSimilarQuestionsTest(currentQuestion, queueTemp, function (similarQuestionsArray) {
                    simArrayLength = similarQuestionsArray.length;
                    totalQuestionsCount = simArrayLength;
                    if (simArrayLength != 0) {
                        for (var i = 0; i < simArrayLength; i++) {
                            if (similarQuestionsArray[i].question === "Edit an incorrect commit message in command line Git"
                                || similarQuestionsArray[i].question === "How to modify a specified commit in git?"
                                || similarQuestionsArray[i].question === "Change commit author at one specific commit") {
                                score += 1;
                            }
                        }
                    }
                });

                var accuracy = (score / totalQuestionsCount);
                var recall = (score / 3 );
                var f_score = 2*accuracy*recall / (accuracy+recall);
                var end = new Date().getTime();
                var time = end - start;
                console.log("Average time for a question: ", time / 10000, "seconds");
                console.log("f_socre: ", f_score*100 , "%");
                total +=f_score;
                console.log("total",total);
                done();
            });

            it('Calculate similar questions accuracy 3', function (done) {
                var currentQuestion, simArrayLength;
                var totalQuestionsCount = 0, score = 0;

                var start = new Date().getTime();

                currentQuestion = "A simple explanation of Naive Bayes Classification";
                similarQuestions.getSimilarQuestionsTest(currentQuestion, queueTemp, function (similarQuestionsArray) {
                    simArrayLength = similarQuestionsArray.length;
                    totalQuestionsCount = simArrayLength;
                    if (simArrayLength != 0) {
                        for (var i = 0; i < simArrayLength; i++) {
                            if (similarQuestionsArray[i].question === "Gaussian Naive Bayes classification") {
                                score += 1;
                            }
                        }
                    }
                });

                var accuracy = (score / totalQuestionsCount);
                var recall = (score / 1);
                var f_score = 2*accuracy*recall / (accuracy+recall);
                var end = new Date().getTime();
                var time = end - start;
                console.log("Average time for a question: ", time / 10000, "seconds");
                console.log("f_socre: ", f_score*100 , "%");
                total +=f_score;
                console.log("total",total);
                done();
            });

            it('Calculate similar questions accuracy 4', function (done) {
                var currentQuestion, simArrayLength;
                var totalQuestionsCount = 0, score = 0;

                var start = new Date().getTime();

                currentQuestion = "How to create a generic array in Java?";
                similarQuestions.getSimilarQuestionsTest(currentQuestion, queueTemp, function (similarQuestionsArray) {
                    simArrayLength = similarQuestionsArray.length;
                    totalQuestionsCount = simArrayLength;
                    if (simArrayLength != 0) {
                        for (var i = 0; i < simArrayLength; i++) {
                            if (similarQuestionsArray[i].question === "How to create a fixed size array of a generic type in Java?"
                            || similarQuestionsArray[i].question === "How to create an array of a generic object in java") {
                                score += 1;
                            }
                        }
                    }
                });

                var accuracy = (score / totalQuestionsCount);
                var recall = (score / 2);
                var f_score = 2*accuracy*recall / (accuracy+recall);
                var end = new Date().getTime();
                var time = end - start;
                console.log("Average time for a question: ", time / 10000, "seconds");
                console.log("f_socre: ", f_score*100 , "%");
                total +=f_score;
                console.log("total",total);
                done();
            });

            it('Calculate similar questions accuracy 5', function (done) {
                var currentQuestion, simArrayLength;
                var totalQuestionsCount = 0, score = 0;

                var start = new Date().getTime();

                currentQuestion = "Replacing all occurrences of a string in JavaScript";
                similarQuestions.getSimilarQuestionsTest(currentQuestion, queueTemp, function (similarQuestionsArray) {
                    simArrayLength = similarQuestionsArray.length;
                    totalQuestionsCount = simArrayLength;
                    if (simArrayLength != 0) {
                        for (var i = 0; i < simArrayLength; i++) {
                            if (similarQuestionsArray[i].question === "How to replace all occurrences of a string in a HTML page using Javascript") {
                                score += 1;
                            }
                        }
                    }
                });

                var accuracy = (score / totalQuestionsCount);
                var recall = (score / 1);
                var f_score = 2*accuracy*recall / (accuracy+recall);
                var end = new Date().getTime();
                var time = end - start;
                console.log("Average time for a question: ", time / 10000, "seconds");
                console.log("f_socre: ", f_score*100 , "%");
                total +=f_score;
                console.log("total",total);
                done();
            });

            it('Calculate similar questions accuracy 6', function (done) {
                var currentQuestion, simArrayLength;
                var totalQuestionsCount = 0, score = 0;

                var start = new Date().getTime();

                currentQuestion = "What is an efficient way to implement a singleton pattern in Java?";
                similarQuestions.getSimilarQuestionsTest(currentQuestion, queueTemp, function (similarQuestionsArray) {
                    simArrayLength = similarQuestionsArray.length;
                    totalQuestionsCount = simArrayLength;
                    if (simArrayLength != 0) {
                        for (var i = 0; i < simArrayLength; i++) {
                            if (similarQuestionsArray[i].question === "What is an efficient way to implement singleton pattern in C#?"
                                || similarQuestionsArray[i].question === "What is the issue with this java singleton class implementation?"
                                || similarQuestionsArray[i].question === "How to implement a singleton in java") {
                                score += 1;
                            }
                        }
                    }
                });

                var accuracy = (score / totalQuestionsCount);
                var recall = (score / 3);
                var f_score = 2*accuracy*recall / (accuracy+recall);
                var end = new Date().getTime();
                var time = end - start;
                console.log("Average time for a question: ", time / 10000, "seconds");
                console.log("f_socre: ", f_score*100 , "%");
                total +=f_score;
                console.log("total",total);
                done();
            });

            it('Calculate similar questions accuracy 7', function (done) {
                var currentQuestion, simArrayLength;
                var totalQuestionsCount = 0, score = 0;

                var start = new Date().getTime();

                currentQuestion = "Regular Expression split with white spaces";
                similarQuestions.getSimilarQuestionsTest(currentQuestion, queueTemp, function (similarQuestionsArray) {
                    simArrayLength = similarQuestionsArray.length;
                    totalQuestionsCount = simArrayLength;
                    if (simArrayLength != 0) {
                        for (var i = 0; i < simArrayLength; i++) {
                            if (similarQuestionsArray[i].question === "How to split regular expression with spaces"
                                || similarQuestionsArray[i].question === "Regular Expression Split on nᵗʰ occurrence"
                                || similarQuestionsArray[i].question === "java regular expression split pattern"
                                || similarQuestionsArray[i].question === "Regular expression split") {
                                score += 1;
                            }
                        }
                    }
                });

                var accuracy = (score / totalQuestionsCount);
                var recall = (score / 4);
                var f_score = 2*accuracy*recall / (accuracy+recall);
                var end = new Date().getTime();
                var time = end - start;
                console.log("Average time for a question: ", time / 10000, "seconds");
                console.log("f_socre: ", f_score*100 , "%");
                total +=f_score;
                console.log("total",total);
                done();
            });

            it('Calculate similar questions accuracy 8', function (done) {
                var currentQuestion, simArrayLength;
                var totalQuestionsCount = 0, score = 0;

                var start = new Date().getTime();

                currentQuestion = "Sort array of objects by string property value in JavaScript";
                similarQuestions.getSimilarQuestionsTest(currentQuestion, queueTemp, function (similarQuestionsArray) {
                    simArrayLength = similarQuestionsArray.length;
                    totalQuestionsCount = simArrayLength;
                    if (simArrayLength != 0) {
                        for (var i = 0; i < simArrayLength; i++) {
                            if (similarQuestionsArray[i].question === "Sort array of objects by string property value in JavaScript"
                                || similarQuestionsArray[i].question === "how to sort array of objects in javascript?") {
                                score += 1;
                            }
                        }
                    }
                });

                var accuracy = (score / totalQuestionsCount);
                var recall = (score / 2);
                var f_score = 2*accuracy*recall / (accuracy+recall);
                var end = new Date().getTime();
                var time = end - start;
                console.log("Average time for a question: ", time / 10000, "seconds");
                console.log("f_socre: ", f_score*100 , "%");
                total +=f_score;
                console.log("total",total);
                done();
            });

            it('Calculate similar questions accuracy 9', function (done) {
                var currentQuestion, simArrayLength;
                var totalQuestionsCount = 0, score = 0;

                var start = new Date().getTime();

                currentQuestion = "How to remove to previous commit";
                similarQuestions.getSimilarQuestionsTest(currentQuestion, queueTemp, function (similarQuestionsArray) {
                    simArrayLength = similarQuestionsArray.length;
                    totalQuestionsCount = simArrayLength;
                    if (simArrayLength != 0) {
                        for (var i = 0; i < simArrayLength; i++) {
                            if (similarQuestionsArray[i].question === "Remove or revert previous commit in master from local"
                                || similarQuestionsArray[i].question === "removing commit permanently on local") {
                                score += 1;
                            }
                        }
                    }
                });

                var accuracy = (score / totalQuestionsCount);
                var recall = (score / 2);
                var f_score = 2*accuracy*recall / (accuracy+recall);
                var end = new Date().getTime();
                var time = end - start;
                console.log("Average time for a question: ", time / 10000, "seconds");
                console.log("f_socre: ", f_score*100 , "%");
                total +=f_score;
                console.log("total",total);
                done();
            });

            it('Calculate similar questions accuracy 10', function (done) {
                var currentQuestion, simArrayLength;
                var totalQuestionsCount = 0, score = 0;

                var start = new Date().getTime();

                currentQuestion = "What is a Null Pointer Exception, and how do I fix it?";
                similarQuestions.getSimilarQuestionsTest(currentQuestion, queueTemp, function (similarQuestionsArray) {
                    simArrayLength = similarQuestionsArray.length;
                    totalQuestionsCount = simArrayLength;
                    if (simArrayLength != 0) {
                        for (var i = 0; i < simArrayLength; i++) {
                            if (similarQuestionsArray[i].question === "How to fix null pointer exception?") {
                                score += 1;
                            }
                        }
                    }
                });

                var accuracy = (score / totalQuestionsCount);
                var recall = (score / 1);
                var f_score = 2*accuracy*recall / (accuracy+recall);
                var end = new Date().getTime();
                var time = end - start;
                console.log("Average time for a question: ", time / 10000, "seconds");
                console.log("f_socre: ", f_score*100 , "%");
                total +=f_score;
                console.log("total",total, (total*10).toFixed(2));
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