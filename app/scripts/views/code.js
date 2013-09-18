/*global define*/

define([
  'jquery',
  'underscore',
  'backbone',
  'codemirror'
], function ($, _, Backbone, CodeMirror) {
    'use strict';

    var CodeView = Backbone.View.extend({
        setValue: function (value) {
            this.codeMirror.setValue(value);
        },
        render: function() {
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
