var express = require('express'),
    poll = require('../models/poll'),
    router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    var polls = poll.findAll("", function(err, polls) {
        res.render('index', { title: 'Express' });
    });
});

module.exports = router;
