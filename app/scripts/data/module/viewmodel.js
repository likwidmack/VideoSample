/**
 * module-viewmodel file for ndp-video-spa on 27-Apr-16.
 */

define('configuration-module-viewmodel',['module-mgmt'],function (ModuleMgmt) {
    Date = window.Date;
    window.$GLOBAL_PARAM.$LOG_STORAGE.modules = [];

    var wait = window.$PAGE_WAIT,
        _console = window.console;

    var views = window.$GLOBAL_PARAM.$MODULES,
        page = null,
        utils = null,
        data = null;

    wait.on(wait.CONSOLE, function () {
        _console = window.$page.console.getInstance('Module ViewModels');
        _console.log('Wait Condition Initialized :: window.$page.console', Date.now());
    });

    wait.on(wait.PAGE, function () {
        page = window.$page;
        utils = page.utils;
        data = page.data;
        _console.log('Wait Condition Initialized :: window.$page', Date.now());
    });

    function ModuleViewModel() {
        ModuleMgmt.call(this);
        var _this = this;

        for (var moduleName in views) {
            Object.defineProperty(this.data, moduleName, {
                get: function () {
                    return utils.toBoolean((views[moduleName]));
                },
                set: function (value) {
                    var parsedValue = utils.toNumber(value),
                        hasChanged = (parsedValue !== (views[moduleName]));

                    (views[moduleName]) = parsedValue;
                    if (hasChanged) _this.run(moduleName);
                },
                enumerable: true
            });
        }
    }


    ModuleViewModel.prototype = Object.create(ModuleMgmt.prototype, {
        timestamp: {value: Date.now()}
        , constructor: {value: ModuleViewModel}
        , data: {
            value: {},
            enumerable: true
        }
        , run: {value: run}
        , init: {value: init}
    });

    return ModuleViewModel;

    function init() {
        var _settings = this.data,
            keys = Object.keys(_settings),
            i = keys.length;

        while (i--) {
            var moduleName = keys[i];
            _getModule(moduleName)
        }
    }

    function run(moduleName) {
        _console.log('Run Module',
            moduleName,
            this.data[moduleName],
            this[moduleName],
            page[moduleName]());

        if (this.data[moduleName] && !this[moduleName]) {
            _getModule(moduleName)
        }

        if (this.data[moduleName] && !page[moduleName]()) {
            (this.get(moduleName)).start(true);
            return;
        }

        if (!this.data[moduleName] && page[moduleName]()) {
            (this.get(moduleName)).stop();
        }
    }

    function _getModule(moduleName) {
        require([moduleName]);
        //require([moduleName + '/viewmodel']);
    }

});