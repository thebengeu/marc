/*global define*/

define([
    'jquery',
    'underscore',
    'backbone',
    'LSD',
    'collections/fileList'
], function ($, _, Backbone, LSD, FileList) {
    'use strict';

    var removeFileContent = function(file) {
        LSD.removeItem(file.get('id'));
    };

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
        }
    };

    _.extend(FileService, Backbone.Events);

    FileService.listenTo(FileList, 'remove', removeFileContent);

    return FileService;
});