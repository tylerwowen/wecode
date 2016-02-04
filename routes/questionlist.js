var express = require('express');
var router = express.Router();

/* GET Userlist page. */
router.get('/', function(req, res) {
    res.render('questionform');
});

module.exports = router;