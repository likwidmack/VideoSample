/**
 * get_assets file for ndp-video-spa on 16-Mar-16.
 */


define('assets-get', [
    'jquery',
    'knockout',
    'assets-request'
], function ($, ko, AssetRequestModel) {
    Date = window.Date;
    var page = $page,
        data = page.data,
        utils = page.utils,
        _console = window.$page.console.getInstance('Get Assets');

    var playlistUrl = '/getAssets'; //"/data/nbcnewsPlaylistAPI.json";
    var protocol = location.protocol + '//';

    function AssetUrl(parent) {
        Object.defineProperties(this, {
            parent: {
                get: function () {
                    return parent;
                }
            }
            , currentGetUrls: {
                value: [],
                enumerable: true,
                configurable: true
            }
            , newsAPIUrl: {
                value: protocol + 'data.nbcnews.com/drone/'
            }
            , cachedNewsAPIUrl: {
                value: protocol + 'data.nbcnews.com/drone/api/query/NBCNews/webapp/1.0/playlistbyid'
            }
            , isCached: {
                value: !data.debug,
                writable: true,
                enumerable: true
            }
            , requestTimeout: {
                value: 5000,
                writable: true,
                enumerable: true
            }
        });

        var _pushUrls = (this.currentGetUrls).push;

        function currentGetUrls_push(scope) {
            var _this = this,
                _arguments = Array.prototype.slice.call(arguments, 1);
            var len = _arguments.length;
            while (len--) {
                var model = _arguments[len];
                if (model.response) continue;
                scope.getJSON(model, function (json) {
                    _console.info('Push New JSON', model, scope.currentGetUrls);
                    if (utils.has(model, scope.currentGetUrls)) return;
                    _pushUrls.call(_this, model);

                    setTimeout(function () {
                        //map to ViewModel
                        model.mapPlaylist(scope.parent);
                    }, 0);
                });
            }
            //_pushUrls.apply(this, _arguments);
        }

        (this.currentGetUrls).push = currentGetUrls_push.bind(this.currentGetUrls, this);

    }

    AssetUrl.prototype = Object.create({
        constructor: AssetUrl
    }, {
        timestamp: {value: Date.now()}
        , get: {value: _get}
        , getJSON: {value: getJSON}
        , getDefault: {value: getDefault}
        , withMPXID: {value: withMPXID}
        , withPlaylistID: {value: withPlaylistID}
        , withURL: {value: withURL}
        , withPlatformLink:{value:withPlatformLink}
        , getUrlModel: {value: getUrlModel}
    });

    return AssetUrl;

    function _get(assetsArray) {
        assetsArray = assetsArray || this.parent.dataAssets;
        if (!utils.isArray(assetsArray) || !assetsArray.length) {
            _console.error('NO DATA ASSETS!!', assetsArray);
            return;
        }

        var len = assetsArray.length,
            param = {};
        param.output = data.brand || 'nbcnews';

        while (len--) {
            if (utils.has(assetsArray[len], this.currentGetUrls.map(function (item) {
                    return item.global_object;
                }))) continue;

            var _param = $.extend({}, param),
                asset = assetsArray[len],
                model = new AssetRequestModel(asset, this.isCached, this.requestTimeout);

            model = this.getUrlModel(model, _param);

            if (!model)continue;
            this.currentGetUrls.push(model);
        }

    }

    function getUrlModel(assetReqModel, param) {
        var asset = assetReqModel.global_object;
        if (!(asset.type))return false;
        var _param = $.extend({}, param);

        //Determine asset type
        //map object and req
        //getJSON
        // asset {type, url|mpxid|playlistid input, label}
        assetReqModel.param = _param;

        switch (asset.type) {
            case 'mpxId':
                assetReqModel.url = this.withMPXID(asset.input, _param);
                break;
            case 'playlistId':
                assetReqModel.url = this.withPlaylistID(asset.input, _param);
                break;
            case 'url':
                assetReqModel.url = this.withURL(asset.input, _param);
                break;
            case 'feedUrl':
                assetReqModel.url = this.withPlatformLink(asset.input, _param);
                break;
            default:
                assetReqModel = this.getDefault(_param, assetReqModel);
                break;
        }

        _console.debug('getUrlModel', assetReqModel);
        return assetReqModel;
    }

    function getJSON(model, callback) {
        _console.log('getJSON', arguments);
        //TODO: Send Notification
        $.getJSON(playlistUrl, model.req_data).done(function (json) {
            model.response = json;
            if (callback instanceof Function) callback.apply(this, arguments);
        }).fail(function (jqxhr, textStatus, error) {
            var err = textStatus + ", " + error;
            _console.error("Request Failed: " + err);
            //TODO: Send Notification
        });
    }

    function getDefault(param, model) {
        var id = 'giDDVYo81SY3';
        if (data.live) {
            id = 'nnd_livevideo';
        }

        var _obj = {
            input: id,
            label: (data.brand || 'default') + ' ' + id,
            type: 'playlistid'
        };

        model = model || new AssetRequestModel(_obj, this.isCached, this.requestTimeout);
        model.param = param;
        model.url = this.withPlaylistID(id, param);

        return model;
    }

    function withMPXID(id, param) {
        param.mpxid = id;
        var route = 'getbympxid';
        var baseUrl = this.newsAPIUrl + route + '?';
        return (baseUrl + $.param(param));
    }

    function withPlaylistID(id, param) {
        param.playlistid = id;
        var route = 'getvideoplaylist';
        var baseUrl = this.newsAPIUrl + route + '?';
        if (this.isCached) {
            baseUrl = this.cachedNewsAPIUrl + '?';
        }
        return (baseUrl + $.param(param));
    }

    function withPlatformLink(url, param) {
        param.feedUrl = url;
        var baseUrl = url;
        return baseUrl;
    }

    function withURL(url, param) {
        param.url = url;
        var route = 'getbyurl';
        var baseUrl = this.newsAPIUrl + route + '?';
        return (baseUrl + $.param(param));
    }


});