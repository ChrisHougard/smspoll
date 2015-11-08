var _ = require('lodash'),
    crypto = require('crypto'),
    request = require('request');

var Plivo = function(authId, authToken) {
    if (typeof authId !== "undefined") {
        this.authId = authId;
    } else {
        this.authId = process.env["PLIVO_AUTH_ID"];
    }

    if (typeof authToken !== "undefined") {
        this.authToken = authToken;
    } else {
        this.authToken = process.env["PLIVO_AUTH_TOKEN"];
    }

    return this;
};

function validateSignature(req, authToken) {
    if (process.env["PLIVO_DEBUG"]) {
        return true;
    }

    var params;
    if (req.method === 'POST') {
        params = req.body;
    } else {
        params = req.query;
    }

    var paramPairs = _.pairs(params);
    paramPairs = _.sortBy(paramPairs, function (p) {
        return p[0];
    });

    var url = req.protocol + "://" + req.hostname + req.path;
    paramPairs.forEach(function (p) {
        url += p[0] + p[1];
    });

    var s = crypto.createHmac("sha1", authToken).update(url).digest("base64");

    return s === req.get("X-Plivo-Signature");
}

function sendApiRequest(authId, authToken, endpoint, data, callback) {
    request.post(
        'https://api.plivo.com/v1/Account/' + authId + endpoint,
        {
            auth: {
                user: authId,
                pass: authToken
            },
            body: data,
            json: true
        },
        callback
    );
}

Plivo.prototype.sendMessage = function(from, to, text, callback) {
    var data = {
        src: from,
        dst: to,
        text: text
    };
    sendApiRequest(this.authId, this.authToken, "/Message", data, callback);
};

Plivo.prototype.receiveMessage = function(req) {
    if (!validateSignature(req, this.authToken)) return;

    var data = {};
    if (req.method === 'POST') {
        data.from = req.body.From;
        data.to = req.body.To;
        data.text = req.body.Text;
    } else {
        data.from = req.query.From;
        data.to = req.query.To;
        data.text = req.query.Text;
    }
    return data;
};

module.exports = Plivo;