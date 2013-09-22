/*global define*/

define([
    'jquery',
    'underscore'
], function ($, _) {

    /**
     * This ensures a singleton of the GitAuthService module.
     */
    var instance = null;

    /*
     * The GitAuthService instance. This service performs all required
     * authentications to allow other services to connect to Github.
     */
    var gitAuthService = function() {
        var oauth = null;
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
                window.location.href = 'https://github.com/login/oauth/authorize?' +
                    'client_id=' + clientId;
            }
        };

        /**
         * Exchanges the authentication access code with an OAuth token.
         * @param {string} code The authentication access code obtained from
         *      the first authentication step.
         */
        var setOAuthWithCode = function(code) {
            $.getJSON('http://localhost:9999/authenticate/' + code,
                function(data) {
                    oauth = data.token;
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
            setOAuthWithCode: function(code) {
                return setOAuthWithCode(code);
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
