define([
	'jquery',
	'underscore',
	'backbone',
	'models/file'
], function ($, _, Backbone, File) {
	'use strict';

	var Files = Backbone.Collection.extend({
		model: File
	});

	return Files;
});