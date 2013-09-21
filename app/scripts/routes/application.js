/*global define*/

define([
    'jquery',
    'backbone',
    'views/code',
    'extToMode'
], function ($, Backbone, CodeView, extToMode) {
    'use strict';
    var ApplicationRouter = Backbone.Router.extend({
        routes: {
            '': 'home',
            'server/*path': 'server',
            'gitauth': 'gitauth'
        },
        home: function () {
            $.get('README.md', function (data) {
                CodeView.setValue(data);
            })
        },
        server: function (path) {
            $.get(path, function (data) {
                var extension = path.split('.').pop();
                var mode = extToMode[extension];
                CodeView.setMode(mode);
                CodeView.setValue(data);
            }, 'text');
        },
        gitauth: function(path) {
            $.get('README.md', function (data) {
                CodeView.setValue(data);
            })
        }
    });

    return ApplicationRouter;
});
