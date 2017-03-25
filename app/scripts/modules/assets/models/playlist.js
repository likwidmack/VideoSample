/**
 * playlists file for ndp-video-spa on 16-Mar-16.
 */

define('assets-playlist', [
    'jquery',
    'knockout',
    'assets-asset-model'
], function ($, ko, AssetModel) {
    Date = window.Date;
    var _console = window.$page.console.getInstance('Playlist Model');

    function PlaylistModel(id, name, url, parent) {
        var _this = this;
        this.playlist_index = 0;
        this.pointer = 0;
        this.playlistid = id || null;
        this.name = name || null;
        this.url = url || null;
        this.raw = null;

        Object.defineProperty(this, 'parent', {
            get: function () {
                return parent
            }
        });

        this.assets = ko.observableArray([]);

        //HTML Views logic
        this.showAssets = ko.observable(false);
        this.tagActive = ko.observable(false);
        this.activeStatus = ko.computed(function () {
            var isActive = this.tagActive();

            _console.log('PlaylistModel.activeStatus()', isActive,
                ko.isObservable(this.parent.current.playlist));

            this.showAssets(isActive);
            if (isActive) return 'activePlaylist';
            return false;
        }, this);

        this.toggleView = function () {
            _console.debug('PlaylistModel.toggleView()');
            _this.showAssets(!_this.showAssets());
        };
    }


    PlaylistModel.prototype = Object.create({
        constructor: PlaylistModel
    }, {
        timestamp: {value: Date.now()}
        , add: _define(add)
        , remove: _define(remove)
        , getAssetIndex: _define(getAssetIndex)
        , getAssetAtIndex: _define(getAssetAtIndex)
        , first: _define(first)
        , last: _define(last)
        , length: {
            get: function () {
                return this._assets.length;
            },
            enumerable: true
        }
        , _assets: {
            get: function () {
                return this.assets();
            }
        }
    });

    return PlaylistModel;

    function add(asset, linkedList) {
        var _this = this;
        asset = new AssetModel(asset, this.playlistid, parseInt(this.length));
        Object.defineProperty(asset, 'playlist_index', {
            get: function () {
                return _this.playlist_index;
            },
            enumerable: true
        });

        if (linkedList) asset = linkedList.add(asset);
        this.assets.push(asset);
    }

    function remove(asset) {
        var index = (asset instanceof AssetModel || asset['data'] instanceof AssetModel) ?
            this.getAssetAtIndex(asset) : asset;
        if (index < this.length) {
            this.assets.splice(index, 1);
        }
    }

    function getAssetIndex(asset) {
        var len = this._assets.length;

        while (len--) {
            if (this._assets[len] === asset) {
                return len;
            }
        }

        return -1;
    }

    function getAssetAtIndex(index) {
        _console.warn('getAssetAtIndex', index, this._assets[index]);
        return this._assets[index] || null;
    }

    function first() {
        this.pointer = 0;
        var asset = this._assets[this.pointer] || null;
        return asset;
    }

    function last() {
        this.pointer = this.length - 1;
        var asset = this._assets[this.pointer] || null;
        return asset;
    }

    function _define(obj) {
        return {
            value: obj,
            enumerable: true
        }
    }
})
;