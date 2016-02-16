define(function(require) {
    var $ = require('jquery');
    require('jqueryui');

    $('#vidwrapper').draggable({
        containment: '.col-md-9'
    });
});