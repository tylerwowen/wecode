define(function(require) {

    var chai = require('chai');
    var chaiAsPromised = require("../../tests/frontendtests/lib/chaiaspromised");
    var WorkspaceAdapter = require('app/adapters/googleworkspaceadapter');
    var RealtimeUtils = require('lib/realtimeutils');

    var expect = chai.expect;
    chai.use(chaiAsPromised);

    var clientId = '315862064112-anadjteqedc54o1tkhg493e0jqntlfve.apps.googleusercontent.com';
    var realtimeUtils = new RealtimeUtils({clientId: clientId});


    describe("Google Workspace Adapter tests ", function () {

        before(function(done) {
            realtimeUtils.authorize(function(response) {
                done();
            }, false);
        });

        it('testing 1 is equal to 1', function () {
            expect(1).to.be.equal(1);
        });

        it('filesystem sets the correct workspace Id', function () {
            var adapter = new WorkspaceAdapter();
            var id = '0B8WWHHPFdW35dTlKX1ZWczV6R1U';
            var name = 'mochaTest.txt' + Date.now();

            //adapter.createFile(id, name).then(function(response) {
            //
            //}, function(reason) {
            //    console.error(name, 'was not created:', reason.result.error.message);
            //});

            return expect(adapter.createFile(id, name)).to.eventually.exist;
        });
    });

});