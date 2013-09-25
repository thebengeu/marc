/*global define*/
define([
    'jquery',
    'underscore',
    'services/gitAuth',
    'collections/fileList',
    'models/file',
    'LSD'
], function ($, _, GitAuthService, FileList, File, LSD) {
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
                createFilesFromTree(data.tree, data.sha);
            })
            .fail(function (e) {
                var errorMessage = JSON.parse(e.responseText).message;
                // TODO(benedict): Show error message. Status butter maybe?
                throw new Error('GitHub Error: ' + errorMessage);
            });
    };

    /**
     * Creates the file from the given leaf. Directory types are ignored.
     * @param {Object} leaf .
     */
    var createFileFromLeaf = function (leaf) {
        var type = leaf.type;
        var relpath = leaf.path;
        var sha = leaf.sha;
        var abspath = user + '/' + repo + '/' + relpath;

        if (type === 'tree') {
        } else if (type === 'blob') {
            var file = {
                path: abspath,
                source: 'github',
                id: 'github/' + abspath,
                metadata: {
                    sha: sha,
                    user: user,
                    repo: repo,
                    relpath: relpath
                }
            };
            FileList.add(new File(file));
        }
    };

    /**
     * Gets the file content from GitHub.
     * @param {File} githubFile .
     * @param {function} callback The callback function to execute if the
     *      request is successful.
     */
    var getFileContent = function(githubFile, callback) {
        var sha = githubFile.get('metadata').sha;
        var relpath = githubFile.get('metadata').relpath;
        var user = githubFile.get('metadata').user;
        var repo = githubFile.get('metadata').repo;

        if (!sha) {
            throw new Error('This is not a file from GitHub.');
        }

        $.ajax(githubApiUrl + '/repos/' + user + '/' + repo + '/contents/' +
                relpath, { 'headers': _getGitHeaders() })
            .done(function (data) {
                // Return decoded file content to callback.
                callback(decodeBase64(data.content));
            })
            .fail(function (e) {
                var errorMessage = JSON.parse(e.responseText).message;
                // TODO(benedict): Show error message. Status butter maybe?
                throw new Error('GitHub Error: ' + errorMessage);
            });   
    }

    /**
     * Creates files associated with the repository tree.
     * @param {Object} tree The repository's tree.
     */
    var createFilesFromTree = function (tree) {
        // get file contents for each object in the tree
        _.map(tree, function (leaf) {
            createFileFromLeaf(leaf);
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

    var updateRepo = function(path, callback, file) {
        var user = githubFile.get('metadata').user;
        var repo = githubFile.get('metadata').repo;

        downloadRepository(user, repo);
    };

    return {
        downloadRepository: function (username, repoName) {
            return downloadRepository(username, repoName);
        },
        get: function(path, callback) {
            var file = FileList.getFileWithSourceAndPath('github', path);
            return getFileContent(file, callback);
        },
        updateFile: function(file, callback) {
            return updateRepo(file, callback);
        },
        updateFolder: function(path, callback, file) {
            return updateRepo(file, callback);
        }
    };
});
