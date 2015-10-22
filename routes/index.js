var express = require('express');
var router = express.Router();

/**
 * Gets the homepage from the jade files
 */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'Express' });
});

module.exports = router;