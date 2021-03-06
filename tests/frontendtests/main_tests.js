requirejs.config({
    baseUrl: 'public/javascripts',
    paths: {
        'jquery': '//ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min',
        'parse': '//www.parsecdn.com/js/parse-1.6.7.min',
        'gapi': '//apis.google.com/js/client',
        'ace': '//cdnjs.cloudflare.com/ajax/libs/ace/1.2.2',
        'socketio': '/socket.io/socket.io',
        'jqueryui': '//ajax.googleapis.com/ajax/libs/jqueryui/1.11.4/jquery-ui.min',
        'angular': '//ajax.googleapis.com/ajax/libs/angularjs/1.3.15/angular.min',
        'bootstrap': '//maxcdn.bootstrapcdn.com/bootstrap/3.3.5/js/bootstrap.min',
        'chai': '//cdnjs.cloudflare.com/ajax/libs/chai/3.5.0/chai.min',
        'mocha': '//cdn.rawgit.com/mochajs/mocha/2.2.5/mocha',
        'q': 'https://cdnjs.cloudflare.com/ajax/libs/q.js/1.4.1/q.min',
        'sinon': '//cdnjs.cloudflare.com/ajax/libs/sinon.js/1.15.4/sinon.min',
        'chaiaspromised': '//cdn.rawgit.com/domenic/chai-as-promised/master/lib/chai-as-promised',
        'lodash': '//cdn.jsdelivr.net/lodash/3.6.0/lodash'
    },
    shim: {
        'gapi': {
            exports: 'gapi'
        },
        'webrtc': {
            deps: [
                'jquery',
                'public/javascripts/lib/adapter',
                'socketio'
            ]
        },
        'draggableObjects': {
            deps: [
                'jquery',
                'jqueryui'
            ]
        },
        'angular': {
            exports: 'angular'
        },
        'mocha': {
            exports: 'mocha'
        }
    }
});

define(function(require) {
    var $ = require('jquery');
    var chai = require('chai');
    var mocha = require('mocha');
    var chaiAsPromised = require('chaiaspromised');

    chai.use(chaiAsPromised);

    mocha.setup({
        ui:'bdd'
    });

    require([
        //'../../tests/frontendtests/gfileadapter.test',
        //'../../tests/frontendtests/gworkspaceadapter.test',
        //'../../tests/frontendtests/gsetupadapter.test',
        '../../tests/frontendtests/simquestions.test'
    ], function(require) {
        mocha.run();
    });
});

