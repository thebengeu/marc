/*global define*/

// LSD.js - localStorage, Distributed.
//
// Starting point from Nicholas C. Zakas' "Learning from XAuth: Cross-domain localStorage"
// http://www.nczonline.net/blog/2010/09/07/learning-from-xauth-cross-domain-localstorage/

(function (root, factory) {
    'use strict';

    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(factory);
    } else {
        // Browser globals
        root.LSD = factory();
    }
}(this, function () {
    'use strict';

    // Most browsers have at least a 2551 k character limit:
    // http://dev-test.nemikor.com/web-storage/support-test/
    var CHAR_LIMIT = 2500 * 1024;

    function CrossDomainStorage(origin, path){
        this.origin = origin;
        this.path = path;
        this._iframe = null;
        this._iframeReady = false;
        this._queue = [];
        this._requests = {};
        this._id = 0;
    }

    CrossDomainStorage.prototype = {

        //restore constructor
        constructor: CrossDomainStorage,

        //public interface methods

        init: function(){
            var that = this;
            if (!this._iframe){
                if (window.postMessage && window.JSON && window.localStorage){
                    this._iframe = document.createElement("iframe");
                    this._iframe.style.cssText = "position:absolute;width:1px;height:1px;left:-9999px;";
                    document.body.appendChild(this._iframe);

                    if (window.addEventListener){
                        this._iframe.addEventListener("load", function(){ that._iframeLoaded(); }, false);
                        window.addEventListener("message", function(event){ that._handleMessage(event); }, false);
                    } else if (this._iframe.attachEvent){
                        this._iframe.attachEvent("onload", function(){ that._iframeLoaded(); }, false);
                        window.attachEvent("onmessage", function(event){ that._handleMessage(event); });
                    }
                } else {
                    throw new Error("Unsupported browser.");
                }
            }

            this._iframe.src = this.origin + this.path;

        },

        getItem: function(key, callback){
            var request = {
                    method: 'get',
                    key: key,
                    id: ++this._id
                },
                data = {
                    request: request,
                    callback: callback
                };

            if (this._iframeReady){
                this._sendRequest(data);
            } else {
                this._queue.push(data);
            }

            if (!this._iframe){
                this.init();
            }
        },

        setItem: function(key, value){
            var request = {
                    method: 'set',
                    key: key,
                    value: value,
                    id: ++this._id
                },
                data = {
                    request: request,
                    callback: function() {}
                };

            if (this._iframeReady){
                this._sendRequest(data);
            } else {
                this._queue.push(data);
            }

            if (!this._iframe){
                this.init();
            }
        },

        removeItem: function(key){
            var request = {
                    method: 'remove',
                    key: key,
                    id: ++this._id
                },
                data = {
                    request: request,
                    callback: function() {}
                };

            if (this._iframeReady){
                this._sendRequest(data);
            } else {
                this._queue.push(data);
            }

            if (!this._iframe){
                this.init();
            }
        },

        clear: function(){
            var request = {
                    method: 'clear',
                    id: ++this._id
                },
                data = {
                    request: request,
                    callback: function() {}
                };

            if (this._iframeReady){
                this._sendRequest(data);
            } else {
                this._queue.push(data);
            }

            if (!this._iframe){
                this.init();
            }
        },

        //private methods

        _sendRequest: function(data){
            this._requests[data.request.id] = data;
            this._iframe.contentWindow.postMessage(JSON.stringify(data.request), this.origin);
        },

        _iframeLoaded: function(){
            this._iframeReady = true;

            if (this._queue.length){
                for (var i=0, len=this._queue.length; i < len; i++){
                    this._sendRequest(this._queue[i]);
                }
                this._queue = [];
            }
        },

        _handleMessage: function(event){
            if (event.origin == this.origin){
                var data = JSON.parse(event.data);
                this._requests[data.id].callback(data);
                delete this._requests[data.id];
            }
        }
    };

    var freeChars = localStorage.getItem('LSD:freeChars');
    freeChars = freeChars ? JSON.parse(freeChars) : {};
    var cds = {};
    for (var domain in freeChars) {
        cds[domain] = new CrossDomainStorage(domain, '/LSD.html');
    }

    var keys = localStorage.getItem('LSD:keys');
    keys = keys ? JSON.parse(keys) : {};

    return {
        getRemoteItem: function (key, callback) {
            var domain = keys[key];
            if (domain) {
                cds[domain].getItem(key, function (data) {
                    callback(data.value);
                });
            } else {
                callback();
            }
        },
        setRemoteItem: function (key, value) {
            var length = key.length + value.length;

            // TODO: keep track of individual value lengths and move to new
            // storage if not enough free chars for new length.
            var domain = keys[key];

            if (!domain) {
                for (var dom in freeChars) {
                    if (freeChars[dom] > length) {
                        domain = dom;
                        break;
                    }
                }
                if (!domain) {
                    domain = 'http://' + (_.size(freeChars) + 10).toString(36) + '.' + location.host;
                    freeChars[domain] = CHAR_LIMIT;
                    cds[domain] = new CrossDomainStorage(domain, '/LSD.html');
                }
            }
            cds[domain].setItem(key, value);
            freeChars[domain] -= length;
            localStorage['LSD:freeChars'] = JSON.stringify(freeChars);
            keys[key] = domain;
            localStorage['LSD:keys'] = JSON.stringify(keys);
        },
        removeRemoteItem: function (key) {
            var domain = keys[key];
            if (domain) {
                cds[domain].removeItem(key);
            }
        },
        clearRemotes: function () {
            for (domain in cds) {
                cds[domain].clear();
            }
        },
        getItem: function (key) {
            return localStorage.getItem(key);
        },
        setItem: function (key, value) {
            localStorage.setItem(key, value);
        },
        removeItem: function (key) {
            localStorage.removeItem(key);
        },
        clear: function () {
            localStorage.clear();
        }
    };
}));
