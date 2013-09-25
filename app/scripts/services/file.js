/*global define*/

define([
    'jquery',
    'underscore',
    'backbone',
    'LSD',
    'context',
    'collections/fileList',
    'services/recent'
], function ($, _, Backbone, LSD, Context, FileList, RecentService) {
    'use strict';

    /**
     * Removes the file content and file from recents.
     * @param {Backbone.Model} file .
     */
    var removeFileContent = function(file) {
        LSD.removeItem(file.get('id'));
        RecentService.removeRoute(file.get('id'));
        Backbone.history.navigate('');
    };

    var updateFile = function() {
        var sidebar = Context.getInstance().getSidebar();
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
    }

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