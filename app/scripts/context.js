/*global define*/
define(function () {
    'use strict';

     /**
     * This ensures a singleton of the Context module.
     */
    var instance = null;

    /*
     * The Context instance. This stores all the shared instances across the
     * application.
     */
    var context = function () {
        var sidebar = null;

        var setSidebar = function(s) {
            sidebar = s;
        };

        var getSidebar = function() {
            return sidebar;
        };

        return {
            setSidebar: function(sidebar) {
                return setSidebar(sidebar);
            },
            getSidebar: function() {
                return getSidebar();
            }
        };
    };
    return {
        getInstance: function () {
            if (instance) {
                return instance;
            }
            instance = context();
            return instance;
        }
    };
});
