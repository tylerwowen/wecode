define(function(require) {

    var angular = require('angular'),
        $ = require('jquery'),
        WorkSpaceManager = require('app/model/workspacemanager');

    angular.element(document).ready(function () {
        var app = angular.module("app", []);
        app.controller("selected", function ($scope) {
            $scope.show = false;
        });
        angular.bootstrap(document, ["app"]);
    });

    $(".non-psersistent").click(function() {
        var presenting = $('.non-psersistent.selected');
        $(presenting.attr('associated')).animate({
            right: "4%",
            width: "toggle"
        }, 250);
        presenting.removeClass('selected');

        if (presenting && presenting[0] != $(this)[0]) {
            $($(this).attr('associated')).animate({
                right: "4%",
                width: "toggle"
            }, 250);
            $(this).addClass('selected');
        }
    });

    var workspaceManager = WorkSpaceManager();

    function showWorkSpaceList() {

        workspaceManager.init().then(function (workSpaceList) {
            $('#workSpaceList').empty();
            workSpaceList.forEach(function (workSpace) {
                var params = $.param({
                    id: workSpace.id,
                    name: workSpace.name
                });
                $('#workSpaceList').append(
                    '<li>' +
                    '<a href="/main?' + params + '">' +
                    workSpace.name+ '</a>' +
                    '</li>');
            })
        }, function (error) {
            console.error(error);
        });
    }
    showWorkSpaceList();

    $('#workSpaceButton').click(function() {
        var name = $('#newWorkSpaceInput').val();
        console.log(name);
        workspaceManager.createWorkSpace(name)
            .then(function(){
                return workspaceManager.refreshWorkspaceList();
            })
            .then(function() {
                showWorkSpaceList();
            });
    });

    $('#openTerminal').click(function () {
        if ($(this).hasClass('selected')) {
            $(this).removeClass('selected');
            $('#termwrapper').hide();
            $('#editor').css('width', '100%').trigger('resize');
        }
        else {
            $(this).addClass('selected');
            $('#termwrapper').toggle();
            $('#editor').css('width', '55%').trigger('resize');
        }
    });

    $('#inviteEmail').on('click', function() {
        window.location.href="mailto:?subject=Join%20me%20at%20WeCode!"+document.title+"&body="+escape(window.location.href);
    });

});