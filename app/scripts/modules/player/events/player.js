/**
 * player file for ndp-video-spa on 18-May-16.
 */

define('player-event', ['knockout', 'jquery'], function (ko, $) {

    var page = $page,
        data = page.data,
        _console = window.$page.console.getInstance('Player Events'),
        EventObserver = window.$GLOBAL_FUNCTIONS.AbstractEventObserver,
        EventQueue = window.$GLOBAL_FUNCTIONS.AbstractEventQueue;

    var eventNames = ['all', 'loaded', 'start', 'progress', 'play', 'pause', 'seek', 'volume', 'completed', 'error'];
    var controlRackEvents = ['loaded', 'start', 'progress', 'play', 'pause', 'seek', 'volume'];


    function PlayerEventsModel(parent) {
        EventObserver.call(this);
        _console.debug('begin', arguments);
        var _this = this;

        this.display = ko.observableArray([]);

        var retEventArr = [],
            len = eventNames.length;
        while (len--) {
            var eventName = eventNames[len];
            _defineEvent(eventName, retEventArr, this);
        }

        _console.debug('return Events Queue Array', retEventArr);
        Object.defineProperty(this, 'queue', {
            value: new EventQueue(retEventArr)
        });
        Object.defineProperty(this, 'parent', {
            get: function () {
                return parent;
            }
        });

        //listeners
        this.all.subscribe(function (e) {
            //_console.log('events ALL', e);
            if (!e) return;
            this.notify({
                event: e,
                type: 'all'
            });
            //this.addEventToStorage(e);
            var _log = e.log;
            if (_log && !!_log.type) {
                (_console[_log.type])(e.type, _log.message.join(' :: '));
            }
        }, this);
        this.loaded.subscribe(function (e) {
            if (!e) return;
            this.notify({
                event: e,
                type: 'loaded'
            });
            this.addToDisplay(e);
        }, this);
        this.start.subscribe(function (e) {
            if (!e) return;
            this.notify({
                event: e,
                type: 'start'
            });
            window.scrollTo(0, 0);
            this.parent.parent.isPlaying(true);
            $('#playerOne').removeClass('moveBack');
            this.addToDisplay(e);
        }, this);
        this.progress.subscribe(function (e) {
            if (!e) return;
            this.notify({
                event: e,
                type: 'progress'
            });
            this.addToDisplay(e);
        }, this);
        this.play.subscribe(function (e) {
            if (!e) return;
            this.notify({
                event: e,
                type: 'play'
            });
            this.addToDisplay(e);
        }, this);
        this.pause.subscribe(function (e) {
            if (!e) return;
            this.notify({
                event: e,
                type: 'pause'
            });
            this.parent.parent.isPlaying(false);
            this.addToDisplay(e);
        }, this);
        this.seek.subscribe(function (e) {
            if (!e) return;
            this.notify({
                event: e,
                type: 'seek'
            });
            this.addToDisplay(e);
        }, this);
        this.volume.subscribe(function (e) {
            if (!e) return;
            this.notify({
                event: e,
                type: 'volume'
            });
            this.addToDisplay(e);
        }, this);
        this.completed.subscribe(function (e) {
            if (!e) return;
            this.notify({
                event: e,
                type: 'completed'
            });
            this.addToDisplay(e);
            var _type = e.type;
            if (_type instanceof Array) _type = _type[0];

            _console.debug('completed', 'is Ad', (/AdEvent/).test(_type) || e.isAd);
            if ((/AdEvent/).test(_type) || e.isAd) return;

            //parent.$ndpViewModel.playingVideo(false);
            if (data.continuous) {
                page.getNextAsset();
                //this.parent.play();
            } else {
                $('#playerOne').addClass('moveBack');
                this.parent.parent.isPlaying(false);
            }
        }, this);
        this.error.subscribe(function (e) {
            if (!e) return;
            this.notify({
                event: e,
                type: 'error'
            });
            this.addToDisplay(e);

            /*
             TODO: NDP Fix
             WARNING NDPPLAYER ISSUE: Temporary fix for NDP AD Block Error,
             media content does NOT play after error thrown
             */
            var _type = e.type;
            if (_type instanceof Array) _type = _type[0];
            if ((/AdEvent/).test(_type)) {
                this.parent.play();
            }
        }, this);
    }

    PlayerEventsModel.prototype = Object.create(EventObserver.prototype, {
        timestamp: {value: Date.now()}
        , init: {value: init}
        , destroy: {value: destroy}
        , addToDisplay: {value: addToDisplay}
        , controlRackHandler: {value: controlRackHandler}
        , models: {
            value: {},
            writable: true,
            configurable: true
        }
    });

    return PlayerEventsModel;

    function init(playerFn) {
        var _this = this;
        _console.debug('init', arguments);

        //add controlRackEvents for queueing
        this.addListener(controlRackEvents, this.controlRackHandler, this);

        var scriptsArray = [];

        scriptsArray.push('player-ndp-event', 'player-native-event');
        if (page.data.player === 'pdk') {
            scriptsArray.push('player-pdk-event');
        }

        // TODO: Map eventlisteners to viewmodel player (eventNames)
        require(scriptsArray, function (NDPEventsModel, NativeEventsModel, PDKEventsModel) {
            _console.debug('STARTING OBJECT ORIENTED EVENT LISTENING', arguments);
            var propertiesObject = {};

            if (typeof $ndp !== 'undefined' && playerFn instanceof NDPPlayer) {
                propertiesObject.ndp = {
                    value: new NDPEventsModel(playerFn, _this)
                    , configurable: true
                };
            }

            if (page.data.player !== 'pdk' || $(playerFn.container()).has('video').length) {
                var videoElement = $('video', playerFn.container())[0];
                propertiesObject.native = {
                    value: new NativeEventsModel(videoElement, _this)
                    , configurable: true
                };
            }

            if (!!PDKEventsModel && page.data.player === 'pdk') {
                propertiesObject.pdk = {
                    value: new PDKEventsModel(_this)
                    , configurable: true
                };
            }

            Object.defineProperties(_this.models, propertiesObject);

        }, function () {
            _console.error('ERROR Retrieving Event Models', arguments);
        });

        //this.display.extend({rateLimit:50});
        this.display.subscribe(function (list) {
            this.parent.display(list);
        }, this.parent);

    }

    function destroy() {
        this.removeListener(controlRackEvents, this.controlRackHandler, this);
    }

    function addToDisplay(event) {
        var utils = page.utils,
            time = utils.getTimeString(event.timestamp);
        this.display.remove(undefined);

        var obj = {
            type: event.type,
            display: event.type + ' ' + time,
            log: event.log
        };

        var last = this.display.shift();
        if (!!last && last.type === event.type) {
            this.display.unshift(obj);
        } else {
            this.display.unshift(obj, last);
        }

        if (this.display().length > 15) {
            var removed = this.display.pop();
        }
    }

    function controlRackHandler(e) {
        var controlRack = this.parent.controlrack();
        if (!controlRack) return;
        controlRack.eventHandler(e.type, e.event);
    }

    function _defineEvent(eventName, retEventArr, owner) {
        Object.defineProperty(owner, eventName, {
            value: ko.observable(),
            enumerable: true,
            configurable: true
        });
        retEventArr.push({
            type: eventName,
            handler: owner[eventName]
        });
    }

    function _mapModelEvents(events, eventObject) {
        for (var property in events) {
            var obj = this[property],
                names = events[property],
                i = names.length;
            while (i--) {
                eventObject.on(names[i], obj);
            }
        }
    }

});