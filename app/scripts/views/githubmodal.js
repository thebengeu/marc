/*global define*/

define([
    'jquery',
    'backbone',
    'githubService',
    'services/gitauthservice'
], function ($, Backbone, GithubService, GitAuthService) {
    'use strict';

    var gitAuthServiceInstance = GitAuthService.getInstance();

    var GitHubModalView = Backbone.View.extend({
        events: {
            'click .github-modal-download-btn': 'download',
            'click #add-from-github': 'showModal'
        },
        showModal: function() {
            gitAuthServiceInstance.ensureAuth(function() {
                $('#github-modal').modal({
                    show: true,
                    keyboard: true
                })
            });
        },
        download: function() {
            var githubUsername = $('.github-modal-username-input').val();
            var repoName = $('.github-modal-repo-input').val();

            if (!githubUsername || !repoName) {
                $('.github-modal-alert').show();
            }
            else {
                GithubService.downloadRepository(githubUsername, repoName);
                $('#github-modal').modal('hide');

                // Clear input boxes
                $('.github-modal-username-input').val('');
                $('.github-modal-repo-input').val('');
            }
        },
        render: function() {
            $('.github-modal-alert').hide();
            return this;
        }
    });

    return (new GitHubModalView({ el: '#github-modal' })).render();
});