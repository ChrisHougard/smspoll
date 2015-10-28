var express = require('express'),
    poll = require('../models/poll'),
    router = express.Router();

router.get('/:id/', function(req, res, next) {
    poll.findById(req.params.id, function(err, poll) {
        if (err) {
            console.log(err);
            next();
        } else {
            poll.getPhoneNumber(function(err, phoneNum) {
                if (err) {
                    phoneNum = null;
                }
                res.render('poll', { title: 'Poll Results', pollId: poll.data.id, pollName: poll.getDisplayName(), phoneNum: phoneNum });
            });
        }
    });
});

module.exports = router;