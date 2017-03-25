/**
 * File name: preset-configuration, created on 18-Apr-16 in project, ndp-video-spa.
 * https://sourcemaking.com/design_patterns/state
 * http://programmers.stackexchange.com/questions/293198/implementing-the-state-pattern-with-object-setprototypeof
 * http://www.dofactory.com/javascript/state-design-pattern
 */

define('preset-configuration', ['jquery'], function ($) {
    Date = window.Date;
    var _console = window.console,
        wait = window.$PAGE_WAIT,
        url = './data/presets/',
        file = {
            clean: {
                url: url + 'clean.json'
            }
            , dev: {
                url: url + 'dev.json'
            }
            , qa: {
                url: url + 'qa.json'
            }
            , baseline: {
                url: url + 'baseline.json'
            }
            , perf: {
                url: url + 'perf.json'
            }
        };

    var FormatModel = Object.create(Object.prototype, {
        timestamp: {value: Date.now()}
        , clean: _define(clean)
        , dev: _define(dev)
        , qa: _define(qa)
        , baseline: _define(baseline)
        , perf: _define(perf)
    });

    //wait.on(wait.PAGE, onPageWait);
    wait.on(wait.CONSOLE, function () {
        _console = window.$page.console.getInstance('Preset Configuration');
        _console.log('Wait Condition Initialized :: window.$page.console', Date.now());
    });

    return FormatModel;

    function onPageWait() {
        for (var preset in file) {
            _getPreset(preset);
        }
        setTimeout(function () {
            _console.debug('**onPageWait**', file, FormatModel);
        }, 5);
    }

    function clean() {
        var obj = file.clean;
        if (!obj.json) {
            _getPreset(obj, function (json) {
                window.$page.data.pageRefresh = true;
                _map(json);
            });
            return;
        }
        // Requires Page Refresh
        window.$page.data.pageRefresh = true;
        _map(obj.json);

    }

    function dev() {
        var obj = file.dev;
        if (!obj.json) {
            _getPreset(obj, _map);
            return;
        }
        _map(obj.json);
    }

    function qa() {
        var obj = file.qa;
        if (!obj.json) {
            _getPreset(obj, _map);
            return;
        }
        _map(obj.json);
    }

    function baseline() {
        var obj = file.baseline;
        if (!obj.json) {
            _getPreset(obj, _map);
            return;
        }
        _map(obj.json);
    }

    function perf() {
        var obj = file.perf;
        if (!obj.json) {
            _getPreset(obj, function (json) {
                window.$page.data.pageRefresh = true;
                _map(json);
            });
            return;
        }
        // Requires Page Refresh
        window.$page.data.pageRefresh = true;
        _map(obj.json);
    }

    function _define(fn) {
        return {
            value: fn,
            enumerable: true
        }
    }

    function _getPreset(preset, callback) {
        var jqxhr = $.getJSON(preset.url, function (json) {
            preset.json = json;
            if (callback instanceof Function) callback(preset.json);
        });
        jqxhr.fail(function () {
            _console.error('Async Request failed to retrieve json file, ' + preset.url);
        });
    }

    function _map(json) {
        var keys = Object.keys(json),
            len = keys.length;

        while (len--) {
            var section = keys[len];
            _console.debug('Updating Preset Sections', section, json);
            for (var prop in json[section]) {
                if (section === "modules") {
                    _mapModules(prop, json[section]);
                } else {
                    _mapData(prop, json[section])
                }
            }
        }

        var page = window.$page,
            panel = page.panel && page.panel();
        if (panel)
            panel.items.updateData('preset');
    }

    function _mapData(prop, json) {
        var page = window.$page,
            data = page.data;
        if (typeof data[prop] !== 'undefined') {
            _console.debug('Updating Preset Parameter', prop, json[prop]);
            page.data[prop] = json[prop];
        }
    }

    function _mapModules(prop, json) {
        var page = window.$page,
            modules = page.modules;
        if ((modules.data).hasOwnProperty(prop)) {
            _console.debug('Updating Preset Module', prop, json[prop]);
            modules.data[prop] = json[prop];
        }
    }

});