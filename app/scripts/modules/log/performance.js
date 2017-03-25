/**
 * performance file for ndp-video-spa on 16-Mar-16.
 */

define('log-performance', function () {

    function PerformanceModel(parent) {

        this.store = ko.observableArray([]);
        this.filter= {};

        Object.defineProperties(this, {
            parent: {
                get: function () {
                    return parent
                }
            }
            , clickFilter:_define(clickFilter)
        });

    }

    PerformanceModel.prototype = Object.create({
        constructor: PerformanceModel
    }, {
        start: _define(start)
        , stop: _define(stop)
    });

    return PerformanceModel;

    function start() {

    }

    function stop() {

    }

    function clickFilter(d, e){

    }

    function _define(obj) {
        return {
            value: obj,
            enumerable: true
        }
    }

});