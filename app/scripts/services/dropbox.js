/*global define*/

define([
    'jquery',
    'underscore',
    'backbone',
    'dropbox',
    'collections/fileList'
], function ($, _, Backbone, Dropbox, FileList) {
    'use strict';
    
    var client;
    client = new Dropbox.Client({ key: "fbor6xe2q47cmbf" });
    
    /*$('#add-from-dropbox').click(function() {
        //alert("add");
        //if (client.isAuthenticated()){
        //    $('#dialog-dropbox-browser').modal('show');
        //    browseFolder('/');
        //}else{
            Backbone.history.stop();
            authenticate();
            Backbone.history.start();
        //}
    });*/

    $('#dialog-dropbox-browser #select-folder').click(function () {
        var pathOfInterest = decodeURIComponent($('#dialog-dropbox-browser .modal-body #path').html());
        addFolderContents(pathOfInterest);
        $('#dialog-dropbox-browser').modal('hide');
    });

    var showError = function (error) {
        alert(error);
    };

    var authenticate = function (callback) {
        var receiveUrl = location.href;
        if (receiveUrl.split('?').length > 1) {
            receiveUrl = receiveUrl.split('?')[0];
        }
        if (receiveUrl.split('#').length > 1) {
            receiveUrl = receiveUrl.split('#')[0];
        }
        client.authenticate(function (error) {
            if (error) {
                // Replace with a call to your own error-handling code.
                //
                // Don't forget to return from the callback, so you don't execute the code
                // that assumes everything went well.
                return showError(error);
            }
            
            callback();
        });       
    };
    var browseFolder = function (path) {
        if (typeof path === 'object') {
            path = path.data;
        }
        client.readdir(path, function (error, entries, dirInfo, dirContentInfo) {
            if (error) {
                return showError(error);  // Something went wrong.
            }
            // hackish way of doing things...
            $('#dialog-dropbox-browser .modal-body').html('<div id="path" style="display:none;">' + encodeURIComponent(dirInfo.path) + '</div>');
            // Build navigable folder path
            var element = $('<a href=\'#\'><strong>Dropbox Root</strong></a>');
            element.click('/', browseFolder);
            $('#dialog-dropbox-browser .modal-body').append(element);
            var pathElements = dirInfo.path.split('/');
            pathElements = _.rest(pathElements);
            var pathToCurrent = '/';
            for (var i in pathElements) {
                var pathElement = pathElements[i];
                element = $('<a href=\'#\'><strong>' + pathElement + '</strong></a>');
                pathToCurrent = pathToCurrent + '/' + pathElement;
                console.log('Path built: ' + pathToCurrent);
                element.click(pathToCurrent, browseFolder);
                $('#dialog-dropbox-browser .modal-body').append(' / ');
                $('#dialog-dropbox-browser .modal-body').append(element);
            }
            $('#dialog-dropbox-browser .modal-body').append('<br><br>');
            // List items in folder
            _.each(dirContentInfo, function (item) {
                if (item.isFolder) {
                    var element = $('<a href=\'#\'>' + item.name + '</a>');
                    element.click(item.path, browseFolder);
                    $('#dialog-dropbox-browser .modal-body').append(element);
                    $('#dialog-dropbox-browser .modal-body').append('<br>');
                } else {
                    $('#dialog-dropbox-browser .modal-body').append(item.name + '<br>');
                }
            });
            console.log(entries);
            console.log(dirInfo);
            console.log(dirContentInfo);
        });
    };
    var showModal = function(){
        if (client.isAuthenticated()){
            browseFolder('/');
            $('#dialog-dropbox-browser').modal('show');
        }else{
            authenticate(showModal);
        }
    }
    var addFolderContents = function (path) {
        client.readdir(path, function (error, entries, dirInfo, dirContentInfo) {
            if (error) {
                return showError(error);  // Something went wrong.
            }
            console.log(path);
            console.log(dirContentInfo);
            _.map(dirContentInfo, function (item) {
                console.log(item);
                if (item.isFolder) {
                    addFolderContents(item.path);
                } else {
                    var file = {
                        path: item.path.substr(1),
                        source: 'dropbox',
                        metadata: {
                            versionTag: item.versionTag,
                            type: 'file',
                            mimeType: item.mimeType,
                            size: item.size
                        }
                    };
                    if (item.mimeType.split('/')[0] === 'text') {
                        FileList.add(file);
                    }
                }
            });
        });
    };
    
    // receive token after redirect authentication
    // not sure if this is the cleanest way to do things though.
    if (location.href.split('#').length > 1) {
        var urlFragment = location.href.split('#')[1];
        if (urlFragment.indexOf("access_token=") == 0) {
            client.authenticate(function (error) {
                if (error) {
                    // Replace with a call to your own error-handling code.
                    //
                    // Don't forget to return from the callback, so you don't execute the code
                    // that assumes everything went well.
                    return showError(error);
                }
            });
        }
    }
    
    return {
        authenticate: authenticate,
        showModal: showModal,
        get: function (path, callback) {
            console.log(path);
            client.readFile(path, function (error, data) {
                if (error) {
                    return showError(error);  // Something went wrong.
                }
                callback(data);  // data has the file's contents
            });
        },
        updateFile: function(file, callback) {

        },
        updateFolder: function(path, callback) {
            
        }
    };
});
