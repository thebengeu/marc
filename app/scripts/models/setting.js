/*global define*/

define([
	'jquery',
	'underscore',
	'backbone',
], function ($, _, Backbone) {
	'use strict';

	var Setting = Backbone.Model.extend({
		defaults: {
			'code-folding': true,
            'highlight-active-line': true,
            'highlight-same-word': true,
            'line-numbers': true,
            'line-wrapping': true,
            'match-brackets': true,
            'match-tags': true,
            'font-size': 11, // what unit to use?
            'font-face': 'Monospace'
		},
        
        initialize: function(){
            console.log('Setting model has been initialized.');
            this.on('change:code-folding', function(){
                console.log('Code folding value for this model has changed.');
            });
            this.on('change:highlight-active-line', function(){
                console.log('Highlight active line value for this model has changed.');
            });
            this.on('change:highlight-same-word', function(){
                console.log('Highlight active line value for this model has changed.');
            });
            this.on('change:line-numbers', function(){
                console.log('line-numbers value for this model has changed.');
            });
            this.on('change:line-wrapping', function(){
                console.log('line-wrapping value for this model has changed.');
            });
            this.on('change:match-brackets', function(){
                console.log('match-brackets value for this model has changed.');
            });
            this.on('change:match-tags', function(){
                console.log('match-tags value for this model has changed.');
            });
            this.on('change:font-size', function(){
                console.log('font-size value for this model has changed.');
                $('.CodeMirror').css('font-size', this.get('font-size') + "px");
            });
            this.on('change:font-face', function(){
                console.log('font-face value for this model has changed.');
                $('.CodeMirror').css('font-family', this.get('font-face'));
            });
        },
	});

	return Setting;
});
