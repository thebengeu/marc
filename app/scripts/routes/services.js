/*global define*/

define([
    'jquery',
    'backbone',
    'services/dropbox',
    'services/recentservice',
    'views/githubmodal',
    'utilities/filelistloader'
], function ($, Backbone, dropboxService, RecentService, GithubModalView, FileListLoader) {
    'use strict';

    var ServicesRouter = Backbone.Router.extend({
        routes: {
            'add-from-dropbox': 'addFromDropbox',
            'add-from-github': 'addFromGithub',
            'add-from-server': 'addFromServer'
        },
        addFromDropbox: function () {
            dropboxService.authenticate();
        },
        addFromGithub: function() {
            GithubModalView.showModal();

            // Prevent duplicate removal of routes.
            if (RecentService.peekRoute() == 'add-from-github') {
                RecentService.popRoute();
            }
        },
        addFromServer: function() {
            FileListLoader.loadExistingFiles();
        }
    });

    return ServicesRouter;
});
