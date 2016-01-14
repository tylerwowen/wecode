define(function(require) {

    var expect = require('chai').expect;
    var WorkspaceAdapter = require('app/adapters/googleworkspaceadapter');
    var RealtimeUtils = require('lib/realtimeutils');

    var clientId = '315862064112-anadjteqedc54o1tkhg493e0jqntlfve.apps.googleusercontent.com';
    var realtimeUtils = new RealtimeUtils({clientId: clientId});

    describe("Google Workspace Adapter tests ", function () {

        this.timeout(5000);

        var adapter = null;
        var createdFileId = '',
            createdFolderId = '';
        var id = '0B8WWHHPFdW35Z2t2eXU1S0RaMFE';


        before(function(done) {
            // Authorize first. This should be replace by our own implementation later.
            realtimeUtils.authorize(function(response) {
                adapter = new WorkspaceAdapter();
                adapter.load().then(function() {
                    done();
                });
            }, false);
        });

        it('testing 1 is equal to 1', function () {
            expect(1).to.be.equal(1);
        });

        describe("Adapter returns a list", function () {
            it('Successfully returns a list', function (done) {
                adapter.getContentsList(id).then(function(response) {
                    console.log(response, response.result);
                    expect(response.result.files.length).to.be.equal(2);
                    done();
                });
            });
        });

        describe("Adapter creates a file", function () {
            it('Successfully creates a file', function (done) {
                var name = 'mochaTest' + Date.now() + '.txt';

                adapter.createFile(id, name).then(function(response) {
                    // console.log(response, response.result);
                    expect(response.status).to.be.equal(200);
                    createdFileId = response.result.id;
                    done();
                });
            });
        });

        describe("Adapter deletes a file", function () {
            it('Successfully deletes a file', function (done) {
                adapter.deleteFile(createdFileId).then(function(response) {
                    // console.log(response);
                    expect(response.status).to.be.equal(204);
                    done();
                });
            });
        });

        describe("Adapter creates a folder", function () {
            it('Adapter creates a folder', function (done) {
                var name = 'mochaTestFolder' + Date.now();

                adapter.createFolder(id, name).then(function(response) {
                    expect(response.status).to.be.equal(200);
                    createdFolderId = response.result.id;
                    done();
                });
            });
        });

        describe("Adapter deletes a folder", function () {
            it('Successfully deletes a folder', function (done) {
                adapter.deleteFolder(createdFolderId).then(function(response) {
                    expect(response.status).to.be.equal(204);
                    done();
                });
            });
        });
    });

});