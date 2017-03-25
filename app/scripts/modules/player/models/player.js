/**
 * player file for ndp-video-spa on 18-May-16.
 */

define('player-model',
    ['knockout', 'jquery', 'player-event', 'player/controlrack'],
    function (ko, $, EventModel, ControlRackModel) {

        var page = $page,
            data = page.data,
            requestFrame = window.$REQUEST_FRAME,
            _console = window.$page.console.getInstance('Player UX Model');


        function PlayerUIModel(SingletonPlayerName, parent) {
            var _this = this;
            _console.info('begin', SingletonPlayerName, parent);
            var PlayerFN = window[SingletonPlayerName] ||
                (data.branch === 'baseline' ? window.BaselinePlayer : window.NDPPlayer);

            Object.defineProperties(this, {
                parent: {
                    get: function () {
                        return parent;
                    }
                }
                , player: {
                    value: new PlayerFN({
                        location: document.getElementById(parent.domLocationId.toString())
                    }),
                    enumerable: true
                }
                , events: {
                    value: new EventModel(this),
                    enumerable: true
                }
                , controlrack: {
                    value: ko.observable(false),
                    enumerable: true
                }
            });

            _console.info('player', SingletonPlayerName, this.player);

            this.mediaAsset = function (asset) {
                _console.debug('this.mediaAsset()', arguments);
                if (asset) return _this.player.mediaAsset(asset);
                return _this.player.mediaAsset();
            };

            this.play = function (asset, data, event) {
                _console.debug('this.play()', arguments);
                if (asset) {
                    _this.player.play(asset);
                } else {
                    _this.player.play();
                }
            };

            this.pause = function (data, event) {
                _console.debug('this.pause()');
                _this.player.pause();
            };
        }

        PlayerUIModel.prototype = Object.create({
            constructor: PlayerUIModel
        }, {
            timestamp: {value: Date.now()}
            , init: {
                value: init,
                writable: true,
                enumerable: true
            }
            , destroy: {
                value: destroy,
                writable: true,
                enumerable: true
            }
            , controlRackHandler: {
                value: controlRackHandler
            }
        });

        return PlayerUIModel;

        function init() {
            this.events.init(this.player);
            data.fwads = false;

            requestFrame.add(function _checkFWVersion() {
                if ((window.tv
                    && window.tv.freewheel
                    && window.tv.freewheel.SDK)) {
                    requestFrame.remove(_checkFWVersion, this);
                    data.fwads = window.tv.freewheel.SDK.version;
                    this.parent.fw_version(window.tv.freewheel.SDK.version);
                }
            }, this, true);

            if (data.branch !== 'baseline' && !!$ndp) {
                this.parent.player_version($ndp.__version);
                this.parent.player_datetime($ndp.__datetime);
            }

            if (data.controlrack) {
                this.controlrack(new ControlRackModel(this));
            }
            this.parent.addListener('controlrack', this.controlRackHandler, this);

            //For quick javascript console review, adding pointer to current Instance
            window.$NDP_Player_Instance = this.player;
        }

        function destroy() {
            this.player.destroy();
            this.events.destroy();
            if (this.controlrack()) {
                this.controlrack().destroy();
                this.controlrack(false);
            }
            window.$NDP_Player_Instance = null;
            this.parent.removeListener('controlrack', this.controlRackHandler, this);
        }

        function controlRackHandler(e) {
            if (data.controlrack) {
                if (!this.controlrack())
                    this.controlrack(new ControlRackModel(this));
            } else if (this.controlrack()) {
                this.controlrack().destroy();
                this.controlrack(false);
            }

        }

        function _define(fn) {
            return {
                get: function () {
                    return fn;
                },
                enumerable: true
            }
        }

    });