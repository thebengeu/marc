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
    client = new Dropbox.Client({ key: 'fbor6xe2q47cmbf' });
    
    // We do the following to ensure that the next time the user clicks
    // add from dropbox, the url fragment will change and the routing
    // will work
    $('#dialog-dropbox-browser').on('hidden.bs.modal', function () {
        location.replace('#');
    });

    $('#dialog-dropbox-browser #select-folder').click(function () {
        var pathOfInterest = decodeURIComponent($('#dialog-dropbox-browser .modal-body #path').html());
        addFolderContents(pathOfInterest, [], function() {
            // console.log('folder recursion done');
        });
        $('#dialog-dropbox-browser').modal('hide');
    });

    var showError = function(error) {
        switch (error.status) {
        case Dropbox.ApiError.INVALID_TOKEN:
            // If you're using dropbox.js, the only cause behind this error is that
            // the user token expired.
            // Get the user through the authentication flow again.
            alert('Sorry, your Dropbox session has expired. Please try again.');
            break;

        case Dropbox.ApiError.NOT_FOUND:
            // The file or folder you tried to access is not in the user's Dropbox.
            // Handling this error is specific to your application.
            break;

        case Dropbox.ApiError.OVER_QUOTA:
            // The user is over their Dropbox quota.
            // Tell them their Dropbox is full. Refreshing the page won't help.
            break;

        case Dropbox.ApiError.RATE_LIMITED:
            // Too many API requests. Tell the user to try again later.
            // Long-term, optimize your code to use fewer API calls.
            alert('Sorry, we is unable to service your request. Please try again later.');
            break;

        case Dropbox.ApiError.NETWORK_ERROR:
            // An error occurred at the XMLHttpRequest layer.
            // Most likely, the user's network connection is down.
            // API calls will not succeed until the user gets back online.
            alert('A network error has occured. Please check your Internet connection and try again.');
            break;

        case Dropbox.ApiError.INVALID_PARAM:
        case Dropbox.ApiError.OAUTH_ERROR:
        case Dropbox.ApiError.INVALID_METHOD:
            /* falls through */
        default:
            // Caused by a bug in dropbox.js, in your application, or in Dropbox.
            // Tell the user an error occurred, ask them to refresh the page.
            alert('Sorry, it appears that an error has occured. Please try again.\n\nIf you did not grant m(arc) permission to access your Dropbox files, please exit/refresh and try again to grant the required permissions.');
            client.reset();
            location.replace('/#');
        }
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
                // console.log('Path built: ' + pathToCurrent);
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
            // console.log(entries);
            // console.log(dirInfo);
            // console.log(dirContentInfo);
        });
    };
    var showModal = function(){
        if (client.isAuthenticated()){
            browseFolder('/');
            $('#dialog-dropbox-browser').modal('show');
        }else{
            authenticate(showModal);
        }
    };

    var addFolderContents = function (path, folderMonitor, callback) {
        // console.log(folderMonitor);
        folderMonitor[path] = false;

        client.readdir(path, function (error, entries, dirInfo, dirContentInfo) {
            if (error) {
                return showError(error);  // Something went wrong.
            }
            // console.log(path);
            // console.log(dirContentInfo);
            _.map(dirContentInfo, function (item) {
                // console.log(item);
                if (item.isFolder) {
                    addFolderContents(item.path, folderMonitor, callback);
                } else {
                    var file = {
                        path: item.path.substr(1),
                        source: 'dropbox',
                        id: 'dropbox/' + item.path.substr(1),
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

            folderMonitor[path] = true;
            // console.log(folderMonitor);

            // Check if folderMonitor is clear
            // Meaning all folders recursively completed
            var allFoldersDone = true;
            for (var path2 in folderMonitor){
                // console.log(path2, folderMonitor[path2]);
                if (folderMonitor[path2] === false){
                    allFoldersDone = false;
                }
            }
            if (allFoldersDone){
                callback();
            }
        });
    };

    // receive token after redirect authentication
    // not sure if this is the cleanest way to do things though.
    if (location.href.split('#').length > 1) {
        var urlFragment = location.href.split('#')[1];
        if (urlFragment.indexOf('access_token=') === 0) {
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
            authenticate(function(){
                // console.log(path);
                client.readFile(path, function (error, data) {
                    if (error) {
                        return showError(error);  // Something went wrong.
                    }
                    callback(data);  // data has the file's contents
                });
            });
        },
        updateFile: function(file) {
            authenticate(function(){
                // console.log('Dropbox UpdateFile', file, callback);
                /*var path = file.id;
                path = path.substr(path.indexOf("/"));
                // console.log("Path", path);
                this.get(path, callback);*/
                FileList.add(file);
            });
        },
        updateFolder: function(path, callback) {
            authenticate(function(){
                // console.log('Dropbox UpdateFolder', path, callback, file);
                path = path.substr(path.indexOf('/'));
                addFolderContents(path, [], callback);
            });
        }
    };
});
