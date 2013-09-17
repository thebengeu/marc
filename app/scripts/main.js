/*global require*/
'use strict';

require.config({
    shim: {
        underscore: {
            exports: '_'
        },
        backbone: {
            deps: [
                'underscore',
                'jquery'
            ],
            exports: 'Backbone'
        },
        mmenu: {
            deps: ['jquery']
        }
    },
    paths: {
        jquery: '../bower_components/jquery/jquery',
        backbone: '../bower_components/backbone/backbone',
        underscore: '../bower_components/underscore/underscore',
        mmenu: '../other_components/mmenu/jquery.mmenu.min'
    }
});

require([
    'backbone', 'mmenu'
], function (Backbone) {
    Backbone.history.start();
    $('#sidebar').mmenu();
});
