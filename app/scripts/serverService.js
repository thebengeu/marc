/*global define*/

define([
    'jquery'
], function ($) {
    'use strict';

    return {
        get: function (path, callback) {
            $.get(path, function (data) {
                callback(data);
            }, 'text');
        }
    }
});
