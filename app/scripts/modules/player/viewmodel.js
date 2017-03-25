/**
 * viewmodel file for ndp-video-spa on 27-Apr-16.
 */


require([
    'knockout',
    'jquery',
    '/scripts/misc/player_config.js',
    '/scripts/misc/siteData.js'
], function (ko, $) {

    var $AbstractModule = window.$GLOBAL_FUNCTIONS.AbstractModule;
    var page = $page,
        data = page.data,
        variables = window.$GLOBAL_PARAM,
        _console = window.$page.console.getInstance('Player Viewmodel');

    function PlayerViewModel(moduleName) {
        $AbstractModule.call(this, moduleName || 'player');
        Object.defineProperties(this, {
            isPlaying: _define(ko.observable(false))
            , player: _define(ko.observable(false))
            , display: _define(ko.observableArray([]))
            , framework: _define(ko.observable(false))
            , asset: _define(ko.observable(false))
            , mpxAsset: _define(ko.observable(false))
            , asset_details: _define(ko.observable(false))
            , player_version: _define(ko.observable())
            , player_datetime: _define(ko.observable())
            , fw_version: _define(ko.observable())
        });

        var _this = this;
        this.asset.subscribe(function (asset) {
            _console.info('ASSET Update', asset, $ndp.MPXMediaAsset);
            if (!asset) return;
            this.mpxAsset(asset.mapMPXModel($ndp.MPXMediaAsset));

        }, this);

        this.mpxAsset.subscribe(function (mpx) {
            if (!this.player())return;
            //_console.info('MAPPED ASSET Update', mpx instanceof $ndp.MPXMediaAsset, mpx instanceof $ndp.MediaAsset);
            this.asset_details(this.mapAssetDetails(this.asset()));
            var player = this.player();
            if (this.isPlaying() || data.autoplay) {
                _console.info('Mapped Asset changed during playing and/or autoplay');
                this.pause();
                player.play(mpx);
                return;
            }

            /*
             TODO: NDP Fix
             WARNING NDPPLAYER ISSUE: Using player.mediaAsset() prior to NDPPlayer.play()
             causes premature play trigger. [AUTOPLAY] behavior.
             mediaAsset must be added with play method as temporary patch until
             media asset load issue on the NDP is resolved.
             */
            //player.mediaAsset(mpx);
        }, this);

        this.play = function (data, event) {
            _console.debug('PLAYER PLAY CLICKED!');
            if (!_this.player())return;
            var player = _this.player();
            _console.log(player.mediaAsset());
            _this.isPlaying(true);
            if (!(player.mediaAsset() === _this.mpxAsset())) {
                player.play(_this.mpxAsset());
                return;
            }
            player.play();
        };

        this.pause = function (data, event) {
            if (!_this.player())return;
            _this.isPlaying(false);
            _this.player().pause();
        };

        this.nextClick = function () {
            page.getNextAsset();
            _this.play();
        }

    }

    PlayerViewModel.prototype = Object.create($AbstractModule.prototype, {
        init: {value: init}
        , start: {value: startOverride}
        , stop: {value: stopOverride}
        , getPlayerUrl: {value: getPlayerUrl}
        , mapAssetDetails: {value: mapAssetDetails}
        , domLocationId: {value: 'playerOne'}
        , handler: {value: window.$PAGE_WAIT.debounce(handler, 100, 'VideoPlayerDataHandler')}
    });

    window.$page.modules.add({
        module: 'player',
        constructor: PlayerViewModel,
        html: 'html-player'
    });

    function startOverride(deferTimeout) {
        $AbstractModule.prototype.start.apply(this, arguments);

        this.addListener(Object.keys(variables.$DATA2GLOBAL), this.handler, this);

        var _this = this,
            _param = {
                debug: data.debug,
                player: data.player,
                branch: data.branch,
                version: data.version,
                isHTTPS: !!(window.location.protocol === 'https:')
            };

        if (data.ads) {
            $.getJSON('/siteData', {brand: data.brand}, function (data) {
                _console.info('SITEDATA', data);
                window.Tdy.NDPSiteData.siteData = data;
                if ($ndp && $ndp.configuration) {
                    $ndp.configuration.siteData = data;
                }
                _this.getPlayerUrl(_param);
            }, function () {
                _console.error('SITEDATA ERROR', arguments);
                _this.getPlayerUrl(_param);
            });
        } else {
            this.getPlayerUrl(_param);
        }

    }

    function stopOverride() {
        $AbstractModule.prototype.stop.call(this);

        this.removeListener(Object.keys(variables.$DATA2GLOBAL), this.handler, this);
        this.isPlaying(false);

        if (this.player() && this.player().destroy) {
            this.player().destroy();
        }
        //this.player(false);

        //this.controlrack(false);
        this.framework(false);

        this.asset(false);
        this.mpxAsset(false);

        //Destroy $ndp, NDPPlayer

        delete window.$ndp;
        if (window['NDPPlayer']) delete window['NDPPlayer'];
        if (window['BaselinePlayer']) delete window['BaselinePlayer'];
    }

    function init() {
        // TODO: Verify page asset exists
        // TODO: Configure via page data

        _console.debug('[INIT] Does Player Exist?', !!this.player());
        if (!!this.player()) this.player().init();

        _console.debug('[INIT] Is Asset NOT ready?', page.currentAsset() && !this.asset());
        if (page.currentAsset() && !this.mpxAsset()) this.asset(page.currentAsset());

        _console.debug('[INIT] Is autoplay NOT playing?', (data.autoplay && !this.isPlaying()));
        if (data.autoplay && !this.isPlaying()) this.player().play(this.mpxAsset());
    }

    function getPlayerUrl(_param) {
        var _this = this,
            scriptsObj = ['/ndp?' + $.param(_param)];
        var _call = 'NDPPlayer';
        window.ndpDEBUG = !!data.debug;
        window.ndpDebugMode = (data.mode > 3) ? 3 : data.mode;
        _console.log('GET NDP scriptsURL Request', scriptsObj);
        if (data.branch === 'baseline') {
            _call = 'BaselinePlayer';
            scriptsObj.push('player-baseline');
        }
        if (data.mode > 2) {
            $ndp.configuration.__console = window.$GLOBAL_FUNCTIONS._Console;
        }

        var scriptsURL = (['player-model']).concat(scriptsObj);
        require(scriptsURL, function (PlayerModel) {

            _console.log('NDP scriptsURL Request COMPLETED');
            _this.player(new PlayerModel(_call, _this));

            setTimeout(function () {
                _this.init();
            }, 1);

        }, function () {
            _console.error('NDP scriptsURL Request ERROR', arguments);
        })
    }

    function mapAssetDetails(asset) {
        var details = {},
            regex = /(null|string|number|boolean)/;

        for (var prop in asset) {
            var item = asset[prop],
                _typeof = (Object.prototype.toString.call(item));
            if (regex.test(_typeof.toLowerCase())) {
                details[prop] = item;
            }
        }

        details.shortenUrl = 'To Platform Link';
        if (!!details.url) {
            var shortenUrl = (details.url).split('?');
            details.shortenUrl = shortenUrl[0] || details.shortenUrl;
        }

        _console.log('ASSET details', details);
        return details;
    }

    function handler(e) {
        var wait = window.$PAGE_WAIT;

    }

    function _define(obj) {
        return {
            value: obj,
            enumerable: true
        }
    }
});