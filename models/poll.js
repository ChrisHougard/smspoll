var query = require("pg-query");

var Poll = function (data) {
    this.data = data;
};

Poll.prototype.getDisplayName = function () {
    return this.data.display_name;
};

Poll.prototype.getPhoneNumber = function (callback) {
    query.first("SELECT number FROM phone_numbers WHERE id=$1", [this.data.phone_number_id], function (err, data) {
        if (err) {
            callback(err);
        } else {
            callback(null, data.number);
        }
    });
};

Poll.prototype.getVotesSummary = function (callback) {
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

Poll.ERROR_DATABASE = 0;
Poll.ERROR_VOTE_EXISTS = 1;
Poll.ERROR_NOT_FOUND = 2;

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

Poll.submitVote = function (src, dst, text, callback) {
    query(
        "INSERT INTO votes (poll_id, option_id, phone_number) " +
        "SELECT " +
        "polls.id, " +
        "poll_options.id, " +
        "$1 " +
        "FROM poll_options " +
        "INNER JOIN polls ON polls.id = poll_options.poll_id " +
        "INNER JOIN phone_numbers ON phone_numbers.id = polls.phone_number_id " +
        "WHERE sms_text = $2 AND phone_numbers.number = $3 AND open_timestamp <= now() AND close_timestamp > now()",
        [src, text, dst],
        function (err, rows, res) {
            if (err) {
                switch (err.code) {
                    case 23505:
                        callback(Poll.ERROR_VOTE_EXISTS);
                        break;
                    default:
                        callback(Poll.ERROR_DATABASE);
                }
            } else if (res.rowCount === 0) {
                callback(Poll.ERROR_NOT_FOUND);
            } else {
                callback(null, true);
            }
        }
    );
};

module.exports = Poll;