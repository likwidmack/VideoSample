/**
 * data-property-triggers file for ndp-video-spa on 06-Apr-16.
 */

define('data-configuration-property-callback', ['jquery', 'preset-configuration'], function ($, Presets) {
    Date = window.Date;
    var wait = window.$PAGE_WAIT,
        EventObserver = window.$GLOBAL_FUNCTIONS.AbstractEventObserver;

    var variables = window.$GLOBAL_PARAM,
        data = variables.$DATA2GLOBAL;

    var page, utils, panel,
        _console = window['console'];

    wait.on(wait.PAGE, function () {
        page = window.$page;
        utils = window.$page.utils;
        _console.log('Configuration Event Wait Condition Initialized :: window.$page', Date.now());
    });

    wait.on(wait.CONSOLE, function () {
        _console = window.$page.console.getInstance('Configuration Events');
        _console.log('Wait Condition Initialized :: window.$page.console', Date.now());
    });

    wait.on('panel', function () {
        panel = window.$page.panel();
        _console.log('Configuration Event Wait Condition Initialized :: window.$page.panel', Date.now());
    });

    function DataTriggers() {
        EventObserver.call(this);

        for (var prop in data) {
            _defineDataProp(prop, this);
        }

        this.addListener((Object.keys(variables.$GLOBAL2DATA)).join(' '), this.handler);
    }

    DataTriggers.prototype = Object.create(EventObserver.prototype, {
        trigger: {value: trigger}
        , triggerAsset: {value: triggerAsset}
        , handler: {value: handler}
    });

    return DataTriggers;

    // MAJOR EVENTS
    // 1. Page Refresh
    // 2. Module Update
    // 3. Module Refresh, Start & Stop
    // 4. Module Create & Destroy

    function trigger(globalType, newValue) {
        var dataType = variables.$GLOBAL2DATA[globalType],
            hasChanged = variables[globalType] !== newValue;

        if (!hasChanged) return;
        variables[globalType] = newValue;

        this.notify(globalType, {
            type: dataType,
            global: globalType,
            value: variables[globalType],
            origin: 'data'
        });

        switch (dataType) {
            case 'debug':
                // notify refresh Page
                break;
            case 'player':
                break;
            case 'preset':
                // notify Preset Object
                break;
        }

    }

    function triggerAsset(changes) {
        var globalType = '$PLAYLIST_ASSETS',
            dataType = variables.$GLOBAL2DATA[globalType],
            valueType = changes ? (arguments[1] || 'updated') : 'all';

        this.notify(globalType, {
            type: dataType,
            global: globalType,
            value: changes || (variables[globalType]).raw,
            valueType: valueType,
            origin: 'data'
        });
    }

    function handler(e) {
        _console.log('$GLOBAL_PARAM.' + e.global + ' Updated! ::', e.value);

        var modules = page && page.modules;
        if (modules) modules.notify(e);
    }

    function _defineDataProp(prop, owner) {
        Object.defineProperty(owner, prop, {
            get: function () {
                return data[prop];
            },
            enumerable: true
        });
    }



});