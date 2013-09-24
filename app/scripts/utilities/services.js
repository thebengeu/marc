/*global define*/

define([
	'services/server',
	'services/dropbox',
	'services/github',
	'services/recent'
], function (serverService, dropboxService, githubService, Recent) {
	'use strict';

	var sourceToService = {
		'm(arc) Source Code': serverService,
		dropbox: dropboxService,
		github: githubService,
		recent: Recent
	};
	return sourceToService;
});