/*global define*/

define([
    'jquery',
    'backbone',
    'services/dropbox',
    'views/githubmodal',
    'utilities/filelistloader'
], function ($, Backbone, dropboxService, GithubModalView, FileListLoader) {
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
        },
        addFromServer: function() {
            FileListLoader.loadExistingFiles();
        }
    });

    return ServicesRouter;
});
