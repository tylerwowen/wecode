define(function (require, exports, module) {
    var $ = require('jquery');
    var classManager = require('app/model/workspacemanager')();

    var ClassController = function() {
        var self = this;

        this.init = function() {
            self.createButtonListeners();
            self.showClasses();
            self.showStudentClasses();
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

            $('#StudentSelector').addClass('selected');
            $('#TAselector').addClass('inactive');
            
            $('#StudentSelector').click(function(){
                $('li').addClass('inactive');
                $('li').removeClass('selected');
                $(this).addClass('selected');
                $(this).removeClass('inactive');
                $('#student').show();
                $('#instructor').hide();
            });

            $('#TAselector').click(function(){
                $('li').addClass('inactive');
                $('li').removeClass('selected');
                $(this).addClass('selected');
                $(this).removeClass('inactive');
                $('#student').hide();
                $('#instructor').show();
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
            classManager.init().then(function (response) {
                var classList = response[0];
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

        this.showStudentClasses = function() {
            classManager.init().then(function (response) {
                var classList = response[1];
                $('#StudentClassList').empty();
                classList.forEach(function (singleClass) {
                    console.log(singleClass);
                    var params = $.param({
                        id: singleClass.id,
                        name: singleClass.name
                    });
                    $('#StudentClassList').append(
                        '<li>' +
                        '<a href="/questionlist?' + params +'">' +
                        singleClass.name+ '</a>' +
                        '</li>');
                });
            }, function (error) {
                console.error(error);
            });

            //$('#studentClassList').empty();
            //classList.forEach(function (singleClass) {
            //    var params = $.param({
            //        id: singleClass.id,
            //        name: singleClass.name
            //    });
            //    $('#studentClassList').append(
            //        '<li>' +
            //        '<a href="/questionlist?' + params +'">' +
            //        singleClass.name+ '</a>' +
            //        '</li>');
            //});
        };

        this.studentClass = function() {
            var that = this;
            var name = $('#studentAddNewClassInput').val();
            classManager.addClass(name).then(function (response){
                if(response != null)
                    that.showStudentClasses();
            });
        }
    };

    module.exports = ClassController;
});