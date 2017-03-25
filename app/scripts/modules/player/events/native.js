/**
 * native file for ndp-video-spa on 18-May-16.
 */

define('player-native-event', ['jquery', 'player-event-model'], function ($, EventsModel) {
    var StorageEventModel = window.$GLOBAL_FUNCTIONS.StorageEventModel;
    var page = window.$page,
        utils = page.utils,
        ElementModel = utils.models.videoModel,
        _console = window.console;
    var ElementEvents = [];
    var firstVideoPlay = true;
    var storage = window.$GLOBAL_PARAM.$LOG_STORAGE.native = [];

    function NativeEventModel(videoElement, parent) {
        EventsModel.call(this, parent);
        Object.defineProperty(this, 'video', {
            get: function () {
                if (!(videoElement instanceof HTMLVideoElement)) {
                    videoElement = $('video', 'body').get(0) || videoElement;
                }
                return videoElement;
            }
        });

        this.init();
    }


    NativeEventModel.prototype = Object.create(EventsModel.prototype, {
        constructor: {value: NativeEventModel}
        , init: {value: init}
        , _handler: {value: handler}
    });

    return NativeEventModel;

    function init() {
        addElementEventToArray(this.video);
        this.all.push.apply(this.all, ElementEvents);

        var strEvents = ElementEvents.join(' ');
        _console.warn('*[video]*', strEvents);
        $(this.video).on(strEvents, this.handler);
    }

    function handler(event) {
        var type = event.type;

        event = new ElementEventModel(event);
        var mappedEvent = new StorageEventModel({
            e: event,
            type: type,
            instance: 'native',
            index: this.total
        });
        this.add(event);

        var _ele = new utils.models.videoModel(event.target);
        var logType = 'debug',
            msg = ['HTMLElement Event Video', event.type],
            isAd = this.video._fw_videoAdPlaying || false,
            logCss = '';

        if (isAd) {
            mappedEvent.isAd = true;
            msg.push('{isAd}');
            logCss += 'isAd';
        }

        switch (type) {
            case 'canplay':
            case 'pause':
            case 'volumechange':
                logCss = 'log-debug';
                break;
            case 'emptied':
                logCss = 'log-debug';
                msg.push('Current Source: ' + _ele.currentSrc);
                break;
            case 'suspend':
            case 'progress':
            case 'timeupdate':
                logType = '';
                break;
            case 'abort':
            case 'error':
                logType = 'error';
                logCss = 'log-error';
                if (type === 'error')
                    msg.push(playbackFailed(event));
                break;
            case 'waiting':
            case 'stalled':
                logType = 'warn';
                logCss = 'log-warn';
                break;
            case 'playing':
            case 'play':
            case 'ended':
                logType = 'info';
                logCss = 'log-info';
                break;
            default:
                logType = 'log';
                break;
        }

        mappedEvent.log = new MessageModel(logType, msg, logCss);

        //_console.log('NATIVE EVENT',mappedEvent);
        this.parent.queue.addEvent('all', mappedEvent);
        storage.push(mappedEvent);

        if (page.data.branch === 'baseline')
            runBaselineHandlers.call(this, type, mappedEvent, firstVideoPlay);
    }

    function addElementEventToArray(_element) {
        ElementEvents = [];
        for (var prop in _element) {
            if (prop.substring(0, 2) === 'on') {
                var _eName = prop.slice(2);
                if ((/(^key|mouse|drag|pointer)/).test(_eName)) continue;
                (ElementEvents).push(_eName);
            }
        }
        if ((ElementEvents).length < 10) ElementEvents = _getHcVideoEvents();
        _console.info(ElementEvents);
    }

    function ElementEventModel(e) {
        if (!e) return {};
        for (var prop in e) {
            if (!e.hasOwnProperty(prop)) continue;
            if (prop.substring(0, 2) === 'on') continue;
            var item = e[prop],
                _typeof = (Object.prototype.toString.call(item)),
                regex = /(undefined|null|string|number|boolean|array)/;

            //_console.debug("ElementEventModel", _typeof.toLowerCase(), regex.test(_typeof.toLowerCase()), item);
            if (regex.test(_typeof.toLowerCase())) {
                this[prop] = item;
                //} else {
                //this[prop] = _typeof;
            }
        }
        this.target = new ElementModel(e.target);
    }

    function runBaselineHandlers(type, mappedEvent, firstVideoPlay) {

        switch (type) {
            case 'canplay':
                this.parent.queue.addEvent('loaded', mappedEvent);
                firstVideoPlay = true;
                break;
            case 'playing':
                if (firstVideoPlay) {
                    this.parent.queue.addEvent('start', mappedEvent);
                    firstVideoPlay = false;
                }
                break;
            case 'volumechange':
                this.parent.queue.addEvent('volume', mappedEvent);
                break;
            case 'timeupdate':
                this.parent.queue.addEvent('progress', mappedEvent);
                break;
            case 'play':
                this.parent.queue.addEvent('play', mappedEvent);
                break;
            case 'pause':
                this.parent.queue.addEvent('pause', mappedEvent);
                break;
            case 'seeking':
            case 'seeked':
                this.parent.queue.addEvent('seek', mappedEvent);
                break;
            case 'ended':
                this.parent.queue.addEvent('completed', mappedEvent);
                break;
            case 'emptied':
                firstVideoPlay = true;
                break;
            case 'error':
                this.parent.queue.addEvent('error', mappedEvent);
                break;
        }
    }

    function MessageModel(logType, msg, logCss) {
        this.type = logType;
        this.message = msg;
        this.css = logCss;
    }

    function playbackFailed(e) {
        var msg = '',
            err = (e.target && e.target.error) || {},
            code = err.code || false;

        switch (code) {
            case err.MEDIA_ERR_ABORTED:
                msg += 'MEDIA_ERR_ABORTED\n ';
                msg += 'The fetching process for the media resource was aborted by the user.';
                break;
            case err.MEDIA_ERR_NETWORK:
                msg += 'MEDIA_ERR_NETWORK\n ';
                msg += 'A network error has caused the user agent to stop fetching the media resource, after the resource was established to be usable.';
                break;
            case err.MEDIA_ERR_DECODE:
                msg += 'MEDIA_ERR_DECODE\n ';
                msg += 'An error has occurred in the decoding of the media resource, after the resource was established to be usable.';
                break;
            case err.MEDIA_ERR_SRC_NOT_SUPPORTED:
                msg += 'MEDIA_ERR_SRC_NOT_SUPPORTED\n ';
                msg += 'The media resource specified by src was not usable.\n ';
                msg += 'The video could not be loaded, either because the server or network failed or because the format is not supported.';
                break;
            default:
                msg += 'An unknown error occurred.';
                break;
        }
        msg += '\n::>' + e.target.src;
        return msg;
    }

    function _getHcVideoEvents() {
        return [
            'webkitkeyadded',
            'webkitkeyerror',
            'webkitkeymessage',
            'webkitneedkey',
            'encrypted',
            'abort',
            'cancel',
            'canplay',
            'canplaythrough',
            'change',
            'click',
            'close',
            'cuechange',
            'dblclick',
            'drop',
            'durationchange',
            'emptied',
            'ended',
            'error',
            'invalid',
            'load',
            'loadeddata',
            'loadedmetadata',
            'loadstart',
            'pause',
            'play',
            'playing',
            'progress',
            'ratechange',
            'reset',
            'resize',
            'scroll',
            'seeked',
            'seeking',
            'show',
            'stalled',
            'suspend',
            'timeupdate',
            'toggle',
            'volumechange',
            'waiting',
            'autocomplete',
            'autocompleteerror',
            'copy',
            'webkitfullscreenchange',
            'webkitfullscreenerror'
        ];
    }

});