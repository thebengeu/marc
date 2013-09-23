/*global define*/

define([
    'jquery',
    'underscore',
    'collections/fileList',
    'LSD'
], function ($, _, FileList, LSD) {

    var addGitHubFilesToFileList = function(storage, source) {
        var storageKeys = _.keys(storage);
        var filteredKeys = _.filter(storageKeys, function(key) {
            return key.indexOf('./github/') == 0;
        });

        _.each(filteredKeys, function(key) {
            var fileModel = {
                path: key,
                source: source
            };
            FileList.add(fileModel);
        });
    };

    addGitHubFilesToFileList(LSD, 'GitHub Source');

    // TEMP. This should be moved elsewhere once we have other sources integrated.
    // Grab the files on the server.
    var loadDirJson = function() {
        $.get('dir.json', function (response) {
            function parseDirJson(rawJson, source) {
                // If this is a folder, add all its children.
                if (rawJson.children) {
                    for (var index in rawJson.children) {
                        parseDirJson(rawJson.children[index], source);
                    }
                } else {
                    // Add this to the collection.
                    rawJson.source = source;
                    FileList.add(rawJson);
                }
            }
            parseDirJson(response, 'm(arc) Source');
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
    }
});