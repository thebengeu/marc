/*global define*/

define([
    'jquery',
    'underscore',
    'collections/fileList'
], function ($, _, FileList) {
    'use strict';
    
    var client;
    client = new Dropbox.Client({ key: "fbor6xe2q47cmbf" });
    
    $('#add-from-dropbox').click(function() {
        //alert("add");
        authenticate();
    });
    
    $('#dialog-dropbox-browser #select-folder').click(function() {
        var pathOfInterest = $('#dialog-dropbox-browser .modal-body strong').html();
        addFolderContents(pathOfInterest);
        $('#dialog-dropbox-browser').modal('hide');
    });
    
    var authenticate = function () {
        var receiveUrl = location.href;
        if (receiveUrl.split("#").length > 1){
            receiveUrl = receiveUrl.split("#")[0];
        }
    
        client.authenticate(function(error, client) {
            if (error) {
                // Replace with a call to your own error-handling code.
                //
                // Don't forget to return from the callback, so you don't execute the code
                // that assumes everything went well.
                alert (error);
                return showError(error);
            }

            // Replace with a call to your own application code.
            //
            // The user authorized your app, and everything went well.
            // client is a Dropbox.Client instance that you can use to make API calls.
            
            $('#dialog-dropbox-browser').modal('show');
            
            browseFolder('/');
            console.log("hello");
            
            console.log(getDeepFolderContents("/CS3216 Proj 1"));
        });
    };
    
    var browseFolder = function(path){
        if (typeof(path) == "object"){
            path = path.data;
        }
        client.readdir(path, function(error, entries, dirInfo, dirContentInfo) {
            if (error) {
                return showError(error);  // Something went wrong.
            }
            
            console.log(this);
            
            $('#dialog-dropbox-browser .modal-body').html("<strong>"+dirInfo.path+"</strong><br><br>");  
            
            _.each(dirContentInfo, function(item){
                if (item.isFolder){
                    var element = $("<a href=\"#\">"+item.name+"</a>");
                    element.click(item.path, browseFolder);
                    $('#dialog-dropbox-browser .modal-body').append(element);
                    $('#dialog-dropbox-browser .modal-body').append("<br>");
                }else{
                    $('#dialog-dropbox-browser .modal-body').append(item.name+"<br>");
                }
            });
            
            console.log(entries);
            console.log(dirInfo);
            console.log(dirContentInfo);
        });
    }
    
    var addFolderContents = function(path){
        client.readdir(path, function(error, entries, dirInfo, dirContentInfo) {
            if (error) {
                return showError(error);  // Something went wrong.
            }
            
            console.log(path);
            console.log(dirContentInfo);
            
            _.map(dirContentInfo, function(item){
                console.log(item);
                if (item.isFolder){
                    addFolderContents(item.path)
                }else{
                    var file = {
                        path: (item.path).substr(1),
                        source: 'dropbox',
                        metadata: {
                            versionTag: item.versionTag,
                            type: 'file'
                        }
                    };
                    FileList.add(file);
                }
            });
        });
    }

    return {
        get: function (path, callback) {
            console.log(path);
            client.readFile(path, function(error, data) {
                if (error) {
                    return showError(error);  // Something went wrong.
                }

                callback(data);  // data has the file's contents
            });
        }
    }
});
