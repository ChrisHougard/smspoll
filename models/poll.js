var query = require("pg-query");

var Poll = function (data) {
    this.data = data;
};

Poll.prototype.getDisplayName = function() {
    return this.data.display_name;
};

Poll.prototype.getPhoneNumber = function(callback) {
    query.first("SELECT number FROM phone_numbers WHERE id=$1", [this.data.phone_number_id], function(err, data) {
        if (err) {
            callback(err);
        } else {
            callback(null, data.number);
        }
    });
};

Poll.prototype.getVotesSummary = function(callback) {
    query(
        "SELECT option_id, option_display_text, option_sms_text, vote_count FROM poll_votes_v WHERE poll_id=$1",
        [this.data.id],
        function (err, rows) {
            if (err) {
                callback(err);
            } else {
                callback(null, rows);
            }
        }
    )
};

Poll.findById = function (id, callback) {
    query.first(
        "SELECT * FROM polls WHERE id=$1 LIMIT 1",
        [id],
        function (err, row) {
            if (err) {
                callback(err)
            } else {
                callback(null, new Poll(row))
            }
        }
    )
};

Poll.findAll = function (where, callback) {
    var q = "SELECT * FROM polls";
    if (where.length) {
        q += " WHERE" + where;
    }

    query(q, function (err, rows) {
        if (err) {
            callback(err);
        } else {
            var polls = [];
            rows.forEach(function (data) {
                polls.push(new Poll(data));
            });

            callback(null, polls);
        }
    });
};

module.exports = Poll;