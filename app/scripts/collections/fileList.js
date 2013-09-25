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
			this.on('add', this.writeFileListToStorage);
			this.on('remove', this.writeFileListToStorage);
			this.on('change', this.writeFileListToStorage);

			if (!LSD.getItem('FileList')) {
				LSD.setItem('FileList', '[]');
			}

			this.loadFilesFromStorage();
		},
		writeFileListToStorage: function () {
			var fileAttributes = this.map(function (file) {
				return file.attributes;
			});
			LSD.setItem('FileList', JSON.stringify(fileAttributes));
			if (navigator.onLine) {
				this.persistToServer();
			}
		},
		loadFilesFromStorage: function () {
			var storedFiles = JSON.parse(LSD.getItem('FileList'));
			var that = this;
			_.each(storedFiles, function (file) {
				that.add(file, {
					silent: true
				});
			});
		},
		listFilesWithDirectoryPrefix: function (dirPath) {
			var files = this.filter(function (file) {
				return file.id.indexOf(dirPath) === 0 ||
					file.id.indexOf('recent/' + dirPath) === 0;
			});
			return files;
		},
		getFileWithSourceAndPath: function (source, path) {
			var filteredFiles = this.filter(function (file) {
				return file.id.indexOf(source + '/' + path) === 0;
			});

			if (filteredFiles[0]) {
				return filteredFiles[0];
			}

			return null;
		},
		persistToServer: function () {
			var token = LSD.getItem('oauthToken');
			if (typeof (token) !== 'undefined') {
				var fileAttributes = this.map(function (file) {
					return file.attributes;
				});
				var targetUrl = '//' + location.hostname + ':9999/user';

				var that = this;
				$.ajax({
					url: targetUrl,
					type: 'patch',
					headers: {
						'Authorization' : 'token ' + token
					},
					data: {
						fileList: JSON.stringify(fileAttributes)
					},
					success: function (response) {
						that.persistedTime = response.updatedAt;
					}
				});
			}
		}
	});

	return new FileList();
});
