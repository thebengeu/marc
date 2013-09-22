/*global define*/

define([
    'jquery',
    'backbone',
    'githubService'
], function ($, Backbone, GithubService) {
    'use strict';

    var GitHubModalView = Backbone.View.extend({
        events: {
            'click .github-modal-download-btn': 'download'
        },
        showModal: function() {
            $('#github-modal').modal({
                show: true,
                keyboard: true
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
            }
        },
        render: function() {
            $('.github-modal-alert').hide();
            return this;
        }
    });

    return (new GitHubModalView({ el: '#github-modal' })).render();
});