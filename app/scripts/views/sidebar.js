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
            this.listenTo(this.collection, 'add', this.addFileToTree);
            this.listenTo(this.collection, 'remove', this.removeFileFromTree);

            var that = this;
            $.get('dir.json', function (response) {
                that.parseDirJson(response, 'Server');
            });

            this.treeElement = this.$('#file-tree');
            this.initTree();
        },

        initTree: function() {
            this.treeElement.tree({
                data: []
            });
            var that = this;
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
        },
        parseDirJson: function (rawJson, source) {
            // If this is a folder, add all its children.
            if (rawJson.children) {
                for (var index in rawJson.children) {
                    this.parseDirJson(rawJson.children[index], source);
                }
            } else {
                // Add this to the collection.
                rawJson.source = source;
                this.collection.add(rawJson);
            }
        },
        addFileToTree: function (file) {
            var source = file.get('source');
            var path = file.get('path');
            var lastSlash = path.lastIndexOf('/') + 1;

            var fileName = path.slice(lastSlash);
            var directoryPath = path.slice(0, lastSlash - 1);


            var fileNode = {
                id: path,
                label: fileName,
                path: path
            };
            
            var parent = this.addDirectoryPathToTree(directoryPath, source);
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

            if (directoryPath === '.') {
                // We out.
                return sourceNode;
            }

            // Check if we're trying to add a directory that's already in.
            var existing = this.treeElement.tree('getNodeById', directoryPath);
            if (existing) {
                return existing;
            }
            
            var lastSlash = directoryPath.lastIndexOf('/');
            var parentPath = directoryPath.slice(0, lastSlash);
            
            var parentDirectory;
            if (parentPath === '.') {
                parentPath = source;
            }

            parentDirectory = this.treeElement.tree('getNodeById', parentPath);
            if (!parentDirectory) {
                // Recursively add directories as needed.
                parentDirectory = this.addDirectoryPathToTree(parentDirectory, source);
            }

            // Add this directory.
            var directoryName = directoryPath.slice(lastSlash + 1);
            var directoryNode = {
                id: directoryPath,
                label: directoryName,
                path: directoryPath
            };
            this.treeElement.tree('appendNode', directoryNode, parentDirectory);

            var newDirectory = this.treeElement.tree('getNodeById', directoryPath);
            return newDirectory;
        },
        removeFileFromTree: function (file) {
            var path = file.get('path');
            var fileNode = this.treeElement.tree('getNodeById', path);
            this.treeElement.tree('removeNode', fileNode);
        }
    });

    return Sidebar;
});