/*global define*/

define([
    'jquery',
    'backbone',
    'services/dropbox',
    'services/recent',
    'views/githubmodal',
    'utilities/filelistloader'
], function ($, Backbone, dropboxService, Recent, GithubModalView, FileListLoader) {
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
            if (Recent.peekRoute() === 'add-from-github') {
                Recent.popRoute();
            }
        },
        addFromServer: function() {
            FileListLoader.loadExistingFiles();
        }
    });

    return ServicesRouter;
});
