define(function(require) {

    var expect = require('chai').expect,
        SetupAdapter = require('app/adapters/googlesetupadapter'),
        RealtimeUtils = require('lib/realtimeutils');

    var clientId = '315862064112-anadjteqedc54o1tkhg493e0jqntlfve.apps.googleusercontent.com';
    var realtimeUtils = new RealtimeUtils({clientId: clientId});

    describe("Google Setup Adapter tests ", function () {

        this.timeout(5000);

        var adapter = null;
        var rootFolderId = '0B8WWHHPFdW35RGdfLVN4a1pUOE0';

        before(function(done) {
            // Authorize first. This should be replace by our own implementation later.
            realtimeUtils.authorize(function(response) {
                adapter = new SetupAdapter();
                adapter.load().then(function() {
                    done();
                });
            }, true);
        });

        it('testing 1 is equal to 1', function () {
            expect(1).to.be.equal(1);
        });

        //describe("Adapter creates a json file in appdata folder", function () {
        //    it('Successfully creates a json file', function (done) {
        //        var jsonId;
        //        adapter.createConfigurationFile(rootFolderId).then(function(response) {
        //            jsonId = response.result.id;
        //            expect(response.status).to.equal(200);
        //            done();
        //        }).then(function() {
        //            return adapter.deleteFile(jsonId);
        //        }).then(function(response) {
        //            expect(response.status).to.equal(204);
        //            done();
        //        });
        //    });
        //});

        describe("Adapter loads workspace list", function () {
            it('Successfully returns a list', function (done) {
                adapter.getWorkspaceList(rootFolderId).then(function(list) {
                    expect(list.length).to.be.above(0);
                    done();
                });
            });
        });

        describe("Adapter creates a folder", function () {

            it('creates the root folder in home directory', function (done) {
                var rootFolderId;
                adapter.createRootFolder().then(function(folderId) {
                    rootFolderId = folderId;
                    expect(folderId).to.exist;
                }).then(function() {
                    return adapter.deleteFile(rootFolderId);
                }).then(function() {
                    done();
                });
            });
        });


    });

});