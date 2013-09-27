/*global define*/

define([
    'jquery',
    'underscore',
    'backbone',
    'LSD',
    'context',
    'collections/fileList',
    'services/recent',
    'utilities/services'
], function ($, _, Backbone, LSD, Context, FileList, RecentService, sourceToService) {
    'use strict';

    /**
     * Removes the file content and file from recents.
     * @param {Backbone.Model} file .
     */
    var removeFileContent = function(file) {
        LSD.removeRemoteItem(file.get('id'));
        RecentService.removeRoute(file.get('id'));
        Backbone.history.navigate('');
    };

    var updateFile = function() {
        var sidebar = Context.getInstance().getSidebar();
        var selectedFile = sidebar.getSelectedFile();
        var source;
        
        if (sidebar.getFileType(selectedFile) === sidebar.fileType.DIRECTORY) {
            var path = selectedFile.id;
            var childFile = getChildFile(selectedFile.children);

            if (!childFile) {
                throw new Error('Folder is empty.');
            }

            source = childFile.get('source');

            deleteFile();

            sourceToService[source].updateFolder(path, function() {
                // console.log('updated');
            }, childFile);
        }
        else {
            var file = FileList.getFileWithSourceAndPath(selectedFile.source,
                selectedFile.path);
            source = file.get('source');

            deleteFile();

            sourceToService[source].updateFile(file, function() {
                // console.log('updated');
            });
        }
    };

    var getChildFile = function(children) {
        var sidebar = Context.getInstance().getSidebar();

        var i = 0, child = children[i];
        while (child) {
            if (sidebar.getFileType(child) === sidebar.fileType.FILE) {
                return FileList.getFileWithSourceAndPath(child.source,
                    child.path);
            }
            child = children[++i];
        }
    };

    /**
     * Deletes the currently selected file/folder in the side bar.
     * @param {sidebar} sidebar The application's side bar.
     */
    var deleteFile = function() {
        var sidebar = Context.getInstance().getSidebar();

        var selectedFile = sidebar.getSelectedFile();
        if (sidebar.getFileType(selectedFile) === sidebar.fileType.DIRECTORY) {
            var filesToRemove = FileList.listFilesWithDirectoryPrefix(
                selectedFile.id);
            _.each(filesToRemove, function(file) {
                FileList.remove(file);
            });

            // Remove the node from the tree.
            sidebar.removeNodeFromTree(selectedFile);
        } else {
            var fileId = selectedFile.source + '/' + selectedFile.path;
            var file = FileList.get(fileId);

            var recentFileId = 'recent/' + fileId;

            var recentFile = FileList.get(recentFileId);

            FileList.remove(file);
            FileList.remove(recentFile);
        }
    };

    var FileService = {
        deleteFile: function() {
            deleteFile();
        },
        updateFile: function() {
            updateFile();
        }
    };

    _.extend(FileService, Backbone.Events);

    FileService.listenTo(FileList, 'remove', removeFileContent);

    return FileService;
});
