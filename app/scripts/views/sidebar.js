/*global define*/

define([
    'jquery',
    'underscore',
    'backbone',
    'jqTree'
], function ($, _, Backbone) {
    'use strict';

    var Sidebar = Backbone.View.extend({
        initialize: function () {
            var that = this;
            $.get('dir.json', function (response) {
                that.parseDirJson(response);
                that.dirStructure = response;
                that.render();
            });

            this.treeElement = this.$('#file-tree');
        },
        render: function () {
            var that = this;
            this.treeElement.tree({
                data: this.dirStructure.children
            });
            this.treeElement.bind(
                'tree.click',
                function (event) {
                    var node = event.node;
                    Backbone.history.navigate(
                        'view/server/' + node.path, {
                            trigger: true
                        }
                    );

                    // Open or close the node.
                    if (node.children) {
                        that.$('#file-tree').tree('toggle', node);
                    }
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
        },
        addFileToTree: function (file) {
            var source = file.get('source');
            var path = file.get('path');
            var lastSlash = path.lastIndexOf('/') + 1;

            var fileName = path.slice(lastSlash);
            var directoryPath = path.slice(0, lastSlash - 1);

            this.addDirectoryPathToTree(directoryPath, source);

            var fileNode = {
                id: path,
                label: fileName
            };

            var parent = this.treeElement.tree('getNodeById', directoryPath);
            this.treeElement.tree('appendNode', fileNode, parent);
        },
        addDirectoryPathToTree: function (directoryPath, source) {
            // Check if we already have the source in the tree.
            var sourceNode = this.treeElement.tree('getNodeById', source);
            if (!sourceNode) {
                // Create the source.
                this.treeElement.tree('appendNode', {
                    id: source,
                    label: source
                });
                sourceNode = this.treeElement.tree('getNodeById', source);
            }

            var parentDirectory;
            if (directoryPath === '.') {
                // We out.
                return sourceNode;
            }
            
            // Recursively add directories as needed.
            var lastSlash = directoryPath.lastIndexOf('/');
            var parentPath = directoryPath.slice(0, lastSlash);
            parentDirectory = this.treeElement.tree('getNodeById', parentPath);
            if (!parentDirectory) {
                parentDirectory = this.addDirectoryPathToTree(parentDirectory, source);
            }

            // Add this directory.
            var directoryName = directoryPath.slice(lastSlash + 1);
            var directoryNode = {
                id: directoryPath,
                label: directoryName
            };
            this.treeElement.tree('appendNode', directoryNode, parentDirectory);

            var newDirectory = this.treeElement.tree('getNodeById', directoryPath);
            return newDirectory;
        }
    });

    return Sidebar;
});