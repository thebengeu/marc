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
		}
	});

	return Sidebar;
});