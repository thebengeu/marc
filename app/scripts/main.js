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
        jqTree: '../bower_components/jqtree/tree.jquery',
        localStorage: '../bower_components/Backbone.localStorage/backbone.localStorage'
    }
});

require([
    'backbone',
    'views/sidebar',
    'routes/application',
    'mmenu',
    'jqTree'
], function (Backbone, Sidebar, ApplicationRouter) {
    new ApplicationRouter;
    Backbone.history.start();
    $('#sidebar').mmenu();

    var sidebar = new Sidebar({ el: '#sidebar'});
		
		var data = [
								{
										label: '/',
										id: '/'
								}
						];
    $('#dropbox-tree-view').tree({
        data: data,
				autoOpen: false,
				onLoadFailed: function(response) {
					alert("boo!");
					console.log(response);
				}
    });
		
		$('#dropbox-tree-view').bind(
				'tree.open',
				function(e) {
						console.log(e.node);
				}
		);
});
