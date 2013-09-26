/*global define*/
define([
    'jquery',
    'Backbone'
], function ($, Backbone) {
    'use strict';
    return {
        get: function (path, callback) {
            $.get(path, function (data) {
                callback(data);
            }, 'text');
        },
        updateFile: function(file, callback) {
            $.get(file.get('path'), function (data) {
                callback(data);
            }, 'text');
        },
        updateFolder: function() {
            Backbone.history.navigate('add-from-server', {trigger: true});
        }
    };
});
