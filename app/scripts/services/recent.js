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
    'use strict';

    /**
     * The maximum stack size used in the stack.
     * @type {number}
     */
    var MAX_STACK_SIZE = 10;

    /**
     * The key used to in the LSD. The route stack will be its corresponding
     * value.
     * @type {string}
     */
    var storageRouteKey = 'route';

    /**
     * Pushes the given route to the top of the stack.
     * @param {string} route .
     */
    var pushRoute = function(route) {
        var routeStack = getRouteStack();

        var routeIndex = routeStack.indexOf(route);
        if(routeIndex !== -1) {
            // Push to top
            routeStack.splice(routeIndex, 1, route);
        }
        else {
            _makeSpaceInStack(routeStack);
            routeStack.push(route);
            _addToFileList(route);
        }

        LSD.setItem(storageRouteKey, JSON.stringify(routeStack));
    };

    /**
     * Ensures that the stack only has the maximum size at any given point.
     * It will remove the least recent route on the stack to make space
     * otherwise.
     * @param {Array.<string>} routeStack
     */
    var _makeSpaceInStack = function(routeStack) {
        if (routeStack.length >= MAX_STACK_SIZE) {
            var route = routeStack[0];
            _removeFromFileList(route);
            routeStack.splice(0, 1);
        }
    };

    /**
     * Pops the most recent route off the stack.
     * @return {string} The most recent route.
     */
    var popRoute = function() {
        var routeStack = getRouteStack();

        if (!_isEmpty(routeStack)) {
            var route = routeStack.pop();
            _removeFromFileList(route);
            LSD.setItem(storageRouteKey, JSON.stringify(routeStack));
            return route;
        }
    };

    /**
     * See what is the most recent route in the stack without returning
     * anything.
     */
    var peekRoute = function() {
        var routeStack = getRouteStack();

        if (!_isEmpty(routeStack)) {
            return routeStack[routeStack.length - 1];
        }

        return null;
    };

    /**
     * Checks if the stack is empty.
     * @param {Array.<string>} routeStack .
     * @return {Boolean} True if the stack is empty, false otherwise.
     */
    var _isEmpty = function(routeStack) {
        return routeStack.length === 0;
    };

    /**
     * Creates a file object and adds it to the file list. This will allow the
     * file to show up in the sidebar's file tree.
     * @param {string} route The route to be added.
     */
    var _addToFileList = function(route) {
        if (route !== 'add-from-github') {
            var fileModel = {
                path: route,
                source: 'recent',
                id: 'recent/' + route
            };
            FileList.add(fileModel);
        }
    };

    /**
     * Creates a file object and removes it from the file list. This file will
     * be removed from the sidebar's file tree.
     * @param {string} route The route to be removed.
     */
    var _removeFromFileList = function(route) {
        var fileModel = {
            path: route,
            source: 'recent',
            id: 'recent/' + route
        };
        FileList.remove(fileModel);
    };

    /**
     * Removes the route from the recent array. NO files are removed from the
     * file list.
     * @param {string} route The route to be removed.
     */
    var removeRoute = function(route) {
        var routeStack = getRouteStack();

        var routeIndex = routeStack.indexOf(route);

        // Route exists
        if(routeIndex !== -1) {
            // Push to top
            routeStack.splice(routeIndex, 1);
            LSD.setItem(storageRouteKey, JSON.stringify(routeStack));
        }
    };

    /**
     * Gets a cloned copy of the recent stack stored in the LSD.
     * @return {Array.<string>} The stack of routes.
     */
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
        removeRoute: function(route) {
            return removeRoute(route);
        },
        getRoutes: function() {
            return getRouteStack();
        }
    };
});
