/*global define*/

define([
    'jquery',
    'underscore',
    'backbone',
    'LSD',
    'collections/fileList',
    'services/recent'
], function ($, _, Backbone, LSD, FileList, RecentService) {
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

    var updateFile = function(sideBar) {

    };

    /**
     * Deletes the currently selected file/folder in the side bar.
     * @param {SideBar} sideBar The application's side bar.
     */
    var deleteFile = function(sideBar) {
        var selectedFile = sideBar.getSelectedFile();
        if (sideBar.getFileType(selectedFile) === sideBar.fileType.DIRECTORY) {
            var filesToRemove = FileList.listFilesWithDirectoryPrefix(
                selectedFile.id);
            _.each(filesToRemove, function(file) {
                FileList.remove(file);
            });

            // Remove the node from the tree.
            sideBar.removeNodeFromTree(selectedFile);
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
        deleteFile: function(sideBar) {
            deleteFile(sideBar);
        },
        updateFile: function(sideBar) {
            updateFile(sideBar);
        }
    };

    _.extend(FileService, Backbone.Events);

    FileService.listenTo(FileList, 'remove', removeFileContent);

    return FileService;
});