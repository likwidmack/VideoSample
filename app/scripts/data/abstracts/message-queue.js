/**
 * message-queue file for ndp-video-spa on 14-Jun-16.
 */

window.$GLOBAL_FUNCTIONS.AbstractEventQueue = (function () {

    function AbstractEventQueue(eventArrayWithCallback) {
        var wait = window.$PAGE_WAIT;
        for (var i = 0; i < eventArrayWithCallback.length; i++) {
            var event = eventArrayWithCallback[i],
                name = event.type;

            this.eventQueue[name] = {
                handler: event.handler,
                events: []
            };
            var throttleID = 'AbstractEventQueue_' + this.timestamp + '_' + name;
            this.throttle[name] = wait.throttle(this.process.bind(this), 1, throttleID);
        }

        //console.error('AbstractEventQueue',this);
        var _this = this;
        Object.defineProperty(this, 'addEvent', {
            value: function () {
                return _this._addEvent.apply(_this, arguments);
            },
            enumerable: true
        });
    }

    AbstractEventQueue.prototype = Object.create({
        constructor: AbstractEventQueue
    }, {
        timestamp: {value: Date.now()}
        , eventQueue: {
            value: {},
            enumerable: true
        }
        , process: {value: process}
        , throttle: {value: {}}
        , _addEvent: {value: addEvent}
    });

    return AbstractEventQueue;

    function addEvent(eventName, event) {
        if (!this.eventQueue.hasOwnProperty(eventName))return;
        var isEmpty = (this.eventQueue[eventName]).events.length === 0;

        (this.eventQueue[eventName]).events.push(event);
        //if (isEmpty) this.throttle[eventName](eventName);
        if (isEmpty) this.process(eventName);
    }

    function process(eventName) {
        var eventObject = this.eventQueue[eventName];
        var event = eventObject.events.shift();
        //console.warn(eventName, typeof eventObject.handler, eventObject, event);

        if (event) {
            if (eventObject.handler instanceof Function) eventObject.handler(event);
            if (eventObject.events.length > 0) {
                this.process(eventName);
            }
        }
    }

})();