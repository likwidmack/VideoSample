/**
 * asset-model file for ndp-video-spa on 27-Apr-16.
 */

define('assets-asset-model', ['jquery', 'knockout'], function ($, ko) {
    Date = window.Date;
    var wait = window.$PAGE_WAIT,
        _console = window.$page.console.getInstance('Asset Model');


    //TODO
    //Identify Media Type
    //pull thumbnails


    function AssetModel(asset, playlistid, index) {
        this.json = asset;
        this.index = index || 0;

        var data = asset.video || asset.videos || asset.availableAssets,
            self = this;

        this.id = data.guid || null;
        this.mpxid = data.mpxId;
        this.feedUrl = null;
        this.playlistid = playlistid || (data.video_playlists[0]).playlist_id || null;
        this.title = data.title;
        this.description = asset.summary;
        this.canonical = data.canonicalUrl || false;

        this.image = data.thumbnail || false;
        this.thumbnail = _resizeThumbnail(data.thumbnail) || null;
        if (location.protocol == 'https:') {
          this.image = this.image.replace('http','https');
          this.thumbnail = this.thumbnail.replace('http','https');
        }
        this.source = asset.externalSource || null;
        this.islive = (data.videoType === "Non Broadcast Live Video");
        this.hascaption = data.hasCaption || false;

        this.url = null;
        this.caption = false;

        this.format = this.getFormat(data.videoAssets);
        this.type = this.captionType(data);
        this.bitrate = 0;
    }

    AssetModel.prototype = Object.create({
        constructor: AssetModel
    }, {
        timestamp: {value: Date.now()}
        , mapMPXModel: {
            value: mapMPXModel,
            enumerable: true
        }
        , captionType: {
            value: captionType
        }
        , getFormat: {
            value: getFormat
        }
        , resizeThumbnail: {
            value: _resizeThumbnail
        }
        , video: {
            get: function () {
                return this.json.video
                    || this.json.videos
                    || this.json.availableAssets;
            }
        }
    });

    return AssetModel;

    function mapMPXModel(MPXMediaAssetModel) {
        if (!(MPXMediaAssetModel instanceof Function)) return;
        if (this.mpxMediaAsset instanceof MPXMediaAssetModel)
            return this.mpxMediaAsset;

        this.mpxMediaAsset = new MPXMediaAssetModel(this.video);

        var data = {
            url: this.mpxMediaAsset.url
        };
        if (this.mpxMediaAsset.getVideoData instanceof Function) {
            data = this.mpxMediaAsset.getVideoData();
        }
        this.caption = (data.cc || false);
        this.hascaption = !!(this.caption) || this.hascaption;
        this.url = data.url;

        return this.mpxMediaAsset;
    }

    function captionType(asset) {
        var captionType = "none";
        if (asset.captionLinks && asset.captionLinks['web-vtt']) {
            if (asset.captionLinks['web-vtt'].indexOf('snappy') > 0) {
                captionType = "snappy";
            } else {
                captionType = "nbc";
            }
        } else {
            captionType = this.format;
        }
        return captionType;
    }

    function getFormat(rawArray) {
        var once = false,
            lln = false,
            live = false;

        var i = rawArray.length,
            format = null,
            asset = null,
            bitRate = null;

        while (i--) {
            asset = rawArray[i];
            if (!asset) return format;
            bitRate = parseInt(asset.bitRate, 10);

            if (asset.format === "MPEG4") {
                if (bitRate === 0) {
                    once = true;
                } else {
                    lln = 'llnHigh_llnLow';
                }
            } else if (asset.format === "F4M" || asset.format === "M3U") {
                live = 'live';
            }
        }

        if (live) {
            format = live
        } else if (lln) {
            format = 'llnHigh_llnLow'
        } else if (asset.assetType === "FireTV-Once") {
            format = 'fireTV'
        } else {
            format = 'once'
        }

        return format;
    }

    function _resizeThumbnail(src, width) {
        if (!src)return src;
        var tail = src.substr(src.lastIndexOf('.'));
        var url = !width ? '.thumb-m' : '.nbcnews-video-reststate-' + width;
        src = src.replace(tail, url + tail);
        src = src.replace(/\/i\//, "\/j\/");
        return src;
    }

});
