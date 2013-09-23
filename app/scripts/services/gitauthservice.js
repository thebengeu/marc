/*global define*/

define([
    'jquery',
    'underscore',
    'backbone',
    'LSD'
], function ($, _, Backbone, LSD) {

    /**
     * This ensures a singleton of the GitAuthService module.
     */
    var instance = null;

    /*
     * The GitAuthService instance. This service performs all required
     * authentications to allow other services to connect to Github.
     */
    var gitAuthService = function() {
        /**
         * Hackish validation of the OAuth in localStorage. Returns null if
         * the token is invalid.
         * @return {?string} .
         */
        var getValidOAuth = function() {
            var oauth = LSD['oauthToken'];

            if (oauth == 'undefined') {
                return null;
            }

            return oauth;
        };

        var oauth = getValidOAuth() || null;
        var clientId = '56b5da733bb16fb8a5b9';
        var redirectUri = 'http://localhost:9000/#/gitauth';

        // TODO(benedict): Move somewhere else.
        var clientSecret = '58b3e51c22f6233d5b99f78a5ed398d512a4cd1c';

        /**
         * If the user has not logged in, a redirect will be performed to
         * obtain the authentication access code. This is NOT the OAuth
         * token. The OAuth token will be obtained at a later stage.
         * @param {function} success The callback to execute if the
         *      authentication is successful.
         */
        var ensureAuth = function(success) {
            if (oauth) {
                success();
            }
            else {
                Backbone.history.stop();
                window.location.href = 'https://github.com/login/oauth/authorize?' +
                    'client_id=' + clientId;
            }
        };

        /**
         * Exchanges the authentication access code with an OAuth token. The
         * token is saved to localStorage as well.
         * @param {string} code The authentication access code obtained from
         *      the first authentication step.
         * @param {function} callback The callback function to execute once
         *      the OAuth processing is completed.
         */
        var setOAuthWithCode = function(code, callback) {
            $.getJSON('http://' + location.hostname + ':9999/authenticate/' + code,
                function(data) {
                    oauth = data.token;
                    LSD['oauthToken'] = oauth;
                    callback();
                }
            );
        };

        /**
         * Gets the OAuth token.
         * @return {string} Return null if oauth is not instantiated. Else,
         *      return OAuth string.
         */
        var getOAuth = function() {
            return oauth;
        };

        return {
            ensureAuth: function(success) {
                return ensureAuth(success);
            },
            setOAuthWithCode: function(code, callback) {
                return setOAuthWithCode(code, callback);
            },
            getOAuth: function() {
                return getOAuth();
            }
        }
    };
    
    return {
        getInstance: function() {
            if (instance) {
                return instance;
            }

            instance = gitAuthService();
            return instance;
        }
    }
    
});
