/*global define*/

define([
  'jquery',
  'underscore',
  'backbone',
  'codemirror',
  'codemirror_javascript'
], function ($, _, Backbone, CodeMirror) {
    'use strict';

    var CodeView = Backbone.View.extend({
        render: function() {
            CodeMirror(this.el, {
                lineNumbers: true,
                lineWrapping: true,
                readOnly: true
            });
            return this;
        }
    });

    return CodeView;
});
