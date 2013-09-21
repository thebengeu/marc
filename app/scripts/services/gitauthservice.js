/*global define*/

define([
    'jquery',
    'underscore'
], function ($, _) {
    var oauth = null;
    var clientId = '56b5da733bb16fb8a5b9';
    var redirectUri = 'http://localhost:9000/gitauth';

    var test = function(res) {
        console.log(res);
    };

    var ensureAuth = function() {
        if (oauth) {
            return oauth;
        }
        else {
            var urlParameters = {
                client_id: clientId,
                redirect_uri: redirectUri
            };

            $.get('https://github.com/login/oauth/authorize',
                urlParameters
            );
        }
    };



    return {
        ensureAuth: function() {
            return ensureAuth();
        }
    }
});
