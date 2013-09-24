/*global define*/

define([
    'jquery',
    'underscore',
    'collections/fileList',
    'services/recentservice',
    'LSD'
], function ($, _, FileList, RecentService, LSD) {
    'use strict';

    var addRecentFilesToFileList = function() {
        var routes = RecentService.getRoutes();
        var source = 'recent';

        _.each(routes, function(route) {
            if (route != 'githubmodalview') {
                var fileModel = {
                    path: route,
                    source: source,
                    id: route
                };
                FileList.add(fileModel);
            }
        });
    };

    addRecentFilesToFileList();

    var addGitHubFilesToFileList = function(storage, source) {
        var storageKeys = _.keys(storage);
        var filteredKeys = _.filter(storageKeys, function(key) {
            return key.indexOf('github/') === 0;
        });

        _.each(filteredKeys, function(key) {
            var fileModel = {
                id: key.substring(7),
                path: key.substring(7),
                source: source
            };
            FileList.add(fileModel);
        });
    };

    addGitHubFilesToFileList(LSD, 'github');

    // TEMP. This should be moved elsewhere once we have other sources integrated.
    // Grab the files on the server.
    var loadDirJson = function() {
        $.get('dir.json', function (response) {
            _.each(response, function(file) {
                file.source = 'm(arc) Source Code';
                file.id = file.path;
            });
            FileList.add(response);
        });

    };
    // END TEMP.

    var loadExistingFiles = function() {
        addGitHubFilesToFileList();
        loadDirJson();
    };

    return {
        loadExistingFiles: function() {
            return loadExistingFiles();
        }
    };
});
