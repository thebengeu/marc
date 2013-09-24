/*global define*/

define([
	'services/server',
	'services/dropbox',
	'services/github',
	'services/recent',
	'services/file'
], function (serverService, dropboxService, githubService, Recent, FileService) {
	'use strict';

	var sourceToService = {
		'm(arc) Source Code': serverService,
		dropbox: dropboxService,
		github: githubService,
		recent: Recent
	};
	return sourceToService;
});