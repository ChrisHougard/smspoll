var express = require('express'),
    poll = require('../models/poll'),
    plivo = new (require('../components/plivo'))(),
    router = express.Router();

router.get('/incoming_message', function(req, res, next) {
    var sms = plivo.receiveMessage(req);
    poll.submitVote(sms.from, sms.to, sms.text, function(err, res) {
        if (err) {
            next();
        } else {
            plivo.sendMessage(sms.to, sms.from, 'Thank you for voting!');
            next();
        }
    })
});

router.get('/poll_results', function(req, res, next) {
    var resp = {
        data: {}
    };

    if (req.query.hasOwnProperty("id")) {
        poll.findById(req.query.id, function (err, poll) {
            if (err) {
                res.json({
                    status: "error"
                });
            } else {
                poll.getVotesSummary(function (err, results) {
                    if (err) {
                        res.json({
                            status: "error"
                        });
                    } else {
                        res.json({
                            status: "success",
                            data: {
                                options: results,
                                poll: {
                                    display_name: poll.getDisplayName()
                                }
                            }
                        });
                    }
                });
            }
        });
    } else {
        res.json({
            status: "error"
        });
    }
});

module.exports = router;