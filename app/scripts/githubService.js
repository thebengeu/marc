/*global define*/

define([
    'jquery',
    'underscore',
    'services/gitauthservice',
    'LSD'
], function ($, _, GitAuthService, LSD) {
    'use strict';

    var githubApiUrl = 'https://api.github.com';
    var user = 'ahbeng';
    var repo = 'NUSMods';
    var gitHeaders = {'Authorization': 'token '};

    var gitAuthServiceInstance = GitAuthService.getInstance();

    /**
     * Decode base64 strings with newline characters.
     * @param {string} string The base64 string to be decoded.
     */
    var decodeBase64 = function (string) {
        var splitString = string.split('\n');

        splitString = _.map(splitString, function (s) {
            return atob(s);
        });
        return splitString.join('\n');
    };

    /**
     * Gets the repo sha.
     */
    var getSha = function () {
        $.ajax(githubApiUrl + '/repos/' + user + '/' + repo +
                '/branches/master', {'headers': getGitHeaders()})
            .done(function (e) {
                // TODO(benedict): Check if message not found exists
                handleGetShaSuccess(e['commit']['sha']);
            });
    };

    /**
     * Recursively gets the files from the repo tree given the repo's sha.
     * @param {number} sha The repo's sha.
     */
    var handleGetShaSuccess = function (sha) {
        if (!sha) {
            return null;
        }

        $.ajax(githubApiUrl + '/repos/' + user + '/' + repo + '/git/trees/' +
            sha + '?recursive=1', {
                'headers': getGitHeaders()
            })
            .done(function (data) {
                // TODO(benedict): Check if message not found exists
                getFileContentsFromTree(data['tree'], data['sha']);
            });
    };

    /**
     * Gets and stores the file contents for each leaf in the repo tree.
     * Directory types do not have content, but will store te file path
     * instead.
     * @param {Object} leaf .
     * @param {Object} repoDict keys: file sha, value: dir path/file contents
     */
    var storeFileContentsFromLeaf = function (leaf, repoDict) {
        var type = leaf['type'];
        var relpath = leaf['path'];
        var sha = leaf['sha'];
        var abspath = 'github/' + user + '/' + repo + '/' + relpath;

        if (type == 'tree') {
            var dirData = {
                'relpath': relpath,
                'abspath': abspath,
                'type': 'dir',
                'sha': sha
            };

            // Adding to repoDict - Not used now
            repoDict[sha] = dirData;

            // Adding to localStorage through LSD
            LSD[abspath] = JSON.stringify(dirData);
        }
        else if (type == 'blob') {
            $.ajax(githubApiUrl + '/repos/' + user + '/' + repo +
                '/contents/' + relpath, {
                    'headers': getGitHeaders
                })
                .done(function (data) {
                    // TODO(benedict): Check if message not found exists
                    var fileData = {
                        'relpath': relpath,
                        'abspath': abspath,
                        'sha': sha,
                        'content': decodeBase64(data['content'])
                    };

                    // Adding to repoDict - Not used now
                    repoDict[sha] = fileData;

                    // Adding to localStorage
                    LSD[abspath] = JSON.stringify(fileData);
                });
        }

    };

    /**
     * Gets the file contents from the repo tree.
     * @param {Object} tree The repo's tree.
     * @param {number} sha The repo's sha.
     */
    var getFileContentsFromTree = function (tree, sha) {
        // create repo dictionary
        // keys: file sha, value: dir path/file contents
        var repoDictKeys = _.pluck(tree, 'sha');
        var repoDict = {};
        _.each(repoDictKeys, function (key) {
            repoDict[key] = null;
        });

        // get file contents for each object in the tree
        _.map(tree, function (leaf) {
            storeFileContentsFromLeaf(leaf, repoDict)
        });
    };

    var getGitHeaders = function() {
        var oauth = gitAuthServiceInstance.getOAuth();

        if (!oauth) {
            throw new Error('Not signed in to Github.');
        }

        var authorization = gitHeaders['Authorization'];
        var splitAuthHeader = authorization.split(' ');

        if (splitAuthHeader[1] == '' || splitAuthHeader[1] != oauth) {
            gitHeaders['Authorization'] = 'token ' + oauth;
        }

        return gitHeaders;
    };

    var downloadRepository = function(username, repoName) {
        user = username;
        repo = repoName;
        gitAuthServiceInstance.ensureAuth(getSha);
    };

    return {
        downloadRepository: function(username, repoName) {
            return downloadRepository(username, repoName);
        }
    };

});
