define([
	'jquery',
	'underscore',
	'backbone',
	'models/file'
], function ($, _, Backbone, File) {
	'use strict';

	var FileList = Backbone.Collection.extend({
		model: File
	});

	return FileList;
});