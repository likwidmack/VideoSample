/**
 * fw_ads file for ndp-video-spa on 18-Mar-16.
 */

define(['jquery', location.protocol + '//adm.fwmrm.net/p/nbcnews_live/AdManager.js'], function ($) {
    var FW = window.tv && window.tv.freewheel && window.tv.freewheel.SDK;
    var siteData = window.Tdy.NDPSiteData.siteData;
    if (!FW) return false;

    var page = $page,
        data = page.data,
        utils = page.utils,
        _console = window.$page.console.getInstance('Freewheel Ads');

    window.$FWADS_VERSION = FW.version;
    FW.setLogLevel(data.debug ? FW.LOG_LEVEL_DEBUG : FW.LOG_LEVEL_QUIET);
    var videoEventArray = ['emptied', 'loadstart', 'canplaythrough', 'play', 'pause', 'ended', 'abort'];

    // Details the default FW configuration settings
    var fwConfig = {
            network: 169843,
            url: "http://29773.v.fwmrm.net/ad/p/1",
            siteSection: "TODAY_fallback_site_section",
            siteSectionFallbackID: 884196,
            videoAssetFallbackID: 90320017,
            adManagerUrl: "http://media1.s-nbcnews.com/i/videoassets/pdk/vendor/AdManager-6.5.0.r1.{ext}",
            playerProfile: "nbcnews_{runtime}_live",
            //timeout counter should defaults to 7000 milliseconds
            requestTimeout: 7000
        },
        VIDEO_DURATION_DEFAULT = 500; // duration default

    //Parameters for FreeWheel JSAM (JavaScript AdManager)
    var theNetworkId = fwConfig.network, //96749;
        theServerURL = fwConfig.url, //"http://demo.v.fwmrm.net/ad/g/1";
        fallbackID = fwConfig.videoAssetFallbackID,
        theProfileId = fwConfig.playerProfile.replace("{runtime}", "html5"), //"global-js";
        theVideoAssetId = "DemoVideoGroup.01", //"DemoVideoGroup.01";
        theSiteSectionId = fwConfig.siteSection, //"DemoSiteGroup.01";
        theVideoDuration = VIDEO_DURATION_DEFAULT; //500;

    var theAdManager;
    var adDataRequested = false;
    var adDataReceived = false;
    var currentPlayingSlotType = null;
    var _currentAdState = null;


    theAdManager = new FW.AdManager();
    theAdManager.setNetwork(theNetworkId);
    theAdManager.setServer(theServerURL);


    function NativeFreewheel(parent) {
        this.adContext = null;

        this.container = null;
        this.captions = [];
        this.currentAd = null;
        this.positions = null;

        Object.defineProperties(this, _definePropertyValues(parent, this));

    }

    NativeFreewheel.prototype = Object.create({
        constructor: NativeFreewheel
    }, {
        timestamp: {value: Date.now()}
        , render: _define(render)
        , createAdContext: _define(createAdContext)
        , transitionReady: _define(transitionReady)
        , restartContent: _define(restartContent)
        , playVideoAsset: _define(playVideoAsset)
        , completeAdContext: _define(completeAdContext)
        , handleLoad: _define(handleLoad)
        , handleEvent: _define(handleEvent)
        , handleEnter: _define(handleEnter)
        , handleExit: _define(handleExit)
        , addKeyValues: _define(addKeyValues)
        , getAdConfiguration: _define(getAdConfiguration)
        , addAdHandlers: _define(addAdHandlers)
        , removeAdHandlers: _define(removeAdHandlers)
        , onSlotEnded: _define(onSlotEnded)
        , setAdTimeout: _define(setAdTimeout)
        , triggerNoAdsEvent: _define(triggerNoAdsEvent)
        , onAdEvent: _define(onAdEvent)
        , destroyAdContext: _define(destroyAdContext)
    });

    return NativeFreewheel;

    function render() {
        this.videoElement.addEventListener('error', this.videoEventHandler);
        this.videoElement.addEventListener('emptied', this.onEnterHandler);
        _console.log('[NativeFreewheel.render]', 'Rendering Video Element for Freewheel');
        this.handleEnter();
    }

    function createAdContext() {
        _console.log("init");
        var config = this.getAdConfiguration();

        if (this.adContext && this.adContext.previousSlot) {
            _console.warn('*** NativeFreewheel.createAdContext ***', 'AdManager Context: Clear Slots');
            this.adContext.previousSlot.stop();
            this.adContext.dispose();
        }

        adDataRequested = false;
        currentPlayingSlotType = null;

        this.adContext = theAdManager.newContext();
        this.adContext.registerVideoDisplayBase(this.containerId);
        this.adContext.setProfile(config.profileId);
        this.adContext.setVideoAsset(
            config.assetId,
            config.duration,
            config.networkId,
            null,
            null,
            null,
            null,
            config.fallbackId
        );
        this.adContext.setSiteSection(
            config.siteSectionId,
            config.networkId,
            null,
            null,
            config.siteSectionFallbackId
        );

        //Add key-values for ad targeting.
        this.addKeyValues(siteData);
        //this.adContext.addKeyValue("module", "DemoPlayer");
        //this.adContext.addKeyValue("feature", "trackingURLs");
        //this.adContext.addKeyValue("feature", "simpleAds");

        //Listen to AdManager Events
        this.adContext.addEventListener(FW.EVENT_REQUEST_COMPLETE, this.onRequestCompleteHandler);
        this.adContext.addEventListener(FW.EVENT_AD, this.onAdHandler);

        //To make sure video ad playback in poor network condition, set video ad timeout parameters.
        this.adContext.setParameter(FW.PARAMETER_RENDERER_VIDEO_START_DETECT_TIMEOUT, 10000, FW.PARAMETER_LEVEL_GLOBAL);
        this.adContext.setParameter(FW.PARAMETER_RENDERER_VIDEO_PROGRESS_DETECT_TIMEOUT, 10000, FW.PARAMETER_LEVEL_GLOBAL);
        this.adContext.setParameter(FW.PARAMETER_RENDERER_VIDEO_DISPLAY_CONTROLS_WHEN_PAUSE, !data.controlrack, FW.PARAMETER_LEVEL_GLOBAL);

        //Add 1 preroll, 1 midroll, 2 overlay, 1 postroll slot
        this.adContext.addTemporalSlot("Preroll_1", FW.ADUNIT_PREROLL, 0);
        //this.adContext.addTemporalSlot("Midroll_1", FW.ADUNIT_MIDROLL, 25);
        //this.adContext.addTemporalSlot("Overlay_1", FW.ADUNIT_OVERLAY, 3);
        //this.adContext.addTemporalSlot("Overlay_2", FW.ADUNIT_OVERLAY, 13);
        //this.adContext.addTemporalSlot("Postroll_1", FW.ADUNIT_POSTROLL, 60);
    }

    function transitionReady(event) {
        this.positions = {
            pre: [],
            mid: [],
            post: [],
            overlay: []
        };
        var slot,
            total;

        if (event.success) {
            var slots = this.adContext.getTemporalSlots();
            total = slots.length;
            _console.info('NativeFreewheel.transitionReady',
                this.adContext.getSlotsByTimePositionClass(FW.TIME_POSITION_CLASS_PREROLL),
                event);

            if (!total) _console.warn('No Temporal Ad Slots Found');

            while (total--) {
                slot = slots[total];
                switch (slot.getTimePositionClass()) {
                    case FW.TIME_POSITION_CLASS_PREROLL:
                        this.positions.pre.push(slot);
                        break;
                    case FW.TIME_POSITION_CLASS_MIDROLL:
                        this.positions.mid.push(slot);
                        break;
                    case FW.TIME_POSITION_CLASS_OVERLAY:
                        this.positions.overlay.push(slot);
                        break;
                    case FW.TIME_POSITION_CLASS_POSTROLL:
                        this.positions.post.push(slot);
                        break;
                }

                this.positions.pre = this.adContext.getSlotsByTimePositionClass(FW.TIME_POSITION_CLASS_PREROLL) || [];

                if (this.positions.pre.length > 0) {
                    this.adContext.previousSlot = this.positions.pre[0];
                }
            }

            this.handleLoad();
        } else {
            _console.error('TIME_POSITION_CLASS_PREROLL has FAILED');
            this.handleExit();
        }
    }

    function restartContent() {
        _console.info('*** NativeFreewheel.restartContent ***');
        var scope = this;
        //TODO: start observing player
        var vidLen = videoEventArray.length;
        while (vidLen--) {
            this.videoElement.removeEventListener(videoEventArray[vidLen], this.videoEventHandler);
        }

        var len = this.captions.length;
        while (len--) {
            this.videoElement.textTracks[0].addCue(this.captions.shift());
        }

        setTimeout(function () {
            scope.playVideoAsset();
        }, 1);
    }

    function playVideoAsset() {
        _console.info('*** NativeFreewheel.playVideoAsset ***');
        var _this = this;
        var _playingHandler = function OnPlayingHandler() {
            _this.videoElement.removeEventListener('playing', _playingHandler);
            _this.videoElement.addEventListener('ended', _this.completedHandler);
            _this.videoElement.addEventListener('emptied', _this.completedHandler);
        };
        if (this.videoElement && this.videoElement.src) {
            this.videoElement.play();
            this.videoElement.controls = true;
            this.videoElement.addEventListener('playing', _playingHandler);
        }
    }

    function completeAdContext() {
        _console.info('*** NativeFreewheel.completeAdContext ***');
        // Notify FW that main content has ended  with ct=x?init=0 where x is less than previous call
        // FW will stop sending pings to fwmrm.net
        if (this.videoElement) {
            this.videoElement.addEventListener('emptied', this.onEnterHandler);

            this.videoElement.removeEventListener('ended', this.completedHandler);
            this.videoElement.removeEventListener('emptied', this.completedHandler);
        }
        if (this.adContext) {
            this.adContext.setVideoState(FW.VIDEO_STATE_STOPPED);
            this.adContext.setVideoState(FW.VIDEO_STATE_COMPLETED);
            this.destroyAdContext();
        }
    }

    function handleLoad() {
        var positions = this.positions;
        adDataReceived = true;

        _console.info('*** NativeFreewheel.handleLoad ***', positions);

        if (positions.pre.length) {
            this.currentAd = this.positions.pre.shift();
        } else {
            this.currentAd = null;
            this.adContext.setVideoState(FW.VIDEO_STATE_PAUSED);
            this.positions = positions || null;
            this.handleExit();
            return;
        }

        //TODO: Add events here

        this.videoElement.addEventListener('error', this.onVideoError);

        var len = videoEventArray.length;
        while (len--) {
            this.videoElement.addEventListener(videoEventArray[len], this.videoEventHandler);
        }

        if (this.videoElement.readyState > 2) {
            _console.log('*** NativeFreewheel.__handleLoad ***', 'Push Ad to Play');
            this.currentAd.play();
        }
    }

    function handleEvent(e) {
        var _type = e.type;
        _console.debug('[VIDEO ELEMENT EVENT]', _type, this.assetURL);
        switch (_type) {
            case 'emptied':
                break;
            case 'loadstart':
                break;
            case 'canplaythrough':
                break;
            case 'play':
                _console.debug('[VIDEO ELEMENT EVENT]', this.positions, this.currentAd);
                this.videoElement.removeEventListener('play', this.videoEventHandler);
                if (this.currentAd) this.currentAd.play();
                break;
            case 'pause':
                break;
            case 'ended':
                break;
            case 'abort':
            case 'error':
                _console.error('ABORT || ERROR', ':: MEDIA_ERROR :: Media ended unexpectedly', e);
                break;
                if (this.currentAd) {
                    this.currentAd.stop();
                }
                if (this.videoElement.src !== this.assetURL) {
                    this.adContext.setVideoState(FW.VIDEO_STATE_PAUSED);
                    this.videoElement.src = this.assetURL;
                }
                this.handleExit();
                break;

        }
    }

    function handleEnter() {
        _console.info('NativeFreewheelAdapter.handleEnter', this.parent.dataStore);

        this.videoElement.removeEventListener('emptied', this.onEnterHandler);

        adDataReceived = false;
        this.createAdContext();

        if (this.videoElement.textTracks.length > 0) {
            var captions = this.videoElement.textTracks[0].cues;

            if (captions) {
                var len = captions.length;
                while (len--) {
                    this.captions.unshift(captions[len]);
                    this.videoElement.textTracks[0].removeCue(captions[len]);
                }
            }
        }

        _console.log('adContext submitRequest');
        var scope = this;
        setTimeout(function () {
            scope.addAdHandlers();
            //scope.setAdTimeout();
            scope.adContext.submitRequest((fwConfig.requestTimeout / 1000) + 2);
            adDataRequested = true;
        }, 1);
    }

    function handleExit() {
        //if (this.currentState === this.lockedState) return;
        _console.debug('NativeFreewheelAdapter.handleExit', this.assetURL, this.adContext);

        this.trackElement = null;

        this.adContext.removeEventListener(FW.EVENT_REQUEST_COMPLETE, this.onRequestCompleteHandler);
        this.videoElement.removeEventListener('error', this.onVideoError);
        this.previousState = this.currentState;
        this.currentState = this.lockedState;
        adDataRequested = false;
        adDataReceived = false;

        if (this.adContext) {
            // Notify FW that main content has started
            // FW will start sending pings to fwmrm.net beginning with ct=0?init=1&s=b156
            _console.warn('NativeFreewheelAdapter.__handleLock',
                'Remove Handlers from Pre-Existing adContext.', this.assetURL);
            this.adContext.setVideoState(FW.VIDEO_STATE_PLAYING);
            this.removeAdHandlers();

            // To handle 'abort' and 'click' events to new asset
            var _currentAdState = this.currentAdState();
            if (_currentAdState && _currentAdState !== 'complete'
                && _currentAdState !== 'adEnd') {
                if (this.currentAd) {
                    this.currentAd.stop();
                }
                if (this.videoElement.src !== this.assetURL) {
                    this.adContext.setVideoState(FW.VIDEO_STATE_PAUSED);
                    this.videoElement.src = this.assetURL;
                }
                this.videoElement.controls = true;
                //this.__completeAdContext();
                _console.warn('NativeFreewheelAdapter.__handleExit',
                    'Exiting without Ad Completion:', _currentAdState);
            }
        }

        //this.__startObserving();
        this.restartContent();
    }

    /*
     * Adds keyValues to Freewheel call from siteData that originates in MPS
     * This includes Krux data
     * @param {type} obj of site key values
     * @returns none
     */
    function addKeyValues(keyValues) {
        if (!keyValues) return;

        var key, value, krux;
        for (key in keyValues) {
            value = keyValues[key];
            if (typeof value === 'string') {
                this.adContext.addKeyValue(key, value);
            } else {
                if (key === "kxsegs") {
                    for (krux in value) {
                        this.adContext.addKeyValue("ksg", value[krux].ksg);
                    }
                }
            }
        }
    }

    function getAdConfiguration() {
        var config = {
            adManager: theAdManager,
            profileId: theProfileId,
            assetId: theVideoAssetId,
            duration: theVideoDuration,
            fallbackId: fallbackID,
            networkId: theNetworkId,
            siteSectionId: theSiteSectionId,
            siteSectionFallbackId: fwConfig.siteSectionFallbackID
        };

        if (siteData) {
            config.siteData = siteData;
            config.siteSectionId = siteData.siteSection;
        } else {
            config.siteData = {};
        }
        if (this.dataStore.mediaAsset && this.dataStore.mediaAsset.raw
            && this.dataStore.mediaAsset.raw.duration
            && !this.dataStore.mediaAsset.isLiveMedia) {
            config.duration = this.dataStore.mediaAsset.raw.duration;
        }
        if (this.dataStore && this.dataStore.currentGuid) {
            config.assetId = this.dataStore.currentGuid; // theVideoAssetId;
        }

        return config;
    }

    function addAdHandlers() {
        _console.info('*** NativeFreewheel.addAdHandlers ***');
        this.adContext.addEventListener(FW.EVENT_AD_CLICK, this.onAdClickedHandler);
        this.adContext.addEventListener(FW.EVENT_SLOT_ENDED, this.onSlotEnded);
    }

    function removeAdHandlers() {
        _console.info('*** NativeFreewheel.__removeAdHandlers ***');
        this.adContext.removeEventListener(FW.EVENT_AD_CLICK, this.onAdClickedHandler);
        this.adContext.removeEventListener(FW.EVENT_SLOT_ENDED, this.onSlotEnded);
        this.adContext.removeEventListener(FW.EVENT_AD, this.onAdHandler);
    }

    function onSlotEnded(event) {
        var slotTimePositionClass = event.slot.getTimePositionClass();

        _console.info('*** NativeFreewheel.__onSlotEnded ***', this.currentAdState(),
            event, (slotTimePositionClass === FW.TIME_POSITION_CLASS_PREROLL));
        this.adContext.setVideoState(FW.VIDEO_STATE_PAUSED);
        if (slotTimePositionClass === FW.TIME_POSITION_CLASS_PREROLL) {
            if (this.positions.pre.length) {
                this.currentAd = this.positions.pre.shift();
                this.currentAd.play();
            } else {
                this.handleExit();
            }
        }
    }

    function setAdTimeout() {
        var currentAdStateFunc = this.currentAdState,
            delay = (parseInt(fwConfig.requestTimeout) || 5) * 1000,
            timeoutString = 'ad_timeout_' + delay,
            callback = (function (scope) {
                return function () {
                    _console.warn('[TIMEOUT_CALLBACK]',
                        'adDataReceived:' + adDataReceived,
                        'currentAd', scope.currentAd);

                    if (!adDataReceived || !scope.currentAd) {
                        scope.triggerNoAdsEvent('[TIMEOUT_ERROR]');
                        currentAdStateFunc(null);
                    }
                }
            })(this);

        if (!(currentAdStateFunc())) currentAdStateFunc(timeoutString);
        setTimeout(callback, delay);
    }

    function triggerNoAdsEvent(errorEvent, description) {
        var _currentAdState = this.currentAdState(),
            adsObj = {
                state: _currentAdState,
                positions: utils.cloneObjToJson(this.slotPositions),
                context: utils.cloneObjToJson(this.adContext)
            };

        var _adEvent = {
            error: errorEvent,
            description: description || '',
            fw_ads: adsObj
        };
        _console.error(_adEvent);

        if (errorEvent === '[TIMEOUT_ERROR]' && !fwConfig.requestTimeout) return;

        this.handleExit();
    }

    function onAdEvent(event) {
        var adInstance = event.adInstance;
        var slot = event.slot;
        _console.debug('NativeFreewheelAdapter.__onAdEvent', event.subType, (slot === this.currentAd));
        switch (event.subType) {
            case FW.EVENT_AD_IMPRESSION:
            case FW.EVENT_AD_IMPRESSION_END:
                if (slot === this.currentAd) this.currentAdState(event.subType);
                _console.debug("[EVENT_AD]: " + event.subType + " with ad:" + adInstance.getAdId()
                    + " and slot:" + slot.getCustomId());
                break;
            case FW.EVENT_AD_FIRST_QUARTILE:
            case FW.EVENT_AD_MIDPOINT:
            case FW.EVENT_AD_THIRD_QUARTILE:
            case FW.EVENT_AD_COMPLETE:
                if (slot === this.currentAd) this.currentAdState(event.subType);
                _console.info("[EVENT_AD]: " + event.subType + " with ad:" + adInstance.getAdId()
                    + " and slot:" + slot.getCustomId());
                break;
            case FW.EVENT_AD_EXPAND:
            case FW.EVENT_AD_COLLAPSE:
            case FW.EVENT_AD_CLOSE:
            case FW.EVENT_AD_MINIMIZE:
                _console.warn("[EVENT_AD]: " + event.subType + " with ad:" + adInstance.getAdId()
                    + " and slot:" + slot.getCustomId());
                break;
            case FW.EVENT_RESELLER_NO_AD:
            case FW.EVENT_ERROR:
                if (slot === this.currentAd) this.currentAdState(event.subType);
                var _type = (event.subType === FW.EVENT_ERROR) ? '[EVENT_ERROR]' : '[EVENT_RESELLER_NO_AD]';
                var details = "[EVENT_AD]" + _type + ": " + event.subType + " with ad:" + adInstance.getAdId()
                    + " and slot:" + slot.getCustomId();
                //this.triggerNoAdsEvent(_type, details);
                break;
            default:
                _console.log("[EVENT_AD]: " + event.subType + " with ad:" + adInstance.getAdId()
                    + " and slot:" + slot.getCustomId());
                break;
        }
    }

    function destroyAdContext() {
        this.removeAdHandlers();
        this.positions = null;
        adDataRequested = false;
        if (this.adContext) {
            this.adContext.dispose();
            this.adContext = null;
        }
    }

    function _define(obj) {
        return {
            value: obj,
            enumerable: true
        };
    }

    function _definePropertyValues(parent, _this) {
        return {
            videoElement: {
                get: function () {
                    return parent.video;
                }
            }

            , assetURL: {
                get: function () {
                    return parent.currentAsset && parent.currentAsset.url;
                }
            }

            , containerId: {
                get: function () {
                    var _jqParent = $(parent.video).parent();
                    _this.container = (_jqParent).get(0);
                    return _this.container.id || '';
                }
            }

            , dataStore: {
                get: function () {
                    return parent.dataStore;
                }
            }

            , parent: {
                get: function () {
                    return parent;
                }
            }

            , onRequestCompleteHandler: _define(function (event) {
                _console.info('NativeFreewheel.onRequestCompleteHandler', event);
                _this.transitionReady(event);
            })

            , onAdClickedHandler: _define(function () {
                _console.info('NativeFreewheel.onAdClickedHandler');
            })

            , videoEventHandler: _define(function (e) {
                _this.handleEvent(e);
            })

            , onVideoError: _define(function (e) {
                _this.handleEvent(e);
            })

            , onAdHandler: _define(function (e) {
                _console.info('NativeFreewheel.onAdHandler');
                _this.onAdEvent(e);
            })

            , onSlotEnded: _define(function (e) {
                _this.onSlotEnded(e);
            })

            , completedHandler: _define(function () {
                _this.videoElement.removeEventListener('ended', _this.completedHandler);
                _this.videoElement.removeEventListener('emptied', _this.completedHandler);
                _console.debug('Freewheel Completed EventListener [VIDEO_STATE_STOPPED]', _this.adContext);

                _this.completeAdContext();
            })

            , onEnterHandler: _define(function (e) {
                _this.handleEnter();
            })

            , currentAdState: _define(function () {
                if (arguments.length) {
                    _console.log('[CURRENT AD STATE] Updated', arguments[0]);
                    _currentAdState = arguments[0];
                }
                return _currentAdState;
            })
        }
    }

});