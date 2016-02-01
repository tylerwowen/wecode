define(function (require, exports, module) {
    var $ = require('jquery');
    var classManager = require('app/model/workspacemanager')();

    var ClassController = function() {
        var self = this;

        this.init = function() {
            self.createButtonListeners();
            self.showClasses();

        };

        this.createButtonListeners = function() {
            $('#TAClassFormButton').click(function() {
                $('#newClassForm').show();
            });

            $('#TACreateClassButton').click(function() {
                self.addClass();
                $('#newClassForm').hide();
            });

            $('#return').click(function(){
                $('#newClassForm').hide();
            });
        };


        this.addClass = function(){
            var name = $('#TANewClassInput').val();
            console.log(name);
            classManager.createWorkSpace(name)
                .then(function(){
                    return classManager.refreshWorkspaceList();
                })
                .then(function() {
                    self.showClasses();
                });
        };

        this.showClasses = function() {
            classManager.init().then(function (classList) {
                $('#TAClassList').empty();
                classList.forEach(function (singleClass) {
                    var params = $.param({
                        id: singleClass.id,
                        name: singleClass.name
                    });
                    $('#TAClassList').append(
                        '<li>' +
                        '<a href="/main?' + params + '">' +
                        singleClass.name+ '</a>' +
                        '</li>');
                })
            }, function (error) {
                console.error(error);
            });
        }
    };

    module.exports = ClassController;
});