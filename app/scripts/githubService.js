/*global define*/

// TODO(benedict): shift this, not sure how to use this framework yet. :(
define([
    'jquery',
    'underscore',
    'services/gitauthservice'
], function ($, _, GitAuthService) {
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
        var updatedGitHeaders = gitHeaders;
        updatedGitHeaders['Authorization'] += gitAuthServiceInstance.getOAuth();

        $.ajax(githubApiUrl + '/repos/' + user + '/' + repo +
                '/branches/master', {'headers': updatedGitHeaders})
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
        var updatedGitHeaders = gitHeaders;
        updatedGitHeaders['Authorization'] += gitAuthServiceInstance.getOAuth();

        $.ajax(githubApiUrl + '/repos/' + user + '/' + repo + '/git/trees/' +
            sha + '?recursive=1', {
                'headers': gitHeaders
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

            // Adding to localStorage
            localStorage[abspath] = JSON.stringify(dirData);
        }
        else if (type == 'blob') {
            var updatedGitHeaders = gitHeaders;
            updatedGitHeaders['Authorization'] += gitAuthServiceInstance.getOAuth();

            $.ajax(githubApiUrl + '/repos/' + user + '/' + repo +
                '/contents/' + relpath, {
                    'headers': gitHeaders
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
                    localStorage[abspath] = JSON.stringify(fileData);
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

    // $('#add-from-github').click(getSha);
    $('#add-from-github').click(function() {
        gitAuthServiceInstance.ensureAuth(getSha);
    });
});
