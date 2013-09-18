/*global define*/

define([
	'jquery',
	'underscore',
	'backbone',
	'jqTree'
], function($, _, Backbone) {
	var Sidebar = Backbone.View.extend({
		render: function() {
			this.$('#file-tree').tree({
			    
			});
			return this;
		},
		parseDirJson: function(rawJson) {
			for (var property in rawJson) {
				if (property === 'path') {
					rawJson.label = rawJson[property];
					delete rawJson[property];
				}
			}
			if (rawJson.children) {
				for (var i = 0; i < rawJson.children.length; i++) {
					this.parseDirJson(rawJson.children[i]);
				}
			}
		}
	});

	return Sidebar;
});