/*global define, _*/

define([
	'jquery',
	'backbone',
	'collections/fileList',
	'LSD',
	'utilities/services',
	'models/file'
], function ($, Backbone, FileList, LSD, sourceToService, File) {
	'use strict';

	var FileLoader = _.extend({
		fileQueue: [],
		loadFilesAsync: _.debounce(function () {
			// Get all the files we haven't cached.
			var uncached = FileList.filter(function (file) {
				var fileIsCached = file.get('cached');
				var fileIsInRecentList = file.get('source') === 'recent';

				return !(fileIsCached || fileIsInRecentList);
			});
			this.loadFileAsync(uncached);
		}, 100),
		loadFileAsync: function (fileList) {
			var file = fileList.shift();

			if (typeof file === 'undefined') {
				return;
			}

			var path = file.get('path');
			var id = file.get('id');
			var source = file.get('source');

			var that = this;
			sourceToService[source].get(path, function (data) {
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
			this.syncWithServer();
		},
		updateCachedFiles: function () {
			var uncachedFiles = FileList.where({
				cached: false
			});

			var that = this;
			_.each(uncachedFiles, function (file) {
				that.loadFileAsync(file);
			});
		},
		syncWithServer: function () {
			var that = this;

			// Check if we're logged in.
			var token = LSD.getItem('oauthToken');
			if (typeof (token) !== 'undefined') {
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
							this.persistToServer();
						}
					}
				});
			} else {
				this.updateCachedFiles();
			}
		},
		persistToServer: function () {
			if (!window.onLine) {
				return;
			}

			var token = LSD.getItem('oauthToken');
			if (typeof (token) !== 'undefined') {
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
						that.updatedTime = response.updatedAt;
					}
				});
			}
		}

	}, Backbone.Events);

	return FileLoader;
});
