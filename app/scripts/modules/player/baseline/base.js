/**
 * ui file for ndp-video-spa on 18-Mar-16.
 */

require(['jquery', 'knockout'], function ($, ko) {
    Date = window.Date;
    var ndp = window.$ndp;

// Base media object definition
    var Playlist = ndp.Playlist,
        MediaAsset = ndp.MediaAsset,
        SRTParser = ndp.SRTParser;

    var FWAd = null,
        HLS = null,
        wait = $PAGE_WAIT,
        page = $page,
        data = page.data,
        utils = page.utils,
        _console = page.console.getInstance('Baseline Player'),
        _dataStore = {},
        _EventArray = [];

    var AUTOPLAY = false;

    function BaselinePlayer(dataObj) {
        var _this = this;

        Object.defineProperties(this, {
            locationId: {
                value: null,
                writable: true,
                enumerable: true
            }
            , containerId: {
                get: function () {
                    return 'baseline_' + this.timestamp;
                },
                enumerable: true
            }
            , video: {
                value: document.createElement('video'),
                writable: true,
                enumerable: true
            }
            , isLiveMedia: {
                get: function () {
                    var asset = _dataStore.mediaAsset || {};
                    return !!(asset.isLiveMedia);
                }
            }
            , currentAsset: {
                get: function () {
                    var asset = _dataStore.mediaAsset || {},
                        ifMPX = (asset instanceof $ndp.MPXMediaAsset && !asset.isLiveMedia);
                    if(!(asset.url)) return null;

                    var obj = ifMPX ? asset.getVideoData() : {
                        'url': asset.getURL(),
                        'isLiveMedia': asset.isLiveMedia
                    };
                    return obj || null;
                }
            }
            , nextAsset: {
                value: function (event) {
                    return _this.onEndGoToNextAsset(event);
                }
            }
            , srtResponse: {
                value: function (response) {
                    var captions = SRTParser.parse(response);

                    // Add the VTTCue object to the TextTrack
                    while (captions.length) {
                        //_this.captions.unshift(captions.shift());
                    }
                }
            }
        });

        var container = document.getElementById(this.containerId);

        // If there is no instance of the container already in the DOM, create it
        if (container === null) {
            container = document.createElement("div");
            container.id = this.containerId;
            container.style.height = '100%';
        }

        Object.defineProperties(_dataStore, {
            id: {
                value: _this.containerId,
                enumerable: true
            }
            , container: _defineWrittenValue(container)
            , location: _defineWrittenValue(null)
            , autoPlay: _defineWrittenValue(false)
            , continuousPlay: _defineWrittenValue(false)
            , mediaAsset: _defineWrittenValue(null)
            , playlist: _defineWrittenValue(null)
            , currentGuid: _defineWrittenValue(null)
            , on: {
                value: {},
                enumerable: true
            }
        });

        this.init(dataObj);
    }

    BaselinePlayer.prototype = Object.create({
        constructor: BaselinePlayer
    }, {
        timestamp: {value: Date.now()}
        , init: {value: init}
        , dataStore: {
            get: function () {
                return _dataStore;
            },
            enumerable: true
        }
        , on: _define(on)
        , off: _define(off)
        , mediaAsset: _define(mediaAsset)
        , autoPlay: _define(autoPlay)
        , play: _define(play)
        , pause: {
            value: function () {
                if (this.video)
                    this.video.pause();
            },
            enumerable: true
        }
        , location: _define(location)
        , container: _define(container)
        , onEndGoToNextAsset: {value: onEndGoToNextAsset}
        , setSource: {value: setSource}
        , toggleListeners: {value: toggleListeners}
        , onloadAsset: {value: onloadAsset}
        , eventHandler: {value: eventHandler}
        , initFWAds: {value: initFWAds}
        , initHLS: {value: initHLS}
    });

    window.BaselinePlayer = BaselinePlayer;

    function init(dataObj) {
        this.video.id = this.containerId + '_player';
        this.video.preload = "metadata";
        this.video['x-webkit-airplay'] = 'allow';
        this.video.controls = true;
        this.video.setAttribute("style", "height: 100%; width: 100%");
        _dataStore.container.appendChild(this.video);

        Playlist = ndp.Playlist;
        MediaAsset = ndp.MediaAsset;

        if (!!dataObj) _map.call(this, dataObj);

        var _this = this;
        setTimeout(function(){
            if (data.ads) _this.initFWAds();
            if(!(page.detect && page.detect.HTML5VIDEO.hls.canplay)){
                _console.warn("BROWSER NOT HLS COMPATIBLE.");
                //return;
            }
            if (data.live || data.player == 'hls') _this.initHLS();
        },100);
    }

    function on() {
        _console.warn('Toggle ON Events', arguments, this);
        this.toggleListeners('on', arguments);
    }

    function off() {
        _console.warn('Toggle OFF Events', arguments, this);
        this.toggleListeners('off', arguments);
    }

    function mediaAsset() {
        if (arguments.length) {
            var asset = arguments[0];
            var currentPlaylist = this.dataStore.playlist;
            if (currentPlaylist && currentPlaylist.getAssetIndex(asset) === -1) {
                this.dataStore.playlist = null;
                this.dataStore.continuousPlay = false;
            }

            _console.log('Is Asset an instanceof $ndp.Playlist?', asset instanceof ($ndp.Playlist));
            _console.log('Is current Playlist an instanceof $ndp.Playlist?', currentPlaylist instanceof ($ndp.Playlist));
            if (asset instanceof ($ndp.Playlist)) {
                this.dataStore.continuousPlay = true;
                this.dataStore.playlist = asset;
                asset = asset.first();
            } else if (currentPlaylist instanceof ($ndp.Playlist)) {
                var index = currentPlaylist.getAssetIndex(asset);
                if (!isNaN(index)) currentPlaylist.pointer = index;
            }

            // Load the MediaAsset
            _console.log('Set DataStore Media Asset', asset);
            _dataStore.mediaAsset = asset;
            _dataStore.currentGuid = asset.id;

            this.setSource();
        }
        return this.dataStore.mediaAsset;
    }

    function autoPlay() {
        if (arguments.length) {
            this.dataStore.autoPlay = arguments[0];
            this.video.autoplay = this.dataStore.autoPlay;
        }
        return this.dataStore.autoPlay;
    }

    function play() {
        _console.debug('INIT PLAY METHOD', arguments, this.video);
        var _this = this,
            _vid = this.video,
            __ready = false;
        if (arguments.length && (arguments[0] !== _vid.currentSrc)) {
            var handler = function (e) {
                _vid.removeEventListener('canplay', handler);
                __ready = true;
                if (_this.video._fw_videoAdPlaying || this.isLiveMedia)return;
                _this.video.play();
            };

            AUTOPLAY = true;
            _vid.addEventListener('canplay', handler);
            this.mediaAsset(arguments[0]);
            _console.debug('BEGIN PLAY!!! via eventlistener "canplay"', arguments[0]);
        } else {
            if (!_vid.currentSrc)return;

            this.video.play();
        }
    }

    function location() {
        if (arguments.length) {
            if (typeof arguments[0] === 'string') {
                arguments[0] = element.getElementById(arguments[0]);
            }
            _dataStore.location = arguments[0];

            var parentObj = _dataStore.location;
            if (!parentObj || !utils.isDomElement(parentObj))
                throw new Error('HTML Element location does not exist');

            parentObj.appendChild(_dataStore.container);
            this.locationId = parentObj.id;
        }
        return this.dataStore.location;
    }

    function container() {
        return this.dataStore.container;
    }

    function onEndGoToNextAsset() {
        if (this.video._fw_videoAdPlaying)return;
        if (_dataStore.continuousPlay && _dataStore.playlist) {
            var asset = _dataStore.playlist.next() || _dataStore.playlist.first();
            this.play(asset);
        }
    }

    function setSource() {
        var obj = this.currentAsset;
        this.video.pause();

        if (!obj)return;

        if (HLS && obj.isLiveMedia) {
            HLS.loadAsset(AUTOPLAY);
            AUTOPLAY = false;
        } else {
            if(HLS && data.live){
                HLS.unbindMedia(3);
            }
            this.video.src = obj.url;
            _console.debug('Set Video Source from DataStore Media Asset', obj, this.video.src);
            this.video.load();
        }
    }

    function toggleListeners(method, args) {
        var toggle = method === 'on' ? 'addEventListener' : 'removeEventListener';
        _console.info('Toggle Listeners', toggle, args, this);
        _console.dir(this.video);

        switch (args.length) {
            case 1:
                var eventList = args[0];
                var listener = null;

                for (var eventName in eventList) {
                    listener = eventList[eventName];
                    _setDataStoreEvents(this.video, method, eventName, listener);
                }
                break;

            default:
                _setDataStoreEvents(this.video, method, args[0], args[1]);
                break;
        }
    }

    function onloadAsset() {

    }

    function eventHandler(e) {

    }

    function initFWAds() {
        var _this = this,
            isVideoReady = false,
            onLoadStart = function (e) {
                _this.video.removeEventListener('loadstart', onLoadStart);
                isVideoReady = true;
                _console.info('Video Ready for FREEWHEEL render', isVideoReady);
            };

        wait.on(function () {
            return !!FWAd && isVideoReady;
        }, function () {
            _console.log('Wait Condition Completed :: Freewheel Ads Initialized', Date.now());
            _console.info('RENDER FREEWHEEL', FWAd);
            FWAd.render();
        });

        this.video.addEventListener('loadstart', onLoadStart);
        require(['player-baseline/fw_ads'], function (FWAdapter) {

            if (!FWAdapter) {
                _this.video.removeEventListener('loadstart', onLoadStart);
                _console.warn('FREEWHEEL did NOT initialize', isVideoReady);
                return;
            }
            FWAd = new FWAdapter(_this);
        });

    }

    function initHLS() {
        var _this = this;
        require(['player-baseline/hls'], function (HlsAdp) {
            var isLiveMedia = this.currentAsset && this.currentAsset.isLiveMedia;
            if (!HlsAdp) {
                _console.warn('HLS did NOT initialize', HlsAdp);
                return;
            }

            HLS = new HlsAdp(_this);
            HLS.render(!!isLiveMedia);
        });
    }

    function initPDK(){
        var _this = this;
        require(['player-baseline/pdk'], function (HlsAdp) {
        });
    }

    function _map(dataObj) {
        dataObj = dataObj || {};
        var context = this;

        _console.debug('mapping location to dataStore', [context, dataObj]);
        //Determine if location is Object or not
        if (utils.isDomElement(dataObj)) {
            _console.log('Player Data Object is a Dom Element');
            dataObj = {location: dataObj};
        } else if (typeof dataObj === 'string') {
            _console.log('Player Data Object is a String');
            dataObj = {location: document.getElementById(dataObj)};
        }

        for (var key in dataObj) {
            _console.log('Map key property to DataStore', key);
            if (typeof _dataStore[key] === 'undefined') {
                _console.error('No property match for ' + key);
                continue;
            }
            context[key](dataObj[key]);
        }
    }

    function _setDataStoreEvents(video, method) {
        var args = Array.prototype.slice.call(arguments, 2);
        _console.debug('BaselinePlayer.toggleListeners => _setDataStoreEvents', args);
        if (args[0] === '*') {
            $(video)[method](_EventArray, args[1]);
        } else {
            if (!_dataStore.on[args[0]]) _dataStore.on[args[0]] = [];
            var dsEvent = _dataStore.on[args[0]];
            var _findEvent = -1, i = dsEvent.length;
            while (i--) {
                if (dsEvent[i] === args[1]) {
                    _findEvent = i;
                    break;
                }
            }

            if (method === 'on' && _findEvent === -1) {
                dsEvent.push(args[1]);
            } else if (method === 'off' && _findEvent > -1) {
                dsEvent.splice(_findEvent, 1);
            }
        }
    }


    function _define(obj) {
        return {
            value: obj,
            writable: false,
            enumerable: true
        }
    }

    function _defineWrittenValue(obj) {
        return {
            value: obj,
            writable: true,
            enumerable: true
        }
    }
});