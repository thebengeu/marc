/*global define, _*/

define([
	'jquery',
	'backbone',
	'collections/fileList',
	'LSD',
	'utilities/services',
	'models/File'
], function ($, Backbone, FileList, LSD, sourceToService, File) {
	'use strict';

	var FileLoader = _.extend({
		loadFileAsync: function (file) {
			var source = file.get('source');
			if (file.get('cached') || source === 'recent') {
				return;
			}

			var path = file.get('path');
			var id = file.get('id');

			sourceToService[source].get(path, function (data) {
				LSD.setItem(id, data);
				file.set({
					cached: true
				});
			});
		},
		appOnline: function () {
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
						var localPersistedTime = new Date(FileList.updatedTime);
						if (typeof(FileList.updatedTime) === 'undefined' || updateTime - localPersistedTime > 0) {
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
							FileList.persistToServer();
						}
					}
				});
			} else {
				this.updateCachedFiles();
			}
		},
		updateCachedFiles: function () {
			var uncachedFiles = FileList.where({
				cached: false
			});

			var that = this;
			_.each(uncachedFiles, function (file) {
				that.loadFileAsync(file);
			});
		}

	}, Backbone.Events);

	return FileLoader;
});