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

            $('#StudentSelector').click(function(){
                $('li').addClass('inactive');
                $('li').removeClass('selected');
                $('.navbar').removeClass('instructor');
                $(this).addClass('selected');
                $(this).removeClass('inactive');
                $('#student').show();
                $('#instructor').hide();
            });

            $('#TAselector').click(function(){
                $('li').addClass('inactive');
                $('li').removeClass('selected');
                $('.navbar').addClass('instructor');
                $(this).addClass('selected');
                $(this).removeClass('inactive');
                $('#student').hide();
                $('#instructor').show();
            });
        };

        this.createClass = function(){
            var name = $('#TANewClassInput').val();
            classManager.createWorkSpace(name)
                .then(function(){
                    return classManager.refreshWorkspaceList();
                })
                .then(function(classes) {
                    self.refreshClasses(classes);
                });
        };

        this.showClasses = function() {
            var that = this;
            classManager.init().then(function (response) {
                that.showTAClasses(response[0]);
                that.showStudentClasses(response[1]);
            }, function (error) {
                console.error(error);
            });
        };

        this.refreshClasses = function(classes) {
            self.showTAClasses(classes[0]);
            self.showStudentClasses(classes[1]);

        };

        this.showTAClasses = function(TAClassList) {
            $('#TAClassList').empty();
            TAClassList.forEach(function (singleClass) {
                var params = $.param({
                    id: singleClass.id,
                    name: singleClass.name
                });
                $('#TAClassList').append(
                    '<li>' +
                        '<a href="/main?' + params + '">' + singleClass.name + '</a>' +
                    '</li>');
            });
        };

        this.showStudentClasses = function(studentClassList) {
            $('#StudentClassList').empty();
            studentClassList.forEach(function (singleClass) {
                var params = $.param({
                    id: singleClass.id,
                    name: singleClass.name
                });
                $('#StudentClassList').append(
                    '<li>' +
                    '<a href="/questionlist?' + params + '">' +
                    singleClass.name + '</a>' +
                    '</li>');
            });
        };

        this.studentClass = function() {
            var that = this;
            var classId = $('#studentAddNewClassInput').val();
            classManager.addClass(classId).then(function (classList){
                if(classList != null) {
                    that.showStudentClasses(classList);
                }
            });
        }
    };

    module.exports = ClassController;
});