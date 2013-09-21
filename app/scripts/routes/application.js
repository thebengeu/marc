/*global define*/

define([
    'jquery',
    'backbone',
    'views/code',
    'extToMode',
    'LSD',
    'serverService',
    'dropboxService',
    'githubService',
    'services/gitauthservice'
], function ($, Backbone, CodeView, extToMode, LSD, serverService,
             dropboxService, githubService, GitAuthService) {
    'use strict';

    var sourceToService = {
        server: serverService,
        dropbox: dropboxService,
        github: githubService
    };

    var updateCodeView = function(path, data) {
        var extension = path.split('.').pop();
        var mode = extToMode[extension];
        CodeView.setMode(mode);
        CodeView.setValue(data);
    };

    var ApplicationRouter = Backbone.Router.extend({
        routes: {
            '': 'home',
            'view/:source/*path': 'view',
            'gitauth': 'gitauth'
        },
        home: function () {
            $.get('README.md', function (data) {
                CodeView.setValue(data);
            })
        },
        view: function (source, path) {
            var data = LSD.getItem(path);
            if (data) {
                console.log(path + ' loaded from localStorage');
                updateCodeView(path, data);
            } else {
                sourceToService[source].get(path, function (data) {
                    LSD.setItem(path, data);
                    updateCodeView(path, data);
                });
            }
        },
        gitauth: function() {
            $.get('README.md', function (data) {
                CodeView.setValue(data);
                GitAuthService.getInstance().setOAuthWithCode(window.location.search.split('=')[1]);
            })
        }
    });

    return ApplicationRouter;
});
