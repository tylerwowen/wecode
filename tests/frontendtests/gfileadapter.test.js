define(function(require) {

    var expect = require('chai').expect;
    var sinona = require('sinon');
    var ace = require('ace/ace');
    var RealtimeDataManager = require('app/model/realtimedatamanager');
    var fileAdaptor = require('app/adapters/googlefileadapter');


    var GoogleFileAdapter = require('app/adapters/googlefileadapter');
    var File = require('app/model/file');
    var RealtimeUtils = require('lib/realtimeutils');

    var RealTimeData = require('app/model/realtimedata');


    var clientId = '315862064112-anadjteqedc54o1tkhg493e0jqntlfve.apps.googleusercontent.com';
    var realtimeUtils = new RealtimeUtils({clientId: clientId});

    describe("Google File Adapter tests ", function () {

        this.timeout(5000);

        var adapter = null;
        var file = null;
        var id = '0B8WWHHPFdW35VmFBekRpNWNyV0U';


        before(function(done) {
            // Authorize first. This should be replace by our own implementation later.
            adapter = new GoogleFileAdapter();
            realtimeUtils.authorize(function(response) {
                //adapter = new GoogleFileAdapter();
                console.log(response);
                done();
            }, false);
        });

        it('testing 1 is equal to 1', function () {
            expect(1).to.be.equal(1);
        });

        //describe("Adapter loads a file", function () {
        //    it('Successfully loads a file', function () {
        //        var name = 'mochaTest' + Date.now() + '.txt';
        //        expect(adapter.loadDriveFile()).to.be.true;
        //    });
        //});

        describe("Adapter loads a file from GoogleFileAdapter", function () {
            it('Successfully loads a file', function (done) {
                adapter.loadDriveFile(id).then(function(response) {
                    //console.log(response);
                    //expect(response.status).to.equal(204);
                    done();
                });
            });
        });

        //describe("Adapter loads a file through file function", function () {
        //    it('Successfully loads a file', function (done) {
        //        adapter.loadDriveFile(id).then(function(response) {
        //            //console.log(response);
        //            //expect(response.status).to.equal(204);
        //            done();
        //        });
        //    });
        //});

    });

});