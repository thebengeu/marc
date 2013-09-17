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
        },
        codemirror: {
            exports: 'CodeMirror'
        },
        codemirror_javascript: {
            deps: ['codemirror']
        }
    },
    paths: {
        jquery: '../bower_components/jquery/jquery',
        backbone: '../bower_components/backbone/backbone',
        underscore: '../bower_components/underscore/underscore',
        mmenu: '../other_components/mmenu/jquery.mmenu.min',
        codemirror: '../bower_components/codemirror/lib/codemirror',
        codemirror_javascript: '../bower_components/codemirror/mode/javascript/javascript'
    }
});

require([
    'backbone',
    'mmenu',
    'views/code'
], function (Backbone, CodeView) {
    Backbone.history.start();
    var codeView = (new CodeView({ el: '.codeView' })).render();
    $('#sidebar').mmenu();
});
