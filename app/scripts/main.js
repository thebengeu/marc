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
        '../bower_components/codemirror/mode/htmlmixed/htmlmixed': {
            deps: [
                'codemirror_css',
                'codemirror_javascript',
                'codemirror_xml'
            ]
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
        codemirror_css: '../bower_components/codemirror/mode/css/css',
        codemirror_javascript: '../bower_components/codemirror/mode/javascript/javascript',
        codemirror_xml: '../bower_components/codemirror/mode/xml/xml',
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

// TODO(benedict): shift this, not sure how to use this framework yet. :(
define([
    'jquery',
    'underscore',
    'backbone',
    'codemirror'
], function ($, _, Backbone, CodeMirror) {
    'use strict';

    var githubApiUrl = 'https://api.github.com';
    var user = 'ahbeng';
    var repo = 'NUSMods';
    var gitHeaders = {'Authorization': 'token 788d6a9e16886a74d921ae529415bf5e49a6cb06'};

    var getSha = function() {
        $.ajax(githubApiUrl + '/repos/' + user + '/' + repo + '/branches/master', {'headers': gitHeaders})
            .done(function(e) {
                // TODO(benedict): Check if message not found exists
                handleGetShaSuccess(e['commit']['sha']);
            });
    };

    var handleGetShaSuccess = function(sha) {
        if (!sha) {
            return null;
        }
        $.ajax(githubApiUrl + '/repos/' + user + '/' + repo + '/git/trees/' +
            sha + '?recursive=1', {'headers': gitHeaders})
            .done(function(data) {
                // TODO(benedict): Check if message not found exists
                getFileContentsFromTree(data['tree'], data['sha']);
            });
    };

    var storeFileContentsFromLeaf = function(leaf, repoDict) {
        var type = leaf['type'];
        var path = leaf['path'];
        var sha = leaf['sha'];

        if (type == 'tree') {
            repoDict[sha] = {
                'path': path,
                'type': 'dir',
                'sha': sha
            };
        }
        else if (type == 'blob') {
            $.ajax(githubApiUrl + '/repos/' + user + '/' + repo +
                '/contents/' + path, {'headers': gitHeaders})
                .done(function(data) {
                    // TODO(benedict): Check if message not found exists
                    repoDict[sha] = {
                        'path': path,
                        'type': 'file',
                        'sha': sha,
                        'content': data['content']
                    };
                });
        }

    };

    var getFileContentsFromTree = function(tree, sha) {
        // create repo dictionary
        // keys: file sha, value: dir path/file contents
        var repoDictKeys = _.pluck(tree, 'sha');
        var repoDict = {};
        _.each(repoDictKeys, function(key) {
            repoDict[key] = null;
        });

        // get file contents for each object in the tree
        _.map(tree, function(leaf) {
            storeFileContentsFromLeaf(leaf, repoDict)
        });
    };

    $('#git-button').click(getSha);
});