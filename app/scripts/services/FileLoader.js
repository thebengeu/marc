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
			if (LSD.getItem('oauthToken')) {
				// Retrieve our FileList from the server.
				$.get('/user', function(response) {
					var updateTime = new Date(response.updatedAt);
					var localPersistedTime = new Date(FileList.persistedTime);
					if (updateTime - localPersistedTime > 0) {
						// We should dump the local FileList and use the server
						// one.
						var newModels = _.map(response.fileList, function(fileJson) {
							var newFile = new File(fileJson);
							// Check if the file's contents are already cached.
							newFile.cached = typeof(LSD.getItem(newFile.id)) !== 'undefined';
							return newFile;
						});
						FileList.reset(newModels);
					}
				});
			} else {
				this.updateCachedFiles();
			}
		},
		updateCachedFiles: function() {
			var uncachedFiles = FileList.where({
				cached: false
			});

			var that = this;
			_.each(uncachedFiles, function(file) {
				that.loadFileAsync(file);
			});
		}

	}, Backbone.Events);

	return FileLoader;
});