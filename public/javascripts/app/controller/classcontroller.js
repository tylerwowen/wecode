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
                self.createClass();
                $('#newClassForm').hide();
            });

            $('#TAreturn').click(function(){
                $('#newClassForm').hide();
            });

            $('#StudentAddClass').click(function(){
                $('#addNewClassForm').show();
            });

            $('#studentAddClassButton').click(function(){
                self.studentClass();
                $('#addNewClassForm').hide();
            });


            $('#studentReturn').click(function(){
                $('#addNewClassForm').hide();
            });
        };


        this.createClass = function(){
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
        };

        this.showStudentClasses = function(classList) {
            $('#studentClassList').empty();
            //console.log(classList);
            classList.forEach(function (singleClass) {
                //console.log(singleClass);
                $('#studentClassList').append(
                    '<li>' +
                    '<a href="/main_student?' + singleClass.id + '">' +
                    singleClass.name+ '</a>' +
                    '</li>');
            });
        };

        this.studentClass = function() {
            var that = this;
            var name = $('#studentAddNewClassInput').val();
            classManager.addClass(name).then(function (response){
                if(response != null)
                    that.showStudentClasses(response);
            });
        }
    };

    module.exports = ClassController;
});