define(function(require) {

    var expect = require('chai').expect;
    var WorkspaceAdapter = require('app/adapters/googleworkspaceadapter');
    var RealtimeUtils = require('lib/realtimeutils');

    var clientId = '315862064112-anadjteqedc54o1tkhg493e0jqntlfve.apps.googleusercontent.com';
    var realtimeUtils = new RealtimeUtils({clientId: clientId});

    describe("Google Workspace Adapter tests ", function () {

        var adapter = null;
        var createdFileId = '';
        this.timeout(5000);

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

        describe("Adapter creates a file", function () {
            it('Successfully creates a file', function (done) {
                var id = '0B8WWHHPFdW35dTlKX1ZWczV6R1U';
                var name = 'mochaTest' + Date.now() + '.txt';

                adapter.createFile(id, name).then(function(response) {
                    //console.log(response, response.result);
                    expect(response.status).to.be.equal(200);
                    createdFileId = response.result.id;
                    done();
                });
            });
        });

        describe("Adapter deletes a file", function () {
            it('Successfully deletes a file', function (done) {
                adapter.deleteFile(createdFileId).then(function(response) {
                    console.log(response);
                    done();
                });
            });
        });

        describe("Folder operations", function () {
            it('Adapter creates a folder', function (done) {
                var id = '0B8WWHHPFdW35dTlKX1ZWczV6R1U';
                var name = 'mochaTestFolder' + Date.now();

                adapter.createFolder(id, name).then(function(response) {
                    //console.log(response, response.result);
                    createdFileId = response.result.id;
                    expect(response.status).to.be.equal(200);
                    done();
                });
            });
        });
    });

});