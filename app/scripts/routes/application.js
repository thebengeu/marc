/*global define*/

define([
    'jquery',
    'backbone',
    'views/code',
    'extToMode',
    'LSD',
    'serverService',
    'dropboxService',
    'githubService'
], function ($, Backbone, CodeView, extToMode, LSD, serverService,
             dropboxService, githubService) {
    'use strict';

    var sourceToService = {
        server: serverService,
        dropbox: dropboxService,
        github: githubService
    };

    var ApplicationRouter = Backbone.Router.extend({
        routes: {
            '': 'home',
            'view/:source/*path': 'view'
        },
        home: function () {
            $.get('README.md', function (data) {
                CodeView.setValue(data);
            })
        },
        view: function (source, path) {
            sourceToService[source].get(path, function (data) {
                var extension = path.split('.').pop();
                var mode = extToMode[extension];
                CodeView.setMode(mode);
                CodeView.setValue(data);
            });
        }
    });

    return ApplicationRouter;
});
