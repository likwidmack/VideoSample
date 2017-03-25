/**
 * File name: event-model, created on 15-Jun-16 in project, ndp-video-spa.
 */

window.$GLOBAL_FUNCTIONS.StorageEventModel = (function () {

    var utils = false,
        wait = window.$PAGE_WAIT;

    function StorageEventModel(storeObj) {
        storeObj = storeObj || {};
        Object.defineProperties(this, {
            e: _define(storeObj.e || false)
            , type: _define(storeObj.type || false)
            , instance: _define(storeObj.instance || 'default')
            , playerType: _define(window.$page.data.player)
            , index: _define(storeObj.index || -1)
            , timestamp: {
                value: Date.now(),
                enumerable: true
            },
            perf: {value: window.performance.now()}
        });

        var _this = this;
        wait.on(wait.UTILS, function () {
            if (!utils) utils = $page.utils;
            Object.defineProperty(_this, 'children', {
                value: _this.map(_this.e),
                enumerable: true
            });
        });
    }

    StorageEventModel.prototype = Object.create({
        constructor: StorageEventModel
    }, {
        log: {
            value: new MessageModel(),
            enumerable: true
        }
        , map: {value: mapEvent}
        , handler: {
            value: false,
            writable: true
        }
    });

    return StorageEventModel;


    function SeqEventObj() {
        this.evt = {};
        this.type = '';
        this.instance = '';
        this.playerType = '';
        this.index = 0;
        this.log = new MessageModel();
        this.timestamp = Date.now();
    }

    function MessageModel() {
        this.type = '';
        this.css = '';
        this.message = [];
    }

    function mapEvent(_eventObj) {
        if (!_eventObj) {
            setTimeout(function () {
                mapEvent(_eventObj);
            }, 100);
            return;
        }
        var page = $page,
            utils = page.utils;
        var arr = [],
            cache = [],
            replacer = function (key, value) {
                if (value instanceof Function) {
                    if (value.name) return 'function ' + value.name;
                    return (value.toString()).replace(/(\r)(\s+)/gm, ' ');
                } else if (typeof value === 'object' && value !== null) {
                    var secArg, M = utils.models.nativeObj;
                    if (utils.has(value, cache)) return "[CIRCULAR_REFERENCE]";
                    cache.push(value);

                    if (Object.prototype.toString.call(value) === '[object HTMLVideoElement]') {
                        M = utils.models.videoModel;
                    } else if (utils.isDomElement(value)) {
                        M = utils.models.domModel;
                    } else {
                        secArg = 1
                    }
                    return new M(value, secArg);
                }

                return value;
            };

        _eventObj = utils.cloneObjToJson(_eventObj, replacer);
        return _mapEventObject(_eventObj);
    }

    function _mapEventObject(_eventObj) {
        var page = $page,
            utils = page.utils;
        var arr = [];
        if (utils.isArray(_eventObj)) {
            setTimeout(function () {
                var item, i = _eventObj.length;
                while (i--) {
                    item = _mapEventObject(_eventObj[i]);
                    arr.unshift(item);
                }
            }, 1);
        } else {
            var _typeof = (Object.prototype.toString.call(_eventObj)),
                regex = /(undefined|null|string|number|boolean)/;
            if (regex.test(_typeof.toLowerCase())) {
                return _eventObj;
            } else {
                setTimeout(function () {
                    for (var prop in _eventObj) {
                        arr.push(new ItemModel(prop, _mapEventObject(_eventObj[prop])));
                    }
                }, 1);
            }
        }

        return arr;
    }

    function ItemModel(name, value) {
        this.name = name;
        this.value = value;
        Object.defineProperty(this, 'timestamp', {value: Date.now()});
    }

    function _define(obj) {
        return {
            value: obj,
            writable: true,
            enumerable: true
        }
    }
})();