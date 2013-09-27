/*global define*/

// LSD.js - localStorage, Distributed.
//
// Starting point from Nicholas C. Zakas' 'Learning from XAuth: Cross-domain localStorage'
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

    function CrossDomainStorage(origin, path) {
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

        init: function () {
            var that = this;
            if (!this._iframe) {
                if (window.postMessage && window.JSON && window.localStorage) {
                    this._iframe = document.createElement('iframe');
                    this._iframe.style.cssText = 'position:absolute;width:1px;height:1px;left:-9999px;';
                    document.body.appendChild(this._iframe);

                    if (window.addEventListener) {
                        this._iframe.addEventListener('load', function () {
                            that._iframeLoaded();
                        }, false);
                        window.addEventListener('message', function (event) {
                            that._handleMessage(event);
                        }, false);
                    } else if (this._iframe.attachEvent) {
                        this._iframe.attachEvent('onload', function () {
                            that._iframeLoaded();
                        }, false);
                        window.attachEvent('onmessage', function (event) {
                            that._handleMessage(event);
                        });
                    }
                } else {
                    throw new Error('Unsupported browser.');
                }
            }

            this._iframe.src = this.origin + this.path;

        },

        getItem: function (key, callback) {
            this._queueRequest({
                method: 'get',
                key: key
            }, callback);
        },

        setItem: function (key, value) {
            this._queueRequest({
                method: 'set',
                key: key,
                value: value
            });
        },

        removeItem: function (key) {
            this._queueRequest({
                method: 'remove',
                key: key
            });
        },

        clear: function () {
            this._queueRequest({
                method: 'clear'
            });
        },

        //private methods

        _queueRequest: function (request, callback) {
            request.id = ++this._id;
            var data = {
                request: request,
                callback: callback || function () {
                }
            };

            if (this._iframeReady) {
                this._sendRequest(data);
            } else {
                this._queue.push(data);
            }

            if (!this._iframe) {
                this.init();
            }
        },

        _sendRequest: function (data) {
            this._requests[data.request.id] = data;
            this._iframe.contentWindow.postMessage(JSON.stringify(data.request), this.origin);
        },

        _iframeLoaded: function () {
            this._iframeReady = true;

            if (this._queue.length) {
                for (var i = 0, len = this._queue.length; i < len; i++) {
                    this._sendRequest(this._queue[i]);
                }
                this._queue = [];
            }
        },

        _handleMessage: function (event) {
            if (event.origin === this.origin) {
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

    var directory = localStorage.getItem('LSD:directory');
    directory = directory ? JSON.parse(directory) : {};

    return {
        getRemoteItem: function (key, callback) {
            var entry = directory[key];
            var domain = entry && entry.domain;
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

            var entry = directory[key];
            var domain = entry && entry.domain;
            if (entry && length - entry.length > freeChars[domain]) {
                cds[domain].removeItem(key);
                entry = undefined;
            }

            if (!entry) {
                for (var dom in freeChars) {
                    if (freeChars[dom] > length) {
                        domain = dom;
                        break;
                    }
                }
                if (!domain) {
                    var host = location.host;
                    if (host === 'marc.beng.me') {
                        host = 'beng.me';
                    }
                    domain = 'http://' +
                        (Object.keys(freeChars).length + 10).toString(36) +
                        '.' + host;
                    freeChars[domain] = CHAR_LIMIT;
                    cds[domain] = new CrossDomainStorage(domain, '/LSD.html');
                }
            }
            cds[domain].setItem(key, value);
            freeChars[domain] -= length;
            localStorage['LSD:freeChars'] = JSON.stringify(freeChars);
            directory[key] = {
                domain: domain,
                length: length
            };
            localStorage['LSD:directory'] = JSON.stringify(directory);
        },
        removeRemoteItem: function (key) {
            var entry = directory[key];
            var domain = entry && entry.domain;
            if (domain) {
                cds[domain].removeItem(key);
                freeChars[domain] += entry.length;
                localStorage['LSD:freeChars'] = JSON.stringify(freeChars);
                delete directory[key];
                localStorage['LSD:directory'] = JSON.stringify(directory);
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
            for (var domain in cds) {
                cds[domain].clear();
            }
            localStorage.clear();
        }
    };
}));
