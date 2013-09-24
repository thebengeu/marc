/*global define*/

/**
 * Similar to a stack.
 */
define([
    'jquery',
    'underscore',
    'backbone',
    'LSD',
    'collections/fileList'
], function ($, _, Backbone, LSD, FileList) {

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
            _addToFileList(route);
        }

        LSD.setItem(storageRouteKey, JSON.stringify(routeStack));
    };

    var makeSpaceInStack = function(routeStack) {
        if (routeStack.length >= MAX_STACK_SIZE) {
            var route = routeStack[0];
            _removeFromFileList(route);
            routeStack.splice(0, 1);
        }
    };

    var popRoute = function() {
        var routeStack = getRouteStack();

        if (!_isEmpty(routeStack)) {
            var route = routeStack.pop();
            _removeFromFileList(route)
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

    var _addToFileList = function(route) {
        if (route != 'add-from-github') {
            var fileModel = {
                path: route,
                source: 'recent',
                id: 'recent' + route
            };
            FileList.add(fileModel);
        }
    };

    var _removeFromFileList = function(route) {
        var fileModel = {
            path: route,
            source: 'recent',
            id: 'recent' + route
        };
        FileList.remove(fileModel);
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