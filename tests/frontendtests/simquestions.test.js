define(function(require) {

    var expect = require('chai').expect;
    var ace = require('ace/ace');

    var SimilarQuestions = require('app/model/similarquestions');

    describe("Similar Questions tests ", function () {

        this.timeout(5000);

        var simquestions = null;

        before(function() {
            simquestions = new SimilarQuestions();
        });

        it('testing 1 is equal to 1', function () {
            expect(1).to.be.equal(1);
        });


        describe("Test Similar questions feature", function () {
            it('Successfully finds similar question', function (done) {
                
                done();
            });
        });


    });

});