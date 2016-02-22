define(function(require) {
    var $ = require('jquery');
    require('jqueryui');

    $('#vidwrapper').draggable({
        containment: 'parent'
    });
});