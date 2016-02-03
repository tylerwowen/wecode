var express = require('express');
var router = express.Router();

/* GET Userlist page. */
router.get('/', function(req, res) {
    var db = req.db;
    var collection = db.get('questioncollection');
    collection.find({},{},function(e, docs){
        res.render('questionlist', {
            "questionlist" : docs
        });
    });
});

module.exports = router;