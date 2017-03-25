/**
 * data-property-configuration file for ndp-video-spa on 22-Mar-16.
 * http://stackoverflow.com/questions/642758/delimiter-to-use-within-a-query-string-value
 */

define('configuration-property-model', ['jquery', 'asset-configuration-data', 'data-configuration-property-callback'],
    function ($, AssetConfig, Callback) {
        Date = window.Date;
        var _global = window.$GLOBAL_PARAM,
            wait = window.$PAGE_WAIT,
            request_frame = window.$REQUEST_FRAME,
            _console = window.console;

        wait.on(wait.CONSOLE, function () {
            _console = window.$page.console.getInstance('Configuration Properties');
            _console.log('Wait Condition Initialized :: window.$page.console', Date.now());
        });

        function ConfigModel() {
            this.init();
            setTimeout(function () {
                wait.trigger(wait.DATA);
            }, 1);
        }

        ConfigModel.prototype = Object.create({
            constructor: ConfigModel
        }, {
            timestamp: {
                value: Date.now(),
                enumerable: true
            }
            , callback: {value: new Callback()}
            , init: {value: init}

            , 'debug': _define('$NDP_DEBUG', Boolean)
            , 'mode': _define('$NDP_DEBUG_MODE', Number)
            , 'version': _define('$NDP_VERSION', String)
            , 'ads': _define('$NDP_ADS', Boolean)
            , 'controlrack': _define('$NDP_CONTROL_RACK', Boolean)

            , 'autoplay': _define('$PLAYER_AUTOPLAY', Boolean)
            , 'player': _define('$PLAYER_TYPE', String)
            , 'pdk': _define('$PLAYER_PDK_VERSION', String)

            , 'async': _define('$PAGE_ASYNC', Boolean)
            , 'merged': _define('$PAGE_MERGED', Boolean)
            , 'brand': _define('$PAGE_BRAND', String)
            , 'branch': _define('$PAGE_BRANCH', String)
            , 'preset': _define('$PAGE_PRESET', String)

            , 'continuous': _define('$PLAYLIST_CONTINUOUS', Boolean)
            , 'assets': AssetConfig.define()
            , 'live': _define('$PLAYLIST_LIVE', Boolean)

            , 'fwads': _define('$FWADS_VERSION', String)
            , 'modules': {
                get: function () {
                    var arr = [];
                    for (var name in _global.$MODULES) {
                        if (_global.$MODULES[name]) arr.push(name);
                    }
                    return arr;
                },
                enumerable: true
            }
            , 'href': {
                get: function () {
                    var utils = window.$page.utils;
                    return utils.decode(window.$URL_LOCATION);
                }
            }
        });

        return ConfigModel;

        function init() {
            var _this = this;
            wait.on(wait.PAGE, function () {
                request_frame.add(urlStringQuery, _this);

                //TODO: check for page refresh
                //TODO: check for module refresh

                // map preset if exists
                if (!!_this.preset) {
                    //_this.callback.$PAGE_PRESET(_this.preset);
                }
            });
        }

        function _define(returnObject, dataType) {
            var to = function (value) {
                var utils = window.$page.utils;
                if (dataType === Boolean) return utils.toBoolean(value);
                else if (dataType === Number) return utils.toNumber(value);
                else return value;
            };

            return {
                get: function () {
                    return to(_global[returnObject]);
                },
                set: wait.debounce(function (newValue) {
                    var utils = window.$page.utils;
                    if (dataType === Boolean || dataType === Number)
                        newValue = utils.toNumber(newValue);
                    this.callback.trigger(returnObject, newValue);
                }, 50, 'setGlobal_' + returnObject),
                enumerable: true
            };
        }

        function urlStringQuery(owner) {
            owner = owner || this;
            var param = {};
            for (var prop in _global.$DATA2GLOBAL) {
                if (!_global.hasOwnProperty(_global.$DATA2GLOBAL[prop]))continue;
                _mapQuery(prop, param, owner);
            }

            window.$URL_LOCATION = window.location.origin;
            if ((Object.keys(param)).length) {
                window.$URL_LOCATION += ('?' + $.param(param));
                //_console.log('$URL_LOCATION UPDATE', window.$URL_LOCATION);
            }
        }

        function _mapQuery(prop, param, owner) {
            var _globalProp = _global.$DATA2GLOBAL[prop],
                value = _global[_globalProp];

            if (prop === 'assets') {
                AssetConfig.query(param);
            } else {
                var ownerPropValue = owner[prop];
                if (prop === 'modules') {
                    if (!(owner[prop]).length) return;
                    value = (ownerPropValue).join(',');
                }
                if (!!value) param[prop] = value;
            }
        }

    });