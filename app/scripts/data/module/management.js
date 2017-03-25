/**
 * module-management file for ndp-video-spa on 22-Apr-16.
 */

define('module-mgmt', ['module-html'], function (HTMLView) {
    Date = window.Date;

    var EventObserver = window.$GLOBAL_FUNCTIONS.AbstractEventObserver;
    var wait = window.$PAGE_WAIT,
        _console = window.console,
        variables = window.$GLOBAL_PARAM;

    wait.on(wait.CONSOLE, function () {
        _console = window.$page.console.getInstance('Module Management');
        _console.log('Wait Condition Initialized :: window.$page.console', Date.now());
    });

    var MODULES = {};

    function ModuleMGMT() {
        EventObserver.call(this);
    }

    ModuleMGMT.prototype = Object.create(EventObserver.prototype, {
        timestamp: {value: Date.now()}
        , get: _define(get)
        , add: _define(add)
        , remove: _define(remove)
        , refresh: _define(refresh)
    });

    return ModuleMGMT;

    function get(moduleName) {
        return this[moduleName];
    }

    function add(moduleObj) {
        var moduleName = moduleObj.module,
            fnObj = moduleObj.constructor,
            htmlPath = moduleObj.html;
        _console.info(moduleName, htmlPath, !!this[moduleName], !fnObj);
        if (this[moduleName])return false;
        if (MODULES.hasOwnProperty(moduleName)) {
            fnObj = fnObj || (MODULES[moduleName]).fn;
        }
        if (!fnObj) return false;

        var _html = false;
        if (!!htmlPath) _html = new HTMLView(moduleName, htmlPath);

        MODULES[moduleName] = {
            fn: fnObj,
            html: _html
        };

        _defineModule(this, moduleName);
        this.addListener((Object.keys(variables.$DATA2GLOBAL)), this[moduleName]);
    }

    function remove(moduleName) {
        this.removeListener((Object.keys(variables.$DATA2GLOBAL)), this[moduleName]);
        delete this[moduleName];
    }

    function refresh(moduleName) {
        var _this = this;
        if (!this.hasOwnProperty(moduleName))
            return false;

        this.remove(moduleName);
        setTimeout(function () {
            _defineModule(_this, moduleName);
        }, 1);
    }

    function _define(fnValue) {
        return {
            value: fnValue,
            enumerable: fnValue instanceof Function
        }
    }

    function _defineModule(owner, moduleName) {
        var module = MODULES[moduleName],
            fn = module.fn;
        Object.defineProperty(owner, moduleName, {
            value: new fn(moduleName),
            enumerable: true,
            configurable: true
        });

        (owner[moduleName]).view.subscribe(function (_bool) {
            if (module.html) module.html.toggle(_bool);
        });
        (owner[moduleName]).start();
    }


});