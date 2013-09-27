/*global define*/

define([
    'jquery',
    'underscore',
    'collections/fileList'
], function ($, _, FileList) {
    'use strict';

    // TEMP. This should be moved elsewhere once we have other sources integrated.
    // Grab the files on the server.
    var loadDirJson = function() {
        $.get('dir.json', function (response) {
            var source = 'm(arc) Source Code';
            FileList.add(_.map(response, function(path) {
                return {
                    path: path,
                    source: 'm(arc) Source Code',
                    id: source + '/' + path
                };
            }));
        });

    };
    // END TEMP.

    return {
        loadExistingFiles: loadDirJson
    };
});
