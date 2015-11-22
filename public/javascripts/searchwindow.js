define(function(require) {

    var angular = require('angular');
    angular.element(document).ready(function () {
        var app = angular.module("app", []);
        app.controller("test", function ($scope) {
            $scope.show = false;
        });
        angular.bootstrap(document, ["app"]);
    });
});