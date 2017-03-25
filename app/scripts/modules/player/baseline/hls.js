/**
 * hls file for ndp-video-spa on 16-Aug-16.
 */

define(function () {
    var page = $page,
        $data = page.data,
        utils = page.utils,
        _console = window.$page.console.getInstance('Native HLS');

    if (!window.Hls) {
        _console.warn('HLS WAS NOT LOADED.');
        return;
    }

    var MEDIA_READY = 0,
        MANIFEST_READY = 0;

    var hls_events = {
        'MEDIA_ATTACHED': Hls.Events.MEDIA_ATTACHED
        , 'MEDIA_ATTACHING': Hls.Events.MEDIA_ATTACHING
        , 'MEDIA_DETACHED': Hls.Events.MEDIA_DETACHED
        , 'MEDIA_DETACHING': Hls.Events.MEDIA_DETACHING
        , 'MANIFEST_LOADED': Hls.Events.MANIFEST_LOADED
        , 'MANIFEST_LOADING': Hls.Events.MANIFEST_LOADING
        , 'MANIFEST_PARSED': Hls.Events.MANIFEST_PARSED
        , 'LEVEL_LOADED': Hls.Events.LEVEL_LOADED
        , 'LEVEL_LOADING': Hls.Events.LEVEL_LOADING
        , 'LEVEL_UPDATED': Hls.Events.LEVEL_UPDATED
        , 'FRAG_LOADED': Hls.Events.FRAG_LOADED
        , 'FRAG_PARSING_METADATA': Hls.Events.FRAG_PARSING_METADATA
        , 'FRAG_BUFFERED': Hls.Events.FRAG_BUFFERED
        , 'DESTROYING': Hls.Events.DESTROYING
        , 'ERROR': Hls.Events.ERROR
    };

    var hls_errors = {
        'MEDIA_ERROR': Hls.ErrorTypes.MEDIA_ERROR
        , 'NETWORK_ERROR': Hls.ErrorTypes.NETWORK_ERROR
        , 'OTHER_ERROR': Hls.ErrorTypes.OTHER_ERROR
    };

    var hls_stage = {
        'FIRST_LOAD': 0
        , 'NEW_ASSET': 1
        , 'RESTART': 2
        , 'STOP': 3
        , 'DESTROY': 4
    };

    var hls_ready = {
        'UNLOADED': 0
        , 'LOADING': 1
        , 'LOADED': 2
    };

    function HlsAdapter(parent) {
        var _this = this;
        this.hls = null;

        Object.defineProperties(this, {
            parent: {
                get: function () {
                    return parent;
                }
            }
            , video: {
                get: function () {
                    return parent.video;
                }
            }
            , assetUrl: {
                get: function () {
                    return (parent.currentAsset
                        && parent.currentAsset.url) || null;
                }
            }
            , eventHandler: {
                value: function (event, data) {
                    //_console.warn('HlsAdapter.eventHandler', event, data);
                    if (event == Hls.Events.ERROR)
                        return _this._errorHandler(event, data);
                    return _this._eventHandler(event, data);
                }
            }
        })

    }

    HlsAdapter.prototype = Object.create({
        constructor: HlsAdapter
    }, {
        timestamp: {value: Date.now()}
        , render: {
            value: render,
            enumerable: true
        }
        , loadAsset: {
            value: loadAsset,
            enumerable: true
        }
        , bindMedia: {value: bindMedia}
        , loadSource: {value: loadSource}
        , unbindMedia: {value: unbindMedia}
        , destroy: {value: destroy}
        , addHandlers: {value: addHandlers}
        , setConfiguration: {value: setConfiguration}
        , _eventHandler: {value: _eventHandler}
        , _errorHandler: {value: _errorHandler}
        , _media_ready: {
            get: function () {
                return MEDIA_READY;
            },
            set: function (value) {
                MEDIA_READY = value;
                _console.info('MEDIA_READY ==> ' + MEDIA_READY, this);
            }
        }
        , _manifest_ready: {
            get: function () {
                return MANIFEST_READY;
            },
            set: function (value) {
                MANIFEST_READY = value;
            }
        }
    });

    return HlsAdapter;

    function render(isLiveMedia) {
        if (!Hls.isSupported()){
            _console.warn('HLS is NOT SUPPORTED!');
            return false;
        }

        this.hls = new Hls(this.setConfiguration());

        this.addHandlers();
        if (isLiveMedia)
            this.bindMedia(hls_stage.FIRST_LOAD);
        return true;
    }

    function bindMedia(stage) {
        var _this = this,
            _handler = function (event, data) {
            _console.log('HLS attachMedia triggered');
                _this.hls.off(hls_events.MEDIA_ATTACHED, _handler);
                if (utils.has(stage, [hls_stage.NEW_ASSET, hls_stage.FIRST_LOAD])) {
                    _this.loadSource(stage);
                }
            };

        this.hls.on(hls_events.MEDIA_ATTACHED, _handler);
        this.hls.attachMedia(this.video);
    }

    function loadSource(stage, autoplay) {
        if (!this.assetUrl) return;

        var _this = this,
            _handler = function (event, data) {
                _this.hls.off(hls_events.MANIFEST_PARSED, _handler);
                _console.info('Video source loaded.', _this.assetUrl);
                if ((stage == hls_stage.NEW_ASSET) || autoplay)_this.video.play();
            };

        //if (this._media_ready != hls_ready.LOADED) {
        //    _console.warn('MEDIA IS NOT ATTACHED!')
        //}
        this.hls.on(hls_events.MANIFEST_PARSED, _handler);
        //http://link.theplatform.com/s/2E2eJC/jck88nXQPK3Z?MBR=TRUE&format=redirect
        //this.hls.loadSource('http://nbcnews-lh.akamaihd.net/i/nbc_live03@111135/master.m3u8');
        this.hls.loadSource(this.assetUrl);
        _console.log('loadSource', this);
    }

    function unbindMedia(stage) {
        var _this = this,
            _handler = function (event, data) {
                _console.log('HLS media detached triggered');
                _this.hls.off(hls_events.MEDIA_DETACHED, _handler);
                if (stage == hls_stage.NEW_ASSET) {
                    _this.bindMedia(stage);
                }
            };
        if (this.hls) {
            this.hls.on(hls_events.MEDIA_DETACHED, _handler);
            this.hls.detachMedia();
            this.video.scr = this.assetUrl;
        }
    }

    function loadAsset(autoplay) {
        this.unbindMedia(hls_stage.NEW_ASSET);
    }

    function destroy() {
        // TODO: unbind and destroy
        this.hls.destroy();
    }

    function addHandlers() {
        for (var prop in hls_events) {
            this.hls.on(hls_events[prop], this.eventHandler);
        }
    }

    function setConfiguration() {
        var config = {debug: !!$data.mode};

        config.autoStartLoad = true;
        config.startPosition = -1;
        config.defaultAudioCodec = undefined;
        config.capLevelToPlayerSize = false;
        config.startFragPrefetch = false;
        config.liveMaxLatencyDurationCount = 10;
        config.liveSyncDurationCount = 3;

        config.maxBufferLength = 30;
        config.maxMaxBufferLength = 600;
        config.maxBufferSize = 60 * 1000 * 1000;
        //'Maximum' inter-fragment buffer hole tolerance that hls.js can cope with when searching for
        // the next fragment to load
        config.maxBufferHole = 0.5;
        config.maxSeekHole = 2; //In case playback is stalled, and a buffered range is available upfront
        config.maxFragLookUpTolerance = 0.2; //used during fragment lookup

        config.seekHoleNudgeDuration = 0.01;
        config.enableSoftwareAES = true;
        config.enableWorker = true;

        /* manifest load settings */
        config.manifestLoadingTimeOut = 20000;
        config.manifestLoadingMaxRetry = 6;
        config.manifestLoadingRetryDelay = 500;

        /* level load settings */
        config.levelLoadingTimeOut = 10000;
        config.levelLoadingMaxRetry = 6;
        config.levelLoadingRetryDelay = 500;

        /* fragment load settings */
        config.fragLoadingTimeOut = 20000;
        config.fragLoadingMaxRetry = 6;
        config.fragLoadingRetryDelay = 500;

        config.appendErrorMaxRetry = 3;

        //Enable CEA 708 Captions
        config.enableCEA708Captions = true;
        config.stretchShortVideoTrack = false;
        config.forceKeyFrameOnDiscontinuity = true;

        return config;
    }

    function _eventHandler(event, data) {
        _console.log('HLS EVENT :: ' + Date.now(), event, data);
    }

    function _errorHandler(event, data) {
        var hlse = Hls.ErrorDetails,
            type = data.type,
            details = data.details,
            fatal = data.fatal; // dataType: Boolean
        _console.error(type, event, data);

        switch (type) {
            case hls_errors.NETWORK_ERROR:
                // Hls.ErrorTypes.NETWORK_ERROR
                // TODO: reload NDP?, log
                this.hls.startLoad();
                break;
            case hls_errors.MEDIA_ERROR:
                // Hls.ErrorTypes.MEDIA_ERROR
                // TODO: Log, recycle Video
                this.hls.recoverMediaError();
                break;
            default:
                // Hls.ErrorTypes.OTHER_ERROR
                // TODO: log and/or destroy
                this.hls.destroy();
                break;
        }

        // TODO: if fatal, send error notification to NDP then log
        if (fatal) {
            /*do something*/
        }

    }

});