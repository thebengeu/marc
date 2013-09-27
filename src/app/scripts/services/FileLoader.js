/*global define, _*/

define([
	'jquery',
	'backbone',
	'collections/fileList',
	'LSD',
	'utilities/services',
	'models/file',
	'spinner'
], function ($, Backbone, FileList, LSD, sourceToService, File, Spinner) {
	'use strict';

	var FileLoader = _.extend({
		fileQueue: [],
		loadFilesAsync: _.debounce(function () {
			this.fileListUpdated();
			
			// Get all the files we haven't cached.
			var uncached = FileList.filter(function (file) {
				var fileIsCached = file.get('cached');
				var fileIsInRecentList = file.get('source') === 'recent';

				return !(fileIsCached || fileIsInRecentList);
			});
			this.spinner.spin($('#status')[0]);
			this.loadFileAsync(uncached);
		}, 100),
		spinner: new Spinner({
			lines: 17, // The number of lines to draw
			length: 3, // The length of each line
			width: 2, // The line thickness
			radius: 8, // The radius of the inner circle
			corners: 0, // Corner roundness (0..1)
			rotate: 0, // The rotation offset
			direction: 1, // 1: clockwise, -1: counterclockwise
			color: '#000', // #rgb or #rrggbb or array of colors
			speed: 1, // Rounds per second
			trail: 15, // Afterglow percentage
			shadow: false, // Whether to render a shadow
			hwaccel: false, // Whether to use hardware acceleration
			className: 'spinner', // The CSS class to assign to the spinner
			zIndex: 2e9, // The z-index (defaults to 2000000000)
			top: '0', // Top position relative to parent in px
			left: '0' // Left position relative to parent in px
		}),
		loadFileAsync: function (fileList) {
			var file = fileList.shift();

			if (typeof file === 'undefined') {
				$('#status').text('Done.').slideUp();
				this.spinner.stop();
				return;
			}

			var documentTitle = 'm(arc)';

			var path = file.get('path');
			var id = file.get('id');
			var source = file.get('source');

			var downloadingText = 'Downloading: ' + path;

			document.title = documentTitle + ' | ' + downloadingText;

			$('#status').slideDown();
			$('#downloading-file-name').text(downloadingText);

			var that = this;
			sourceToService[source].get(path, function (data) {
				document.title = documentTitle;
				LSD.setRemoteItem(id, data);
				file.set({
					cached: true
				});
				that.updatedTime = Date.now();

				_.defer(function () {
					that.loadFileAsync(fileList);
				});
			});
		},
		appOnline: function () {
			this.startPeriodicSyncing();
		},
		appOffline: function () {
			this.stopPeriodicSyncing();
		},
		persistToServer: function () {
			if (!navigator.onLine) {
				return;
			}

			var token = LSD.getItem('oauthToken');
			if (typeof (token) !== 'undefined' && token !== null) {
				var fileAttributes = FileList.map(function (file) {
					return file.attributes;
				});
				var targetUrl = '//' + location.hostname + ':9999/user';

				var that = this;
				$.ajax({
					url: targetUrl,
					type: 'patch',
					headers: {
						'Authorization': 'token ' + token
					},
					data: {
						fileList: JSON.stringify(fileAttributes)
					},
					success: function (response) {
						that.updatedTime = new Date(response.updatedAt);
					}
				});
			}
		},
		startPeriodicSyncing: function () {
			if (this.periodic) {
				this.stopPeriodicSyncing();
			}
			this.periodic = setInterval(_.bind(this.syncWithServer, this), 30000);
		},
		stopPeriodicSyncing: function () {
			clearInterval(this.periodic);
		},
		syncWithServer: function () {
			var that = this;

			// Check if we're logged in.
			var isOnline = navigator.onLine;
			var token = LSD.getItem('oauthToken');
			var isTokenValid = typeof token !== 'undefined' && token !== null;

			if (isOnline && isTokenValid) {
				var targetUrl = '//' + location.hostname + ':9999/user';
				// Retrieve our FileList from the server.
				$.ajax({
					url: targetUrl,
					type: 'get',
					headers: {
						'Authorization': 'token ' + token
					},
					success: function (response) {
						var updateTime = new Date(response.updatedAt);
						var localPersistedTime = that.updatedTime;
						if (typeof localPersistedTime === 'undefined' || updateTime - localPersistedTime > 0) {
							// We should dump the local FileList and use the server
							// one.
							var receivedList = JSON.parse(response.fileList);
							var newModels = _.map(receivedList, function (fileJson) {
								var newFile = new File(fileJson);
								// Check if the file's contents are already cached.
								newFile.cached = typeof (LSD.getItem(newFile.id)) !== 'undefined';
								return newFile;
							});
							FileList.reset(newModels);
						} else {
							// We should be uploading to the server instead.
							that.persistToServer();
						}
					}
				});
			} else {
				this.stopPeriodicSyncing();
			}
		},
		fileListUpdated: function() {
			this.updatedTime = Date.now();
		}

	}, Backbone.Events);
	FileLoader.startPeriodicSyncing();
	return FileLoader;
});