/*global define*/

define([
    'jquery',
    'backbone',
    'views/code'
], function ($, Backbone, CodeView) {
    'use strict';
    var ApplicationRouter = Backbone.Router.extend({
        routes: {
            '': 'home',
            'server/*path': 'server'
        },
        home: function () {
            $.get('README.md', function (data) {
                CodeView.setValue(data);
            })
        },
        server: function (path) {
            $.get(path, function (data) {
                CodeView.setValue(data);
            }, 'text');
        }
    });

    return ApplicationRouter;
});
