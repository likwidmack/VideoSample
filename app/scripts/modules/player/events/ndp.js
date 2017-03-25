/**
 * ndp file for ndp-video-spa on 19-May-16.
 */

define('player-ndp-event',['player-event-model'], function (EventsModel) {
    if (!window.$ndp) return false;
    $ndp = window.$ndp;

    var _console = window.console;
    var StorageEventModel = window.$GLOBAL_FUNCTIONS.StorageEventModel;
    var storage = window.$GLOBAL_PARAM.$LOG_STORAGE.ndp = [];
    var SystemEvent = $ndp.events.SystemEvent,
        ErrorEvent = $ndp.events.ErrorEvent,
        PlaybackEvent = $ndp.events.PlaybackEvent,
        AdEvent = $ndp.events.AdEvent;

    function NDPEventsModel(_ndp, parent) {
        EventsModel.call(this, parent);

        this.all.push('*');
        this.loaded.push(SystemEvent.PLAYER_LOADED, PlaybackEvent.LOADED);
        this.start.push(PlaybackEvent.START, AdEvent.START);
        this.volume.push(PlaybackEvent.VOLUME_CHANGE, AdEvent.VOLUME_CHANGE);
        this.progress.push(PlaybackEvent.PROGRESS, AdEvent.PROGRESS);
        this.play.push(PlaybackEvent.PLAY, AdEvent.PLAY);
        this.pause.push(PlaybackEvent.PAUSE, AdEvent.PAUSE);
        this.completed.push(PlaybackEvent.COMPLETE, PlaybackEvent.PLAYLIST_COMPLETE, AdEvent.COMPLETE);

        this.init(_ndp);
    }

    NDPEventsModel.prototype = Object.create(EventsModel.prototype, {
        constructor: {value: NDPEventsModel}
        , init: {value: init}
        , _handler: {value: handler}
        //add: {}
    });

    return NDPEventsModel;

    function init(_ndp) {
        _ndp.on('*', this.handler);
    }

    function handler(event) {
        var type = event.type[0];
        var mappedEvent = new StorageEventModel({
            e: event,
            type: type,
            instance: 'ndp',
            index: this.total
        });
        this.add(event);

        var payload = event.payload || {},
            msg = ['NDP Player Event'];
        var logType = 'log', logCss = '';

        if (typeof type === 'string') {
            if ((/ERROR/).test(type)) {
                logType = 'error';
                msg.push(event.payload.error);
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

        //_console.warn('MAPPEDEVENT', mappedEvent);
        var log = mappedEvent.log;
        log.type = logType;
        log.message = msg;
        log.css = logCss;

        this.parent.queue.addEvent('all', mappedEvent);
        storage.push(mappedEvent);

        switch (event.type) {
            case SystemEvent.PLAYER_LOADED:
            case PlaybackEvent.LOADED:
                this.parent.queue.addEvent('loaded', mappedEvent);
                break;
            case AdEvent.START:
            case PlaybackEvent.START:
                this.parent.queue.addEvent('start', mappedEvent);
                break;
            case AdEvent.VOLUME_CHANGE:
            case PlaybackEvent.VOLUME_CHANGE:
                this.parent.queue.addEvent('volume', mappedEvent);
                break;
            case AdEvent.PROGRESS:
            case PlaybackEvent.PROGRESS:
                this.parent.queue.addEvent('progress', mappedEvent);
                break;
            case AdEvent.PLAY:
            case PlaybackEvent.PLAY:
                this.parent.queue.addEvent('play', mappedEvent);
                break;
            case AdEvent.PAUSE:
            case PlaybackEvent.PAUSE:
                this.parent.queue.addEvent('pause', mappedEvent);
                break;
            case PlaybackEvent.SEEK:
                this.parent.queue.addEvent('seek', mappedEvent);
                break;
            case AdEvent.COMPLETE:
            case PlaybackEvent.COMPLETE:
                this.parent.queue.addEvent('completed', mappedEvent);
                break;
            case AdEvent.ERROR:
            case ErrorEvent.MEDIA_ERROR:
            case ErrorEvent.NETWORK_ERROR:
            case ErrorEvent.TIMEOUT_ERROR:
            case SystemEvent.VIDEO_ERROR:
                this.parent.queue.addEvent('error', mappedEvent);
                break;
        }

    }

});