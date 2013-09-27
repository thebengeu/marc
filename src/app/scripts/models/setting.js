/*global define*/

define([
	'jquery',
	'underscore',
	'backbone',
    'views/code',
    'LSD'
], function ($, _, Backbone, CodeView, LSD) {
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
            'show-cursor': true,
            'font-size': 14, // what unit to use?
            'font-face': 'Monospace',
            'theme': 'solarized light'
		},
        
        initialize: function(){
            console.log('Setting model has been initialized.');
     
            
            this.on('change:code-folding', function(){
                console.log('Code folding value for this model has changed.');
                CodeView.setOption('foldGutter', this.get('code-folding'));
                
                if (this.get('code-folding')){
                    CodeView.setOption('gutters', ['CodeMirror-linenumbers', 'CodeMirror-foldgutter']);
                }
            });
            this.on('change:highlight-active-line', function(){
                console.log('Highlight active line value for this model has changed.');
                CodeView.setOption('styleActiveLine', this.get('highlight-active-line'));
            });
            this.on('change:highlight-same-word', function(){
                console.log('Highlight active line value for this model has changed.');
                if (this.get('highlight-same-word')){
                    CodeView.setOption('highlightSelectionMatches', {showToken: /\w/});
                }else{
                    CodeView.setOption('highlightSelectionMatches', {});
                }
            });
            this.on('change:line-numbers', function(){
                console.log('line-numbers value for this model has changed.');
                CodeView.setOption('lineNumbers', this.get('line-numbers'));
                // We disable and re-enable code folding if it was already enabled
                // otherwise the line numbers will appear after the code folding arrows
                if (this.get('line-numbers')){
                    if (this.get('code-folding')){
                        this.set('code-folding', false);
                        this.set('code-folding', true);
                    }
                }
            });
            this.on('change:line-wrapping', function(){
                console.log('line-wrapping value for this model has changed.');
                CodeView.setOption('lineWrapping', this.get('line-wrapping'));
            });
            this.on('change:match-brackets', function(){
                console.log('match-brackets value for this model has changed.');
                CodeView.setOption('matchBrackets', this.get('match-brackets'));
            });
            this.on('change:match-tags', function(){
                console.log('match-tags value for this model has changed.');
                if (this.get('match-tags')){
                    CodeView.setOption('matchTags', {bothTags: true});
                }else{
                    CodeView.setOption('matchTags', {});
                }
            });
            this.on('change:show-cursor', function(){
                console.log('show-cursor value for this model has changed.');
                if (this.get('show-cursor')){
                    CodeView.setOption('readOnly', false);
                }else{
                    CodeView.setOption('readOnly', 'nocursor');
                }
            });
            this.on('change:font-size', function(){
                console.log('font-size value for this model has changed.');
                $('.CodeMirror').css('font-size', this.get('font-size') + 'px');
                
                //
                $('#settings-pane #font-size').val(this.get('font-size'));
            });
            this.on('change:font-face', function(){
                console.log('font-face value for this model has changed.');
                $('.CodeMirror').css('font-family', this.get('font-face'));
                
                //
                $('#settings-pane #font-face').val(this.get('font-face'));
            });
            this.on('change:theme', function(){
                console.log('theme value for this model has changed.');
                CodeView.setTheme(this.get('theme'));
                
                //
                $('#settings-pane #theme').val(this.get('theme'));
            });
            
            this.on('change', function(){
                console.log('some element changed!');
                LSD.setItem('Settings', JSON.stringify(this.toJSON()));
                
                // hackish way to get the switches to reflect the actual value in the model
                _.each(this.toJSON(), function(value, key){
                    if (typeof value === 'boolean'){
                        $('#settings-pane .make-switch#'+key).bootstrapSwitch('setState', value);
                    }
                });
            });
            
            
            // load settings from localstorage
            if (!LSD.getItem('Settings')) {
				LSD.setItem('Settings', JSON.stringify(this.toJSON()));
			}
            _.each($.parseJSON(LSD.getItem('Settings')), function(value, key){
                console.log(key, value, typeof value);
                this.set(key, value);
                console.log(this.toJSON());
            }, this);
        }
	});

	return new Setting();
});
