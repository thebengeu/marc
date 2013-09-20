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
        enquire: '../bower_components/enquire/dist/enquire'
    }
});

require([
    'backbone',
    'views/sidebar',
    'routes/application',
    'snap',
    'enquire',
    'jqTree'
], function (Backbone, Sidebar, ApplicationRouter, Snap, enquire) {
    new ApplicationRouter;
    Backbone.history.start();

    var snapper;
    enquire.register("screen and (min-width: 768px)", {
        setup: function () {
            snapper = new Snap({
                disable: 'right',
                element: document.getElementById('content')
            });
            $('.navbar-toggle').click(function(){
                if( snapper.state().state=="left" ){
                    snapper.close();
                } else {
                    snapper.open('left');
                }

            });
        },
        match : function() {
            snapper.disable();
            snapper.open('left');
        },
        unmatch : function() {
            snapper.close('left');
            snapper.enable();
        }
    });

    var sidebar = new Sidebar({ el: '.snap-drawer-left'});
		
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
    'underscore'
], function ($, _) {
    'use strict';

    var githubApiUrl = 'https://api.github.com';
    var user = 'ahbeng';
    var repo = 'NUSMods';
    var gitHeaders = {'Authorization': 'token 788d6a9e16886a74d921ae529415bf5e49a6cb06'};

    /**
     * Decode base64 strings with newline characters.
     * @param {string} string The base64 string to be decoded.
     */
    var decodeBase64 = function(string) {
        var splitString = string.split('\n');

        splitString = _.map(splitString, function(s) {
            return atob(s);
        });
        return splitString.join('\n');
    };

    /**
     * Gets the repo sha.
     */
    var getSha = function() {
        $.ajax(githubApiUrl + '/repos/' + user + '/' + repo + '/branches/master', {'headers': gitHeaders})
            .done(function(e) {
                // TODO(benedict): Check if message not found exists
                handleGetShaSuccess(e['commit']['sha']);
            });
    };

    /**
     * Recursively gets the files from the repo tree given the repo's sha.
     * @param {number} sha The repo's sha.
     */
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

    /**
     * Gets and stores the file contents for each leaf in the repo tree.
     * Directory types do not have content, but will store te file path
     * instead.
     * @param {Object} leaf .
     * @param {Object} repoDict keys: file sha, value: dir path/file contents
     */
    var storeFileContentsFromLeaf = function(leaf, repoDict) {
        var type = leaf['type'];
        var relpath = leaf['path'];
        var sha = leaf['sha'];
        var abspath = 'github/' + user + '/' + repo + '/' + relpath;

        if (type == 'tree') {
            var dirData = {
                'relpath': relpath,
                'abspath': abspath,
                'type': 'dir',
                'sha': sha
            };

            // Adding to repoDict - Not used now
            repoDict[sha] = dirData;

            // Adding to localStorage
            localStorage[abspath] = JSON.stringify(dirData);
        }
        else if (type == 'blob') {
            $.ajax(githubApiUrl + '/repos/' + user + '/' + repo +
                '/contents/' + relpath, {'headers': gitHeaders})
                .done(function(data) {
                    // TODO(benedict): Check if message not found exists
                    var fileData = {
                        'relpath': relpath,
                        'abspath': abspath,
                        'sha': sha,
                        'content': decodeBase64(data['content'])
                    };

                    // Adding to repoDict - Not used now
                    repoDict[sha] = fileData;

                    // Adding to localStorage
                    localStorage[abspath] = JSON.stringify(fileData);
                });
        }

    };

    /**
     * Gets the file contents from the repo tree.
     * @param {Object} tree The repo's tree.
     * @param {number} sha The repo's sha.
     */
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
