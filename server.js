var express = require('express');
var mongoose = require('mongoose');
var qs = require('querystring');
var request = require('request');

var GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID || '56b5da733bb16fb8a5b9';
var GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET ||
    '58b3e51c22f6233d5b99f78a5ed398d512a4cd1c';

var userSchema = new mongoose.Schema({
    githubId: { type: Number, index: { unique: true}},
    githubTokens: { type: [String] },
    preferences: { type: String }
});

var User = mongoose.model('User', userSchema);

var app = express();

app.configure(function () {
    app.use(express.bodyParser());
});

app.all('*', function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    next();
});

mongoose.connect('mongodb://localhost/marc');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    app.get('/authenticate/:code', function (req, res) {
        console.log('authenticating code: ' + req.params.code);
        request.post({
            url: 'https://github.com/login/oauth/access_token',
            form: {
                client_id: GITHUB_CLIENT_ID,
                client_secret: GITHUB_CLIENT_SECRET,
                code: req.params.code
            }
        }, function (error, response, body) {
            var token = qs.parse(body).access_token;
            var result = error || { token: token };
            console.log(result);
            res.json(result);
            request({
                url: 'https://api.github.com/user',
                headers: {
                    'Authorization': 'token ' + token
                }
            }, function (error, response, body) {
                var user = JSON.parse(body);
                console.log(user);
                User.findOneAndUpdate({ githubId: user.id },
                    { $addToSet: { githubTokens: token } },
                    { upsert: true },
                    function (err, user) {
                        console.log(err, user);
                    });
            });
        });
    });

    app.get('/user', function (req, res) {
        var authorization = req.get('Authorization');
        var token = authorization.split(' ')[1];
        User.findOne({ githubTokens: token }, 'preferences',
            { lean: true }, function (err, user) {
                console.log(user)
                user ? res.json(user) : res.send(401);
            });
    });

    app.patch('/user', function (req, res) {
        var authorization = req.get('Authorization');
        var token = authorization.split(' ')[1];
        User.findOneAndUpdate({ githubTokens: token },
            { preferences: req.body.preferences }, function (err, user) {
                user ? res.send(204) : res.send(401);
            });
    });
});

app.listen(9999);
