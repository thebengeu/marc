/*global define*/

define([
    'jquery',
    'underscore',
    'backbone',
    'jqTree'
], function ($, _, Backbone) {
    var Sidebar = Backbone.View.extend({
        initialize: function () {
            var that = this;
            $.get('dir.json', function (response) {
                that.parseDirJson(response);
                that.dirStructure = response;
                that.render();
            });
        },
        render: function () {
            this.$('#file-tree').tree({
                data: this.dirStructure.children
            });
            this.$('#file-tree').bind(
                'tree.click',
                function (event) {
                    var node = event.node;
                    Backbone.history.navigate(
                        'server/' + node.path, {
                            trigger: true
                        }
                    );
                }
            );
            return this;
        },
        parseDirJson: function (rawJson) {
            // Change all instances of "path" to "label"
            for (var property in rawJson) {
                if (property === 'path') {
                    // While we're at it, drop the "/" and anything before.
                    var originalPath = rawJson[property];
                    var lastSlash = originalPath.lastIndexOf('/') + 1;
                    var fileName = originalPath.slice(lastSlash);
                    rawJson.label = fileName;
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