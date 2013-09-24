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
        console.log(routes);
        _.each(routes, function(route) {
            console.log(route);
            if (route != 'add-from-github') {
                var fileModel = {
                    path: route,
                    source: source
                };
                FileList.add(fileModel);
            }
        });
    };

    var addGitHubFilesToFileList = function(storage, source) {
        var storageKeys = _.keys(storage);
        var filteredKeys = _.filter(storageKeys, function(key) {
            return key.indexOf('github/') === 0;
        });

        _.each(filteredKeys, function(key) {
            var fileModel = {
                path: key.substring(7),
                source: source
            };
            FileList.add(fileModel);
        });
    };

    // TEMP. This should be moved elsewhere once we have other sources integrated.
    // Grab the files on the server.
    var loadDirJson = function() {
        $.get('dir.json', function (response) {
            _.each(response, function(file) {
                file.source = 'server';
            });
            FileList.add(response);
        });

    };
    // END TEMP.

    var loadExistingFiles = function() {
        addGitHubFilesToFileList(LSD, 'github');
        addRecentFilesToFileList();
        loadDirJson();
    };

    return {
        loadExistingFiles: function() {
            return loadExistingFiles();
        }
    };
});
