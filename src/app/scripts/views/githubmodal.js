/*global define*/

define([
    'jquery',
    'backbone',
    'services/github',
    'services/gitAuth',
    'services/recent'
], function ($, Backbone, GithubService, GitAuthService, RecentService) {
    'use strict';

    var gitAuthServiceInstance = GitAuthService.getInstance();

    var GitHubModalView = Backbone.View.extend({
        /**
         * The events associated with the modal.
         */
        events: {
            'click .github-modal-download-btn': 'download'
        },
        /**
         * Shows the github repository selection modal view. This is called
         * after the user has authenticated.
         */
        showModal: function () {
            gitAuthServiceInstance.ensureAuth(function () {
                $('#github-modal').modal({
                    show: true,
                    keyboard: true
                });
            });
        },
        /**
         * Downloads the repository associated with the input username and
         * repository. All fields are required. If any is empty, an error
         * message will be shown to the user.
         */
        download: function () {
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
        /**
         * The view is implemented in index.html. This acts as an initialization
         * step to hide the error message view.
         */
        render: function () {
            $('.github-modal-alert').hide();
            return this;
        }
    });

    $('#github-modal').on('hidden.bs.modal', function () {
        Backbone.history.navigate('');
        RecentService.popRoute();
    });

    return (new GitHubModalView({ el: '#github-modal' })).render();
});
