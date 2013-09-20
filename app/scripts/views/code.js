/*global define*/

define([
    'jquery',
    'underscore',
    'backbone',
    'codemirror'
], function ($, _, Backbone, CodeMirror) {
    'use strict';

    var CodeView = Backbone.View.extend({
        setMode: function (mode) {
            if (mode) {
                var modeName = mode.name || mode;
                require(['../bower_components/codemirror/mode/' + modeName +
                    '/' + modeName],
                    _.bind(function () {
                        this.codeMirror.setOption('mode', mode);
                    }, this));
            } else {
                this.codeMirror.setOption('mode', 'text');
            }
        },
        setValue: function (value) {
            this.codeMirror.setValue(value);
        },
        render: function () {
            this.codeMirror = CodeMirror(this.el, {
                lineNumbers: true,
                lineWrapping: true,
                readOnly: true
            });
            return this;
        }
    });

    return (new CodeView({ el: '.codeView' })).render();
});
