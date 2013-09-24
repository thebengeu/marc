define([
	'services/server',
	'services/dropbox',
	'services/github',
	'services/recentservice'
], function (serverService, dropboxService, githubService, RecentService) {
	'use strict';
	
	var sourceToService = {
		'm(arc) Source Code': serverService,
		dropbox: dropboxService,
		github: githubService,
		recent: RecentService
	};
	return sourceToService;
});