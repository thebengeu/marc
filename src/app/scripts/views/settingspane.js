/*global define*/

define([
    'jquery',
    'underscore',
    'backbone',
    'models/setting'
], function ($, _, Backbone, Setting) {
    'use strict';
    
    // Event handler for all boolean settings
    $('#settings-pane .make-switch').on('switch-change', function (e, data) {
        var $el = $(data.el);
        var value = data.value;
        // console.log(e, $el, value);
        var elementId = $el.parent().parent().attr('id');
        Setting.set(elementId, value);
    });
    
    $('#settings-pane #theme').on('change', function (e) {
        Setting.set('theme', e.target.value);
    });
    
    $('#settings-pane #font-size').on('change', function (e) {
        Setting.set('font-size', e.target.value);
    });
    
    $('#settings-pane #font-face').on('change', function (e) {
        Setting.set('font-face', e.target.value);
    });

});
