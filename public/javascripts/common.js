requirejs.config({
    baseUrl: 'javascripts',
    paths: {
        'jquery': '//ajax.googleapis.com/ajax/libs/jquery/2.2.0/jquery.min',
        'parse': '//www.parsecdn.com/js/parse-1.6.7.min',
        'gapi': '//apis.google.com/js/client',
        'ace': '//cdnjs.cloudflare.com/ajax/libs/ace/1.2.2',
        'socketio': '/socket.io/socket.io',
        'jqueryui': '//ajax.googleapis.com/ajax/libs/jqueryui/1.11.4/jquery-ui.min',
        'angular': '//ajax.googleapis.com/ajax/libs/angularjs/1.3.15/angular.min',
        'bootstrap': '//maxcdn.bootstrapcdn.com/bootstrap/3.3.5/js/bootstrap.min',
        'q': '//cdnjs.cloudflare.com/ajax/libs/q.js/1.4.1/q.min',
        'login.bootstrap':  '//netdna.bootstrapcdn.com/twitter-bootstrap/2.3.2/js/bootstrap.min',
        'login.jquery': '//code.jquery.com/jquery.min',
        'lodash': '//cdn.jsdelivr.net/lodash/3.6.0/lodash'
    },
    shim: {
        'gapi': {
            exports: 'gapi'
        },
        'angular': {
            exports: 'angular'
        }
    }
});
