/**
 * request-model file for ndp-video-spa on 03-May-16.
 */

define('assets-request', ['assets-playlist'], function (PlaylistModel) {
    var page = $page,
        utils = page.utils,
        _console = window.$page.console.getInstance('Asset Request Model');

    function AssetRequestModel(obj, cache, timeout) {
        Object.defineProperties(this, {
            url: {
                get: function () {
                    return this.req_data.url;
                },
                set: function (newUrl) {
                    this.req_data.url = newUrl;
                },
                enumerable: true
            }
            , global_object: {
                get: function () {
                    return obj;
                }
            }
        });
        // url || mpxId || playlistId
        this.type = obj.type || 'playlistId';
        this.label = obj.label || false;
        this.param = false;
        this.json = false;
        this.req_data = {
            _: window.Date.now(),
            url: obj.input || false,
            cache: cache || false,
            timeout: timeout || 0
        };
    }

    AssetRequestModel.prototype = Object.create({
            constructor: AssetRequestModel
        },
        {
            timestamp: {value: window.Date.now()}
            , mapPlaylist: {value: mapPlaylist}
        });

    return AssetRequestModel;


    function mapPlaylist(parent) {
        var model = this;
        var assetArray = [];
        var jsonModel = model.response && model.response.json || {};
        if (jsonModel.results) {
            assetArray = jsonModel.results;
        }
        var id = model.param.playlistid || utils.uniqueID('playlist_');
        var playlist = new PlaylistModel(id, model.label || id, model.url, parent);
        playlist.raw = jsonModel;

        Object.defineProperty(playlist, 'parameter_model', {
            get: function () {
                return model.global_object;
            }
        });

        _console.debug('Map Playlist', model, playlist);

        var i = assetArray.length;
        while (i--) {
            //id = id + '_' + (i + 1);
            playlist.add(assetArray[i], parent.linkedList);
        }

        page.assets().playlists.unshift(playlist);
    }
});