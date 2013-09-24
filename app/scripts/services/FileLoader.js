/*global define, _*/

define([
	'jquery',
	'backbone',
	'collections/fileList',
	'LSD',
	'utilities/services'
], function ($, Backbone, FileList, LSD, sourceToService) {
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