/**
 * pdk file for ndp-video-spa on 18-May-16.
 */

define('player-pdk-event',['player-event-model'], function (EventsModel) {
    var StorageEventModel = window.$GLOBAL_FUNCTIONS.StorageEventModel;
    var storage = window.$GLOBAL_PARAM.$LOG_STORAGE.pdk = [];
    var _console = window.console,
        __pdkCounter = 999;


    var PDK_Events = [
        'OnMediaError',
        'OnMediaBuffer',
        'OnMediaLoading',
        'OnMediaSeek',
        'OnMediaStart',
        'OnMediaComplete',
        'OnMediaEnd',
        'OnMediaPause',
        'OnMediaUnpause',
        'OnMediaPlay',
        'OnMediaPlaying',
        'OnGetRelease',
        'OnPlayerLoaded',
        'OnLoadRelease',
        'OnLoadReleaseUrl',
        'OnSetReleaseUrl',
        'OnSetRelease',
        'OnReleaseEnd',
        'OnReleaseError',
        'OnVersionError',
        'OnPdkTrace',
        'OnResetPlayer',
        'OnSetVolume',
        'OnMute',
        'OnLoadSmil',
        'OnAudioTrackSwitched',
        'OnClipInfoLoaded'
    ];

    function PDKEventModel(parent) {
        EventsModel.call(this, parent);
        this.all.push.apply(this.all, PDK_Events);

        this.init();
    }


    PDKEventModel.prototype = Object.create(EventsModel.prototype, {
        constructor: {value: PDKEventModel}
        , init: {value: init}
        , _handler: {value: handler}
    });

    return PDKEventModel;

    function init() {
        var _this = this;

        if (window['$pdk'] && $pdk.controller) {
            _console.log('[Client End]', '[PDK_AVAILABLE] ==', true);
            for (var i = 0; i < PDK_Events.length; i++) {
                var prop = PDK_Events[i];
                $pdk.controller.addEventListener(prop, this.handler);
            }
        } else {
            if (__pdkCounter > 0) {
                setTimeout(function () {
                        __pdkCounter--;
                        _this.init();
                    }, 10);
            } else {
                _console.error('[Client End]', '[ERROR :: PDK TIMEOUT]', '[$ndp.PDK_AVAILABLE] ==', $ndp.PDK_AVAILABLE);
            }
        }
    }

    function handler(event) {
        var type = event.type;
        var mappedEvent = this.map(StorageEventModel, {
            e: event,
            type: type,
            instance: 'pdk',
            index: this.total
        });
        this.add(event);

        var payload = event.data || {},
            msg = ['[Client End] PDK Event'];
        var logType = 'log', logCss = '';

        if (typeof type === 'string') {
            if ((/Error/).test(type)) {
                logType = 'error';
                logCss = 'log-error';
                if (payload['message']) {
                    msg.push(payload.message);
                }
            } else if ((/Playing|Loading/).test(type)) {
                logType = '';
                logCss = 'log-debug';
            } else if ((/Play|End/).test(type)) {
                logType = 'info';
                logCss = 'log-info';
            } else if ((/Trace/).test(type)) {
                logType = '';
                logCss = 'log-warn';
            } else if ((/Unpause|Pause|Start|Volume/).test(type)) {
                logType = 'debug';
                logCss = 'log-debug';
            }
        }

        var log = mappedEvent.log;
        log.type = logType;
        log.message = msg;
        log.css = logCss;

        this.parent.queue.addEvent('all', mappedEvent);
        storage.push(mappedEvent);

        if($page.data.branch !== 'baseline')return;

    }


});