define(function(require) {

    var expect = require('chai').expect;
    var sinona = require('sinon');

    var GoogleFileAdapter = require('app/adapters/googlefileadapter');
    var RealtimeUtils = require('lib/realtimeutils');
    var RealTimeDataManager = require('app/model/realtimedata');
    var realTimeDataManager = sinona.mock(RealTimeDataManager);

    var clientId = '315862064112-anadjteqedc54o1tkhg493e0jqntlfve.apps.googleusercontent.com';
    var realtimeUtils = new RealtimeUtils({clientId: clientId});

    describe("Google File Adapter tests ", function () {

        this.timeout(5000);

        var adapter = null;

        var fileId = '';
        var id = '0B8WWHHPFdW35Z2t2eXU1S0RaMFE';


        before(function(done) {
            // Authorize first. This should be replace by our own implementation later.
            realtimeUtils.authorize(function(response) {
                adapter = new GoogleFileAdapter(realTimeDataManager);
                done();
            }, false);
        });

        it('testing 1 is equal to 1', function () {
            expect(1).to.be.equal(1);
        });

        describe("Adapter loads a file", function () {
            it('Successfully loads a file', function (done) {
                var name = 'mochaTest' + Date.now() + '.txt';

                adapter.loadDriveFile(id).then(function(response) {
                //    // console.log(response, response.result);
                //    expect(response.status).to.be.equal(200);
                //    fileId = response.result.id;
                    done();
                });
            });
        });

    });

});