/*global define*/

define([
    'jquery',
    'backbone',
    'views/code',
    'views/githubmodal',
    'extToMode',
    'LSD',
    'services/serverService',
    'services/dropboxService',
    'services/githubService',
    'services/gitauthservice',
    'services/recentservice'
], function ($, Backbone, CodeView, GithubModalView, extToMode, LSD, serverService,
             dropboxService, githubService, GitAuthService, RecentService) {
    'use strict';

    var sourceToService = {
        server: serverService,
        dropbox: dropboxService,
        github: githubService,
        recent: RecentService
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
            'githubmodalview': 'githubmodalview',
            'gitauth': 'gitauth'
        },
        home: function () {
            var route = LSD.getItem('route');
            if (route) {
                this.navigate(route, {trigger: true});
            } else {
                $.get('README.md', function (data) {
                    CodeView.setValue(data);
                });
            }
        },
        view: function (source, path) {
            var sourcePath = source + '/' + path;
            
            if (source == 'recent') {
                sourcePath = path;
            }
            else {
                RecentService.pushRoute(sourcePath);    
            }
            

            var data = LSD.getItem(sourcePath);
            if (data) {
                console.log(sourcePath + ' loaded from localStorage');
                updateCodeView(path, data);
            } else {
                sourceToService[source].get(path, function (data) {
                    LSD.setItem(sourcePath, data);
                    updateCodeView(path, data);
                });
            }
        },
        githubmodalview: function() {
            GithubModalView.showModal();
        },
        gitauth: function() {
            var urlParams = window.location.search;
            var code = urlParams.split('=')[1];

            GitAuthService.getInstance().setOAuthWithCode(code, function() {
                window.location = '/';
            });
        }
    });

    return ApplicationRouter;
});
