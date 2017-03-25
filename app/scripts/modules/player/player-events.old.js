/**
 * player file for ndp-video-spa on 16-Mar-16.
 */

define(['knockout', 'jquery'], function (ko, $) {

    var page = $page,
        data = page.data,
        _console = window.$page.console.getInstance('Player Events');

    var SystemEvent = null,
        PlaybackEvent = null,
        AdEvent = null;

    var eventNames = {};


    function PlayerEventsModel(owner) {
        var self = this;
        this.all = ko.observable();
        this.loaded = ko.observable();
        this.start = ko.observable();
        this.progress = ko.observable();
        this.play = ko.observable();
        this.pause = ko.observable();
        this.volume = ko.observable();
        this.completed = ko.observable();

        //listeners
        this.all.subscribe(function (e) {
            if (!e) return;
            //page.log.addPlayerEvent(e);
            this.addEventToStorage(e);
        }, this);
        this.loaded.subscribe(function (e) {
            if (!e) return;
            var _scrub = e.payload.playheadPosition;
            var _volume = e.payload.volume;

            /*if (e.type[0] === "NDP_SystemEvent_PLAYER_LOADED") {
             parent.$ndpViewModel.loadingPlayer(false);
             } else {
             parent.$ndpViewModel.loadingMedia(false);
             parent.$ndpViewModel.showControlRack(true);
             }*/
        });
        this.start.subscribe(function (e) {
            if (!e) return;
            parent.scrollTo(0, 0);
            var _scrub = e.payload.playheadPosition;
            var _volume = e.payload.volume;

            if (!(/AdEvent/).test(e.type[0])) {
                //var assets = parent.$ndpViewModel.assets;
                //assets.updateAsset(e.asset);
            }

            var triggerPlay = self.progress.subscribe(function (e) {
                //owner.isPlaying = true;
                //parent.$ndpViewModel.playingVideo(true);
                //parent.$ndpViewModel.loadingMedia(false);
                triggerPlay.dispose();
            });
        });
        this.progress.subscribe(function (e) {
            if (!e) return;
        });
        this.play.subscribe(function (e) {
            if (!e) return;
        });
        this.pause.subscribe(function (e) {
            if (!e) return;
        });
        this.volume.subscribe(function (e) {
            if (!e) return;
            var _volume = e.payload.volume;

        });
        this.completed.subscribe(function (e) {
            if (!e) return;
            //parent.$ndpViewModel.loadingMedia(true);
            owner.isPlaying = false;
            if (!(/AdEvent/).test(e.type[0])) {
                //parent.$ndpViewModel.playingVideo(false);
                if (data.continuous === 2) {
                    page.getNextAsset();
                }
            }
            //parent.$ndpViewModel.showControlRack(false);
        });
    }

    PlayerEventsModel.prototype = Object.create({
        constructor: PlayerEventsModel
    }, {
        timestamp: {value: Date.now()}
        , init: {value: init}
        , storage: {value: []}
        , addEventToStorage: {value: addEventToStorage}
    });

    return PlayerEventsModel;

    function init(playerFn) {
        SystemEvent = $ndp.events.SystemEvent;
        PlaybackEvent = $ndp.events.PlaybackEvent;
        AdEvent = $ndp.events.AdEvent;

        eventNames.loaded = [SystemEvent.PLAYER_LOADED, PlaybackEvent.LOADED];
        eventNames.start = [PlaybackEvent.START, AdEvent.START];
        eventNames.volume = [PlaybackEvent.VOLUME_CHANGE, AdEvent.VOLUME_CHANGE];
        eventNames.progress = [PlaybackEvent.PROGRESS, AdEvent.PROGRESS];
        eventNames.play = [PlaybackEvent.PLAY, AdEvent.PLAY];
        eventNames.pause = [PlaybackEvent.PAUSE, AdEvent.PAUSE];
        eventNames.completed = [PlaybackEvent.COMPLETE, PlaybackEvent.PLAYLIST_COMPLETE, AdEvent.COMPLETE];

        playerFn.on("*", this.all);

        for (var property in eventNames) {
            var obj = this[property];
            var names = eventNames[property];
            var i = names.length;
            while (i--) {
                playerFn.on(names[i], obj);
            }
        }
    }

    function addEventToStorage(e) {
        var type = e.type[0],
            payload = e.payload || {},
            msg = ['NDP Player Event'];
        var logType = 'log', logCss = '';

        if (typeof type === 'string') {
            if ((/ERROR/).test(type)) {
                logType = 'error';
                msg.push(e.payload.error);
                logCss = 'log-error';
            } else if ((/_PLAY|COMPLETE|START/).test(type)) {
                logType = 'info';
            } else if ((/VOLUMECHANGE|PAUSE/).test(type)) {
                logType = 'debug';
                logCss = 'log-debug';
            } else if ((/PROGRESS/).test(type)) {
                logType = '';
            }

            if (payload['asset'] && payload['asset']['isLiveMedia']) {
                msg.push('This is a live stream');
                logCss = 'log-info ' + logCss;
            }
        }

        if (!!logType) _console[logType](e.type, e);
        var seq = $.extend(true, {}, new SeqEventObj(), {
            evt: e,
            type: type,
            log: {
                type: logType,
                message: msg,
                css: logCss
            }
        });
        this.storage.push(seq);
    }

    function SeqEventObj() {
        this.evt = {};
        this.type = '';
        this.index = 0;
        this.log = new MessageModel();
        this.timestamp = Date.now();
    }

    function MessageModel() {
        this.type = '';
        this.css = '';
        this.message = [];
    }

});