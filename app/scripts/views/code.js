/*global define*/

define([
    'jquery',
    'underscore',
    'backbone',
    'codemirror',
    'matchbrackets',
    'foldcode',
    'foldgutter',
    'match-highlighter',
    'brace-fold',
    'comment-fold',
    'indent-fold',
    'xml-fold',
    'matchtags',
    'active-line'
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
            var scrollInfo = this.codeMirror.getScrollInfo();
            this.$scrollToTop.toggle(scrollInfo.height > scrollInfo.clientHeight);
        },
        render: function () {
            this.codeMirror = CodeMirror(this.el, {
                lineNumbers: true,
                lineWrapping: true,
                readOnly: true,
                matchBrackets: true,
                foldGutter: true,
                gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter'],
                highlightSelectionMatches: {showToken: /\w/},
                matchTags: {bothTags: true},
                styleActiveLine: true
            });

            // Add a "Scroll to Top" button to make the ugly space at the bottom
            // less obvious, since it may be needed:
            // "heightForcer is needed because behavior of elts with
            // overflow: auto and padding is inconsistent across browsers".
            this.$scrollToTop = $('.CodeMirror-sizer').next()
                .width('100%')
                .html('<div class="text-center">' +
                    '<button type="button" class="btn btn-default btn-xs">' +
                    '<span class="glyphicon glyphicon-arrow-up"></span>' +
                    ' Scroll to Top ' +
                    '<span class="glyphicon glyphicon-arrow-up"></span>' +
                    '</button></div>')
                .click(_.bind(function () {
                    this.codeMirror.scrollIntoView(0);
                }, this));
            return this;
        }
    });

    return (new CodeView({ el: '.codeView' })).render();
});
