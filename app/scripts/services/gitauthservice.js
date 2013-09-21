/*global define*/

define([
    'jquery',
    'underscore'
], function ($, _) {
    var oauth = null;
    var clientId = '56b5da733bb16fb8a5b9';
    var redirectUri = 'http://localhost:9000/#gitauth';

    // TODO(benedict): Move somewhere else.
    var clientSecret = '58b3e51c22f6233d5b99f78a5ed398d512a4cd1c';

    var test = function(res) {
        console.log(res);
    };

    var ensureAuth = function(success) {
        if (this.oauth) {
            success();
        }
        else {
            window.location.href = 'https://github.com/login/oauth/authorize?' +
                'client_id=' + clientId;
        }
    };

    var setOAuthWithCode = function(code) {
        $.getJSON('http://localhost:9999/authenticate/' + code,
            function(data) {
                oauth = data.token;
            }
        );
    };

    var getOAuth = function() {
        return oauth;
    };

    return {
        ensureAuth: function(success) {
            return ensureAuth(success);
        },
        setOAuthWithCode: function(code) {
            return setOAuthWithCode(code);
        },
        getOAuth: function() {
            return getOAuth();
        }
    }
});
