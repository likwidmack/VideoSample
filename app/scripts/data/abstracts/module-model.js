/**
 * abstract-module file for ndp-video-spa on 14-Apr-16.
 */

window.$GLOBAL_FUNCTIONS.AbstractModule = (function (EventObserver, ko) {
    Date = window.Date;
    var global = window.$GLOBAL_FUNCTIONS;

    function abstract(Module) {
        EventObserver.call(this);
        Object.defineProperties(this, {
            _module: {
                value: Module || false
            }
            , view: {
                value: ko.observable(false),
                enumerable: true
            }
            , html: {
                value: false,
                writable: true
            }
        });

        this.view.subscribe(function (_bool) {
            (window.$page.layout).view(this._module, _bool);
        }, this);
    }

    abstract.prototype = Object.create(EventObserver.prototype, {
        timestamp: {value: Date.now()}
        , constructor: {
            value: abstract,
            configurable: true,
            writable: true
        }
        , parent: {
            get: function () {
                return window.$page.modules;
            }
        }
        , _view: {
            get: function () {
                return window.$GLOBAL_PARAM.$MODULES[this._module]
            }
        }
        , start: {
            value: function (deferTimeout) {
                this.view(true);

                if (this._module) {
                    if (window.$page[this._module] instanceof Function) {
                        window.$page[this._module](this);
                    }

                    if (deferTimeout)return;

                    var _this = this;
                    setTimeout(function () {
                        window.$PAGE_WAIT.trigger(_this._module);
                    }, 1);
                }
            },
            writable: true,
            enumerable: true
        }
        , restart: {
            value: function (resetFn) {
                this.stop();
                if (resetFn instanceof Function) {
                    resetFn();
                }
                var _this = this;
                setTimeout(function () {
                    _this.start(true);
                }, 10);
            },
            enumerable: true
        }
        , stop: {
            value: function () {
                this.view(false);
                if (window.$page[this._module] instanceof Function) {
                    window.$page[this._module](false);
                }
            },
            writable: true,
            enumerable: true
        }
        , store: {
            value: function (storageEventModel) {
                var storage = window.$GLOBAL_PARAM.$LOG_STORAGE.modules;
                if (storageEventModel instanceof global.StorageEventModel) {
                    storage.push(storageEventModel);
                }
            }
        }
        , _callbacks: {
            value: []
        }
    });

    return abstract;

})(window.$GLOBAL_FUNCTIONS.AbstractEventObserver, window.ko);