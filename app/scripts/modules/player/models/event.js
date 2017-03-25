/**
 * event file for ndp-video-spa on 18-May-16.
 */

define('player-event-model',function () {
    Date = window.Date;
    var utils = $page.utils;

    function EventsModel(parent) {
        var _this = this;

        Object.defineProperties(this, {
            handler: {
                value: function () {
                    return _this._handler.apply(_this, arguments);
                },
                enumerable: true
            }
            , parent: {
                get: function () {
                    return parent || false;
                }
            }
            , all: _define([])
            , loaded: _define([])
            , start: _define([])
            , volume: _define([])
            , progress: _define([])
            , play: _define([])
            , pause: _define([])
            , completed: _define([])
        });
    }

    EventsModel.prototype = Object.create({
        constructor: EventsModel
    }, {
        timestamp: {value: Date.now()}
        , storage: {value: []}
        , total: {
            get: function () {
                return this.storage.length;
            },
            enumerable: true
        }
        , map: {
            value: function (MapModel, EventObj) {
                return utils.extend(true, {}, new MapModel(), EventObj);
            },
            enumerable: true,
            writable: true
        }
        , add: {
            value: function () {
                this.storage.push.apply(this.storage, arguments);
            },
            enumerable: true,
            writable: true
        }
        , destroy: {
            value: destroy,
            writable: true
        }
        , _handler: {
            value: function () {
                return arguments;
            },
            writable: true,
            configurable: true
        }
    });

    return EventsModel;

    function _define(obj) {
        return {
            value: obj,
            enumerable: !(obj instanceof Function)
        }
    }

    function destroy(){

    }

    function SeqEventObj() {
        this.id = '';
        this.evt = {};
        this.type = '';
        this.category = '';
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