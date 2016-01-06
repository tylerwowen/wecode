requirejs.config({
    baseUrl: 'javascripts',
    paths: {
        'jquery': '//ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min',
        'parse': '//www.parsecdn.com/js/parse-1.6.7.min',
        'gapi': '//apis.google.com/js/client',
        'ace': '//cdnjs.cloudflare.com/ajax/libs/ace/1.2.2',
        'socketio': '/socket.io/socket.io',
        'jqueryui': '//ajax.googleapis.com/ajax/libs/jqueryui/1.11.4/jquery-ui.min',
        'angular': '//ajax.googleapis.com/ajax/libs/angularjs/1.3.15/angular.min',
        'chai': '//chaijs.com/chai',
        'bootstrap': '//maxcdn.bootstrapcdn.com/bootstrap/3.3.5/js/bootstrap.min'
    },
    shim: {
        'gapi': {
            exports: 'gapi'
        },
        'draggableObjects': {
            deps: [
                'jquery',
                'jqueryui'
            ]
        },
        'angular': {
            exports: 'angular'
        }
    }
});
