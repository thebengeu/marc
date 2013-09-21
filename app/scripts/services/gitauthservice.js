/*global define*/

define([
    'jquery',
    'underscore'
], function ($, _) {
    this.oauth = null;
    var clientId = '56b5da733bb16fb8a5b9';
    var redirectUri = 'http://localhost:9000/#gitauth';

    // TODO(benedict): Move somewhere else.
    var clientSecret = '58b3e51c22f6233d5b99f78a5ed398d512a4cd1c';


    var test = function(res) {
        console.log(res);
    };

    var ensureAuth = function() {
        if (this.oauth) {
            return this.oauth;
        }
        else {
            window.location.href = 'https://github.com/login/oauth/authorize?' +
                'client_id=' + clientId;
        }
    };

    var setOAuthWithCode = function(code) {
        var urlData = {
            client_id: clientId,
            client_secret: clientSecret,
            code: code
        };

        $.post('https://github.com/login/oauth/access_token',
            {
                data: urlData
            }
        ).done(function(res) {
            console.log(res);
        });        
    };



    return {
        ensureAuth: function() {
            return ensureAuth();
        },
        setOAuthWithCode: function(code) {
            setOAuthWithCode(code);
        }
    }
});
