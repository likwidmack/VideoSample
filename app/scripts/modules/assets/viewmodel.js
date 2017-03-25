/**
 * viewmodel file for ndp-video-spa on 26-Apr-16.
 */

require([
    'jquery',
    'knockout',
    'assets-get'
], function ($, ko, GetAssets) {
    Date = window.Date;
    var $AbstractModule = window.$GLOBAL_FUNCTIONS.AbstractModule,
        $LinkedListAbstract = window.$GLOBAL_FUNCTIONS.LinkedListAbstract;
    var wait = window.$PAGE_WAIT,
        _console = window.$page.console.getInstance('Assets Viewmodel'),
        page = window.$page,
        utils = page.utils;

    function AssetViewModel(moduleName) {
        $AbstractModule.call(this, moduleName || 'assets');
        var _this = this;

        this.playlists = ko.observableArray([]);
        var _unshiftPlaylists = (this.playlists).unshift;

        function playlists_unshift(scope) {
            var _this = this,
                _arguments = Array.prototype.slice.call(arguments, 1);
            var len = _arguments.length;
            _console.debug('Push New Playlist to ViewModel', _arguments);

            while (len--) {
                var playlist = _arguments[len];
                playlist.playlist_index = scope.playlists().length;
            }

            _unshiftPlaylists.apply(this, _arguments);
        }

        (this.playlists).unshift = playlists_unshift.bind(this.playlists, this);
        this.playlists.subscribe(function (array) {
            if (array.length) {
                if (!this.current.playlist())
                    this.current.playlist(array[0]);
            }
        }, this);

        Object.defineProperties(this, {
            linkedList: {value: new $LinkedListAbstract()}
            , getUrls: {value: new GetAssets(this)}
            , dataAssets: {
                get: function () {
                    return page.data.assets.raw
                }
            }
        });

        this.current = {};
        Object.defineProperties(this.current, {
            playlist: _define(ko.observable(false))
            , asset: _define(ko.observable(false))
        });

        this.current.asset.subscribe(function (asset) {
            if (!!asset) {
                page.currentAsset(asset.data);
                var index = (asset.data).playlist_index;
                if (!this.current.playlist() || (index != this.current.playlist().playlist_index)) {
                    this.current.playlist((this.playlists()).find(function(item){
                        return item.playlist_index = index;
                    }));
                }
            } else {
                page.currentAsset(false);
            }
        }, this);

        this.current.playlist.subscribe(function (playlist) {
            _console.log('Current Playlist', playlist);
            if (!!playlist) {
                if (!this.current.asset()) this.current.asset(playlist.first());
                (this.playlists()).forEach(function(item){
                    item.tagActive(false);
                });
                playlist.tagActive(true);
            }
        }, this);

    }

    AssetViewModel.prototype = Object.create($AbstractModule.prototype, {
        timestamp: {value: Date.now()}
        , next: {value: next}
        , load: {value: load}
        , start: {value: startOverride}
        , stop: {value: stopOverride}
        , handler: {value: wait.debounce(handler, 100, 'AssetsDataHandler')}
    });

    window.$page.modules.add({
        module: 'assets',
        constructor: AssetViewModel,
        html: 'html-assets'
    });

    function next() {
        var current = this.current;
        var nextAsset = (current.asset()).next;
        if (!nextAsset) nextAsset = (current.playlist()).first();
        current.asset(nextAsset);
    }

    function load(asset_index, playlist_index) {
        var asset = false,
            playlist = false,
            current = this.current;

        if (asset_index['data']) {
            asset = asset_index;
        } else {
            playlist_index = parseInt(playlist_index) || 0;
            asset_index = parseInt(asset_index) || 0;

            playlist = this.playlists()[playlist_index];
            if (playlist && playlist !== current.playlist()) {
                current.playlist(playlist);
                asset = (current.playlist()).getAssetAtIndex(asset_index);
            }
        }

        _console.debug('FIRST Load Playlist & Asset', playlist_index, asset_index,
            (playlist && playlist !== current.playlist()), playlist);

        if (asset && asset !== current.asset()) {
            current.asset(asset);
        } else if (!asset) {
            current.asset(this.linkedList.first);
        }

        _console.log('Load Playlist & Asset', playlist, asset);
    }

    function handler(e) {
        if (e.valueType === 'removed') {
            return;
        } else if (e.valueType === 'added') {
            this.getUrls.get(e);
            return;
        } else {
            this.getUrls.get();
        }
    }

    function startOverride(deferTimeout) {
        $AbstractModule.prototype.start.call(this, deferTimeout);
        var _this = this;
        page.getAsset = function (data, event) {
            _this.load(data);
        };

        page.getNextAsset = function () {
            _this.next();
        };

        this.getUrls.get();
        this.addListener('asset', this.handler, this);
        _console.debug('****startOverride****');
    }

    function stopOverride() {
        $AbstractModule.prototype.stop.call(this);

        this.playlists([]);
        this.current.playlist(false);
        this.current.asset(false);

        page.getAsset = $.noop;
        page.getNextAsset = $.noop;
    }

    function _define(obj) {
        return {
            value: obj,
            enumerable: obj instanceof Function,
            writable: !(obj instanceof Function)
        }
    }

});