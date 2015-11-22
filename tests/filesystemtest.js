var expect = require('chai').expect;
var requirejs = require('requirejs');
var FileSystem = require('../public/javascripts/app/model/filesystem.js');

describe("Testing examples", function () {
    it('testing 1 is equal to 1', function () {
        expect(1).to.be.equal(1);
    });

    it('filesystem sets the correct workspace Id', function () {
        var expectedWorkSpaceId = 1234;
        var filesystem = new FileSystem(expectedWorkSpaceId);
        var actualWorkSpaceId = filesystem.wsID;
        expect(actualWorkSpaceId).to.be.equal(expectedWorkSpaceId);
    });
});


