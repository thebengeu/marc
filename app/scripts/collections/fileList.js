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
			this.on('change', this.updateFileInStorage);

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
		},
		updateFileInStorage: function (file) {
			var storedFiles = JSON.parse(LSD.getItem('FileList'));
			var filesWithoutModified = _.filter(storedFiles, function (storedFile) {
				return storedFile.id !== file.get('id');
			});
			filesWithoutModified.push(file.attributes);
			LSD.setItem('FileList', JSON.stringify(filesWithoutModified));
		},
		removeDirectoryFromStorage: function(dirPath) {
			var storedFiles = JSON.parse(LSD.getItem('FileList'));
			var filesToRemove = _.filter(storedFiles, function (storedFile) {
				return storedFile.id.indexOf(dirPath) == 0 ||
					storedFile.id.indexOf('recent/' + dirPath) == 0;;
			});

			var that = this;
			_.each(filesToRemove, function(file) {
				that.trigger('remove', new File(file));
			});
		}
	});

	return new FileList();
});