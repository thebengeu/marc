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
        },
        jqTree: {
            deps: ['jquery']
        }
    },
    paths: {
        jquery: '../bower_components/jquery/jquery',
        backbone: '../bower_components/backbone/backbone',
        underscore: '../bower_components/underscore/underscore',
        mmenu: '../other_components/mmenu/jquery.mmenu.min',
        codemirror: '../bower_components/codemirror/lib/codemirror',
        codemirror_javascript: '../bower_components/codemirror/mode/javascript/javascript',
        jqTree: '../bower_components/jqtree/tree.jquery'
    }
});

require([
    'backbone',
    'views/code',
    'views/sidebar',
    'mmenu',
    'jqTree'
], function (Backbone, CodeView, Sidebar) {
    Backbone.history.start();
    var codeView = (new CodeView({ el: '.codeView' })).render();
    $('#sidebar').mmenu();

    var sidebar = (new Sidebar({ el: '#file-tree'})).render();
});
