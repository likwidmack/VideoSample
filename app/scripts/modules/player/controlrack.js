/**
 * controlrack file for ndp-video-spa on 18-Mar-16.
 */

define(['knockout', 'jquery'], function (ko, $) {
    var page = $page,
        utils = page.utils,
        data = page.data,
        _console = window.$page.console.getInstance('Player Control Rack');

    function ControlRackModel(parent) {
        this.isLive = ko.observable(false);

        this.volume = ko.observable(0);
        this.setVolume = ko.observable();
        this.setVolume.subscribe(function (num) {
            if (isNaN(+num)) return;
            var player = this.parent.player;

            if (+num === player.volume())return;
            player.volume((+num) / 100);
        }, this);

        this.duration = ko.observable(0);
        this.timePosition = ko.observable(0);
        this.scrub = ko.observable();
        this.scrub.subscribe(function (num) {
            if (isNaN(+num)) return;
            var pct = ((+num) / 100).toFixed(2);
            this.parent.player.scrub(pct);
        }, this);

        this.captions = ko.observable(false);
        this.captions.subscribe(function (_bool) {
            this.parent.player.caption(_bool);
        }, this);

        Object.defineProperties(this, {
            parent: {
                get: function () {
                    return parent
                }
            }
        });

        this.displayTogglePlay = ko.observable('Play');
        this.displayTogglePlay.subscribe(function (_string) {
            $('#btnPlayPauseToggleControl').toggleClass('notify', (_string === 'Pause'));
        }, this);

        this.displayDuration = ko.computed(displayDuration, this);
        this.displayTimeCount = ko.computed(displayTimeCount, this);
        this.displayPositionPercent = ko.computed(displayPositionPercent, this);
        this.displayCurrentVolume = ko.computed(displayCurrentVolume, this);

        Object.defineProperties(this.click, {
            playpause: _define(playpause)
            , fullscreen: _define(fullscreen)
        });
    }

    ControlRackModel.prototype = Object.create({
        constructor: ControlRackModel
    }, {
        timestamp: {value: Date.now()}
        , init: {value: init}
        , eventHandler: {value: eventHandler}
        , click: _define({})
        , destroy: _define(destroy)
    });

    return ControlRackModel;

    function init() {
        //connect player events

    }

    function eventHandler(type, event) {
        //_console.debug('player events', type, event);
        var _event = event.e,
            payload = _event.payload,
            asset = payload && payload.asset;

        switch (type) {
            case 'loaded':
                if (!!asset) {
                    this.duration(payload.totalLength);
                    this.timePosition(payload.playheadPosition);
                    this.isLive(!!payload.isLive);
                }
                break;
            case 'start':
                this.duration(payload.totalLength);
                this.timePosition(payload.playheadPosition);
                this.volume(+(payload.volume * 100 || 0).toFixed(2));
                this.captions(this.parent.player.caption());
                this.displayTogglePlay('Pause');
                this.isLive(!!payload.isLive);
                break;
            case 'progress':
                this.timePosition(payload.playheadPosition);
                break;
            case 'volume':
                this.volume(+(payload.volume * 100 || 0).toFixed(2));
                break;
            case 'play':
                this.displayTogglePlay('Pause');
                this.duration(payload.totalLength);
                break;
            case 'complete':
            case 'pause':
                this.displayTogglePlay('Play');
                this.duration(payload.totalLength);
                break;
            default:
                this.isLive(!!payload.isLive);
                break;
        }

    }

    function destroy() {
        //disconnect player events

    }

    function playpause() {
        var togglePlay = this.displayTogglePlay();
        if (togglePlay === 'Play') {
            this.parent.player.play();
        } else {
            this.parent.player.pause();
        }
    }

    function fullscreen() {
        this.parent.player.fullscreen(true);
    }

    function displayDuration() {
        if (this.isLive())return '--';
        var duration = this.duration();
        if (duration) {
            return getTimeString(duration / 1000);
        }
        return '--';
    }

    function displayTimeCount() {
        var time = this.timePosition();
        if (time) {
            return getTimeString(time / 1000);
        }
        return '--';
    }

    function displayPositionPercent() {
        if (this.isLive())return 'LIVE';
        var duration = this.duration();
        var time = this.timePosition();
        if (duration) {
            var lapse = +(parseFloat(time / duration) * 100 || 0).toFixed(0);
            return lapse + '%';
        }
        return '0%';
    }

    function displayCurrentVolume() {
        var volume = this.volume();
        if (volume) {
            return (+volume || 0).toFixed(0);
        }
        return 0;
    }

    function getTimeString(num) {
        var sec_num = parseInt(num, 10),
            hours = Math.floor(sec_num / 3600),
            minutes = Math.floor((sec_num - (hours * 3600)) / 60),
            seconds = sec_num - (hours * 3600) - (minutes * 60);

        var arr = [];
        if (hours) {
            hours = __formattime(hours);
            arr.push(hours);
        }
        minutes = __formattime(minutes);
        arr.push(minutes);
        seconds = __formattime(seconds);
        arr.push(seconds);
        return arr.join(':');
    }

    function __formattime(time) {
        var len = ('' + time).length;
        return len === 1 ? '0' + time : time;
    }

    function _define(obj) {
        return {
            value: obj,
            enumerable: true,
            writable: false
        }
    }
});