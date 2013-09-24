/*global define*/

define([
	'jquery',
	'underscore',
	'backbone',
	'models/file',
	'LSD'
], function ($, _, Backbone, File, LSD) {
	'use strict';

	var FileList = Backbone.Collection.extend({
		model: File,
		initialize: function () {
			this.on('add', this.saveFileToStorage);
			this.on('remove', this.removeFileFromStorage);

			if (!LSD.getItem('FileList')) {
				LSD.setItem('FileList', '[]');
			}

			this.loadFilesFromStorage();
		},
		saveFileToStorage: function (file) {
			var storedFiles = JSON.parse(LSD.getItem('FileList'));
			storedFiles.push(file.attributes);
			LSD.setItem('FileList', JSON.stringify(storedFiles));
		},
		removeFileFromStorage: function (file) {
			var storedFiles = JSON.parse(LSD.getItem('FileList'));
			var filtered = _.filter(storedFiles, function (storedFile) {
				return storedFile !== file.attributes;
			});
			LSD.setItem('FileList', JSON.stringify(filtered));
		},
		loadFilesFromStorage: function () {
			var storedFiles = JSON.parse(LSD.getItem('FileList'));
			var that = this;
			_.each(storedFiles, function (file) {
				var model = new File(file);
				that.models.push(model);
			});
		}
	});

	return new FileList();
});
