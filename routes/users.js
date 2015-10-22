var express = require('express');
var router = express.Router();

/**
 * Gets user listings
 */
router.get('/', function(req, res, next) {
    res.send('respond with a resource');
});

module.exports = router;