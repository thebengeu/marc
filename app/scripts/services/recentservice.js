/*global define*/

/**
 * Similar to a stack.
 */
define([
    'jquery',
    'underscore',
    'backbone',
    'LSD'
], function ($, _, Backbone, LSD) {

    var storageRouteKey = 'route';

    var pushRoute = function(route) {
        var routeStack = getRouteStack();

        routeStack.push(route);

        LSD.setItem(storageRouteKey, routeStack);
    };

    var popRoute = function() {
        var routeStack = getRouteStack();

        if (!isEmpty(routeStack)) {
            routeStack.pop();
        }

        LSD.setItem(storageRouteKey, routeStack);
    };

    var peekRoute = function() {
        var routeStack = getRouteStack();

        if (!isEmpty(routeStack)) {
            return routeStack[routeStack.length - 1];
        }

        return null
    };

    var isEmpty = function(stack) {
        return stack.length == 0;
    };

    var getRouteStack = function() {
        var routeStack = LSD.getItem('route');

        if (routeStack) {
            return routeStack;
        }

        return [];
    };
});