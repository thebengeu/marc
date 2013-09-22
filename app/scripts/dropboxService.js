/*global define*/

define([
    'jquery',
    'underscore'
], function ($, _) {
    'use strict';
    
    var client;
    client = new Dropbox.Client({ key: "fbor6xe2q47cmbf" });
    
    $('#add-from-dropbox').click(function() {
        authenticate();
    });
    
    var authenticate = function () {
        client.authenticate(function(error, client) {
            if (error) {
                // Replace with a call to your own error-handling code.
                //
                // Don't forget to return from the callback, so you don't execute the code
                // that assumes everything went well.
                return showError(error);
            }

            // Replace with a call to your own application code.
            //
            // The user authorized your app, and everything went well.
            // client is a Dropbox.Client instance that you can use to make API calls.
            
            browseFolder('/');
            console.log("hello");
        });
    };
    
    var browseFolder = function(path){
        client.readdir(path, function(error, entries, dirInfo, dirContentInfo) {
            if (error) {
                return showError(error);  // Something went wrong.
            }
            
            console.log(entries);
            console.log(dirInfo);
            console.log(dirContentInfo);
        });
    }

    return {
        get: function (path, callback) {
          
        }
    }
});
