/*global define*/
define([
    'jquery',
    'underscore',
    'services/gitAuth',
    'collections/fileList',
    'LSD'
], function ($, _, GitAuthService, FileList, LSD) {
    'use strict';

    var githubApiUrl = 'https://api.github.com';
    var user = 'ahbeng';
    var repo = 'NUSMods';
    var gitHeaders = { 'Authorization': 'token ' };
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
        return splitString.join('');
    };

    /**
     * Gets the repo sha.
     */
    var getSha = function () {
        $.ajax(githubApiUrl + '/repos/' + user + '/' + repo + '/branches/master',
            { 'headers': _getGitHeaders() })
            .done(function (e) {
                handleGetShaSuccess(e.commit.sha);
            })
            .fail(function (e) {
                var errorMessage = JSON.parse(e.responseText).message;
                // TODO(benedict): Show error message. Status butter maybe?
                throw new Error('GitHub Error: ' + errorMessage);
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
            sha + '?recursive=1', { 'headers': _getGitHeaders() })
            .done(function (data) {
                getFileContentsFromTree(data.tree, data.sha);
            })
            .fail(function (e) {
                var errorMessage = JSON.parse(e.responseText).message;
                // TODO(benedict): Show error message. Status butter maybe?
                throw new Error('GitHub Error: ' + errorMessage);
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
        var type = leaf.type;
        var relpath = leaf.path;
        var sha = leaf.sha;
        var abspath = user + '/' + repo + '/' + relpath;
        if (type === 'tree') {
        } else if (type === 'blob') {
            $.ajax(githubApiUrl + '/repos/' + user + '/' + repo + '/contents/' +
                relpath, { 'headers': _getGitHeaders() })
                .done(function (data) {
                    var file = {
                        path: abspath,
                        source: 'github',
                        id: 'github/' + abspath,
                        metadata: {
                            sha: sha,
                            type: 'file'
                        }
                    };
                    FileList.add(file);
                    // Adding to repoDict - Not used now
                    repoDict[sha] = file;
                    // Adding file contents to localStorage
                    LSD['github/' + abspath] = decodeBase64(data.content);
                })
                .fail(function (e) {
                    var errorMessage = JSON.parse(e.responseText).message;
                    // TODO(benedict): Show error message. Status butter maybe?
                    throw new Error('GitHub Error: ' + errorMessage);
                });
        }
    };

    /**
     * Gets the file contents from the repo tree.
     * @param {Object} tree The repo's tree.
     */
    var getFileContentsFromTree = function (tree) {
        // create repo dictionary
        // keys: file sha, value: dir path/file contents
        var repoDictKeys = _.pluck(tree, 'sha');
        var repoDict = {};
        _.each(repoDictKeys, function (key) {
            repoDict[key] = null;
        });
        // get file contents for each object in the tree
        _.map(tree, function (leaf) {
            storeFileContentsFromLeaf(leaf, repoDict);
        });
    };

    /**
     * Sets the appropriate headers for the GitHub API requests.
     * @return {Object.<string, string>} The request headers.
     */
    var _getGitHeaders = function () {
        var oauth = gitAuthServiceInstance.getOAuth();
        if (!oauth) {
            throw new Error('Not signed in to Github.');
        }
        var authorization = gitHeaders.Authorization;
        var splitAuthHeader = authorization.split(' ');
        if (splitAuthHeader[1] === '' || splitAuthHeader[1] !== oauth) {
            gitHeaders.Authorization = 'token ' + oauth;
        }
        return gitHeaders;
    };

    /**
     * Downloads the repository given the input username and repository name.
     * @param {string} username .
     * @param {string} repoName .
     */
    var downloadRepository = function (username, repoName) {
        user = username;
        repo = repoName;
        gitAuthServiceInstance.ensureAuth(getSha);
    };
    return {
        downloadRepository: function (username, repoName) {
            return downloadRepository(username, repoName);
        },
        get: function(path, callback) {
            console.log(path);
        }
    };
});
