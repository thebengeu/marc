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
        codemirror: {
            exports: 'CodeMirror'
        },
        '../bower_components/codemirror/mode/htmlmixed/htmlmixed': {
            deps: [
                'codemirror_css',
                'codemirror_javascript',
                'codemirror_xml'
            ]
        },
        jqTree: {
            deps: ['jquery']
        },
        bootstrap: {
            deps: ['jquery']
        },
        matchbrackets: {
            deps: ['codemirror']
        },
        foldcode: {
            deps: ['codemirror']
        },
        foldgutter: {
            deps: ['foldcode']
        },
        'match-highlighter': {
            deps: ['codemirror']
        },
        'brace-fold': {
            deps: ['foldgutter']
        },
        'comment-fold': {
            deps: ['foldgutter']
        },
        'indent-fold': {
            deps: ['foldgutter']
        },
        'xml-fold': {
            deps: ['foldgutter']
        },
        matchtags: {
            deps: ['xml-fold']
        },
        'active-line': {
            deps: ['codemirror']
        }
    },
    paths: {
        jquery: '../bower_components/jquery/jquery',
        backbone: '../bower_components/backbone/backbone',
        underscore: '../bower_components/lodash/dist/lodash',
        codemirror: '../bower_components/codemirror/lib/codemirror',
        codemirror_css: '../bower_components/codemirror/mode/css/css',
        codemirror_javascript: '../bower_components/codemirror/mode/javascript/javascript',
        codemirror_xml: '../bower_components/codemirror/mode/xml/xml',
        jqTree: '../bower_components/jqtree/tree.jquery',
        localStorage: '../bower_components/Backbone.localStorage/backbone.localStorage',
        snap: '../bower_components/snapjs/snap',
        enquire: '../bower_components/enquire/dist/enquire',
        fastclick: '../bower_components/fastclick/lib/fastclick',
        bootstrap: '../bower_components/bootstrap/dist/js/bootstrap',
        matchbrackets: '../bower_components/codemirror/addon/edit/matchbrackets',
        foldcode: '../bower_components/codemirror/addon/fold/foldcode',
        foldgutter: '../bower_components/codemirror/addon/fold/foldgutter',
        'match-highlighter': '../bower_components/codemirror/addon/search/match-highlighter',
        'brace-fold': '../bower_components/codemirror/addon/fold/brace-fold',
        'comment-fold': '../bower_components/codemirror/addon/fold/comment-fold',
        'indent-fold': '../bower_components/codemirror/addon/fold/indent-fold',
        'xml-fold': '../bower_components/codemirror/addon/fold/xml-fold',
        matchtags: '../bower_components/codemirror/addon/edit/matchtags',
        'active-line': '../bower_components/codemirror/addon/selection/active-line',
        dropbox: '../bower_components/dropbox-build/dropbox'
    }
});

require([
    'backbone',
    'views/sidebar',
    'collections/fileList',
    'routes/application',
    'snap',
    'enquire',
    'fastclick',
    'bootstrap',
    'jqTree',
    'dropbox'
], function (Backbone, Sidebar, FileList, ApplicationRouter, Snap, enquire, FastClick) {
    new ApplicationRouter;
    Backbone.history.start();

    var snapper;
    enquire.register("screen and (min-width: 768px)", {
        setup: function () {
            snapper = new Snap({
                disable: 'right',
                element: document.getElementById('content')
            });
            $('.navbar-tree').click(function () {
                if (snapper.state().state == "left") {
                    snapper.close();
                } else {
                    snapper.open('left');
                }

            });
        },
        match: function () {
            snapper.disable();
            snapper.open('left');
        },
        unmatch: function () {
            snapper.close('left');
            snapper.enable();
        }
    });

    var FileList = new FileList();
    var sidebar = new Sidebar({
        el: '.snap-drawer-left',
        collection: FileList
    });

    var data = [{
        label: '/',
        id: '/'
    }];
    $('#dropbox-tree-view').tree({
        data: data,
        autoOpen: false,
        onLoadFailed: function (response) {
            alert("boo!");
            console.log(response);
        }
    });

    $('#dropbox-tree-view').bind(
        'tree.open',
        function (e) {
            console.log(e.node);
        }
    );

    FastClick.attach(document.body);
});
