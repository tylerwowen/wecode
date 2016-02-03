var express = require('express');
var router = express.Router();

/* GET Userlist page. */
router.get('/', function(req, res) {
    console.log("DB is", req.db);
    var db = req.db;
    var collection = db.get('usercollection');
    collection.find({},{},function(e, docs){
        res.render('userlist', {
            "userlist" : docs
        });
    });
});

module.exports = router;