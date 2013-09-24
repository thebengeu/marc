/*global define*/

define([
    'jquery',
    'underscore',
    'backbone',
    'LSD',
    'jqTree'
], function ($, _, Backbone, LSD) {
    'use strict';

    var Sidebar = Backbone.View.extend({
        fileType: {
            DIRECTORY: 'directory-file-type',
            FILE: 'file-file-type'
        },
        initialize: function () {
            this.listenTo(this.collection, 'add', this.addFileToTree);
            this.listenTo(this.collection, 'remove', this.removeFileFromTree);

            this.treeElement = this.$('#file-tree');
            this.initTree();
        },
        initTree: function () {
            var that = this;
            this.treeElement.tree({
                data: [],
                dragAndDrop: true,
                onCanMoveTo: function (moved, target, position) {
                    // We only support rearranging files and folders within the same directory.
                    // We hence need to check if moved and target have the same parent path.
                    if (position === 'inside') {
                        return false;
                    }

                    var movedParent = that.getParentPathFromString(moved.path);
                    var targetParent = that.getParentPathFromString(target.path);

                    return movedParent === targetParent;
                }
            });
            this.treeElement.bind(
                'tree.click',
                function (event) {
                    /*jshint -W106 */

                    var node = event.node;
                    // Open or close the node.
                    if (node.children.length) {
                        that.$('#file-tree').tree('toggle', node);
                    } else {
                        Backbone.history.navigate(
                            'view/' + node.source + '/' + node.path, {
                                trigger: true
                            }
                        );
                    }

                    // Save our state.
                    // We need to override the selected node value, since
                    // at this point the tree's state hasn't actually been updated yet.
                    var treeState = that.$('#file-tree').tree('getState');
                    treeState.selected_node = node.id;
                    LSD.setItem('treeState', JSON.stringify(treeState));
                }
            );

            this.collection.each(function (file) {
                that.addFileToTree(file);
            });
            var state = LSD.getItem('treeState');
            if (state) {
                this.treeElement.tree('setState', JSON.parse(state));
            }
        },
        addFileToTree: function (file) {
            var source = file.get('source');
            var path = file.get('path');
            var lastSlash = path.lastIndexOf('/') + 1;

            var fileName = lastSlash ? path.slice(lastSlash) : path;
            var directoryPath = lastSlash ? source + '/' + path.slice(0, lastSlash - 1) : source;

            var fileNode = {
                id: path,
                label: fileName,
                path: path,
                source: source
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
                    label: source,
                    source: source
                });
                sourceNode = this.treeElement.tree('getNodeById', source);
            }

            if (directoryPath === source) {
                // We out.
                return sourceNode;
            }

            // Check if we're trying to add a directory that's already in.
            var existing = this.treeElement.tree('getNodeById', directoryPath);
            if (existing) {
                return existing;
            }

            var parentPath = this.getParentPathFromString(directoryPath);

            var parentDirectory = this.treeElement.tree('getNodeById', parentPath);
            if (!parentDirectory) {
                // Recursively add directories as needed.
                parentDirectory = this.addDirectoryPathToTree(parentPath, source);
            }

            // Add this directory.
            var lastSlash = directoryPath.lastIndexOf('/');
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
            var parent = fileNode.parent;

            this.treeElement.tree('removeNode', fileNode);

            // If this directory is now empty, remove it.
            // (As long as we're not the root.)
            if (!parent.children.length && parent.id !== parent.source) {
                this.treeElement.tree('removeNode', parent);
            }
        },
        getParentPathFromString: function (path) {
            var lastSlashPosition = path.lastIndexOf('/');
            var parentPath = path.slice(0, lastSlashPosition);
            return parentPath;
        },
        getSelectedFile: function() {
            return $('#file-tree').tree('getSelectedNode');
        },
        removeNodeFromTree: function(node) {
            $('#file-tree').tree('removeNode', node);
        },
        getFileType: function(node) {
            if (node.children.length) {
                return this.fileType.DIRECTORY;
            }
            else {
                return this.fileType.FILE;
            }
        }
    });

    return Sidebar;
});
