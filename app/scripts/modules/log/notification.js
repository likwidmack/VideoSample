/**
 * notification file for ndp-video-spa on 16-Mar-16.
 */

define('log-notification', function () {

    function NotificationModel(parent) {

        Object.defineProperties(this, {
            parent: {
                get: function () {
                    return parent
                }
            }
        });

    }

    NotificationModel.prototype = Object.create({
        constructor: NotificationModel
    }, {
        start: _define(start)
        , stop: _define(stop)
    });

    return NotificationModel;

    function start() {

    }

    function stop() {

    }

    function _define(obj) {
        return {
            value: obj,
            enumerable: true
        }
    }
});