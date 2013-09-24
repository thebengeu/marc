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

    var MAX_STACK_SIZE = 10;
    var storageRouteKey = 'route';

    var pushRoute = function(route) {
        var routeStack = getRouteStack();

        var routeIndex = routeStack.indexOf(route);
        if(routeIndex != -1) {
            // Push to top
            routeStack.splice(routeIndex, 1, route);
        }
        else {
            makeSpaceInStack(routeStack);
            routeStack.push(route);
        }

        LSD.setItem(storageRouteKey, JSON.stringify(routeStack));

        console.log(LSD['route']);
    };

    var makeSpaceInStack = function(routeStack) {
        if (routeStack.length >= MAX_STACK_SIZE) {
            routeStack.splice(0, 1);
        }
    };

    var popRoute = function() {
        var routeStack = getRouteStack();

        if (!_isEmpty(routeStack)) {
            routeStack.pop();
        }

        LSD.setItem(storageRouteKey, JSON.stringify(routeStack));
    };

    var peekRoute = function() {
        var routeStack = getRouteStack();

        if (!_isEmpty(routeStack)) {
            return routeStack[routeStack.length - 1];
        }

        return null
    };

    var _isEmpty = function(stack) {
        return stack.length == 0;
    };

    var getRouteStack = function() {
        var routeStack = JSON.parse(LSD.getItem('route'));

        if (routeStack) {
            return routeStack.slice(0);
        }

        return [];
    };

    return {
        pushRoute: function(route) {
            return pushRoute(route);
        },
        popRoute: function() {
            return popRoute();
        },
        peekRoute: function() {
            return peekRoute();
        },
        getRoutes: function() {
            return getRouteStack();
        }
    }
});