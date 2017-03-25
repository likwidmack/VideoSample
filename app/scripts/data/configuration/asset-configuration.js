/**
 * asset-configuration file for ndp-video-spa on 28-Dec-16.
 */

define('asset-configuration-data', ['jquery'], function ($) {
    Date = window.Date;

    var AssetModel = window.$GLOBAL_FUNCTIONS.AssetParameterModel;
    var _console = window.console,
        _global = window.$GLOBAL_PARAM,
        request_frame = window.$REQUEST_FRAME,
        wait = window.$PAGE_WAIT;

    wait.on(wait.CONSOLE, function () {
        _console = window.$page.console.getInstance('Asset Configuration');
        _console.log('Wait Condition Initialized :: window.$page.console', Date.now());
    });

    function AssetConfig() {
        var DynamicArrayAbstract = window.$GLOBAL_FUNCTIONS.DynamicArrayAbstract;

        Object.defineProperties(this, {
            assets: {
                value: new DynamicArrayAbstract(this.map()),
                enumerable: true
            }
        });

        this.init();
    }

    AssetConfig.prototype = Object.create({}, {
        timestamp: {value: Date.now()}
        , init: {value: init}
        , define: {value: define}
        , map: {value: map}
        , query: {value: query}
        , update: {value: update}
        , mapJSON: {value: mapJSON}
    });

    return new AssetConfig();

    function init() {
        window.$ASSET_CONFIGURATION = this.mapJSON.bind(this);
        request_frame.add(this.update, this);
    }

    function define() {
        var _this = this;

        return {
            get: function () {
                return _this.assets;
            },
            set: wait.debounce(function (newArray) {
                _this.assets.removeAll();
                _this.assets.add(newArray);
            }, 50, 'setAsset_Configuration'),
            enumerable: true
        }
    }

    function query(param) {
        var assetArray = this.assets.raw,
            i = assetArray.length;
        if (!i) return;
        var url, playlist = [], mpx = [];
        while (i--) {
            var asset = assetArray[i];
            switch (asset.type) {
                case 'playlistId':
                    playlist.push(asset.input + '|' + asset.label.replace(/\s/g, '_'));
                    break;
                case 'mpxId':
                    mpx.push(asset.input + '|' + asset.label.replace(/\s/g, '_'));
                    break;
                case 'url':
                    url = asset.input;
            }
        }

        playlist = playlist.join(',');
        mpx = mpx.join(',');
        if (!!playlist) param['playlistid'] = playlist;
        if (!!mpx) param['mpxid'] = mpx;
        if (!!url) param['canonicalurl'] = url;
    }

    function map() {
        var array = [],
            _unshift = array.unshift,
            _push = array.push,
            _splice = array.splice;

        function mod(_type) {
            var _arguments = Array.prototype.slice.call(arguments, 1);
            var len = _arguments.length;

            if (!len) return;
            while (len--) {
                var item = _arguments[len];
                item = new AssetModel(item.data);
                (_arguments[len]).data = item;
            }

            _type.apply(this, _arguments);
            var arg = _arguments.map(function (item) {
                return item.data;
            });
            _console.warn('Added New Asset Item to Global', arg);
            window.$page.data.callback.triggerAsset(arg, 'added');
        }

        array.unshift = mod.bind(array, _unshift);
        array.push = mod.bind(array, _push);

        function newSplice() {
            var removed = _splice.apply(this, arguments);
            removed = removed.map(function (item) {
                return item.data;
            });
            _console.debug('Asset Items Removed from Global', removed);
            window.$page.data.callback.triggerAsset(removed, 'removed');
            return removed;
        }

        array.splice = newSplice;

        return array;
    }

    function update() {
        if (_global['$PLAYLIST_ASSETS'] !== this.assets.raw) {
            _global['$PLAYLIST_ASSETS'] = this.assets.raw;
        }
    }

    function mapJSON(page, jsonString) {
        var _static = page.$PAGE_STATIC;

        if (!AssetModel) return;
        var _array = [];
        _array.push.apply(_array, jsonString.assets || []);

        _stringArrayMap(_static.playlistid, function (item) {
            var itemArray = item.split('|');
            if (itemArray.length === 2) {
                return {
                    input: itemArray[0],
                    label: (itemArray[1]).replace(/_/g, ' ')
                }
            }
            return {input: item};
        }, _array);

        _stringArrayMap(_static.mpxid, function (item) {
            var itemArray = item.split('|');
            if (itemArray.length === 2) {
                return {
                    type: 'mpxId',
                    input: itemArray[0],
                    label: (itemArray[1]).replace(/_/g, ' ')
                }
            }
            return {
                type: 'mpxId',
                input: item
            };
        }, _array);

        _stringArrayMap(_static.canonicalurl, function (item) {
            return {
                type: 'url',
                input: item
            };
        }, _array);

        _console.debug('MAP Playlist, MPX, & URL string queries', _array);
        this.assets.add(_array);
    }

    function _stringArrayMap(stringArray, mapCallback, assets) {
        if (stringArray) {
            var _array = _stringAssets2Array(stringArray);
            if (!!_array && _array.length) {
                _array = _array.map(mapCallback);
                assets.push.apply(assets, _array);
            }
        }
    }

    function _stringAssets2Array(_string, char) {
        if (!_string || typeof _string !== 'string') return _string;
        char = char || ',';
        var arr = _string.split(char);

        return arr;
    }

});