define([
	'jquery',
	'underscore',
	'backbone'
], function ($, _, Backbone) {
	'use strict';

	var File = Backbone.Model.extend({
		defaults: {
			source: '', // './' prefix needed for all file paths
			path: '',
			metadata: {}
		}
	});

	return File;
});