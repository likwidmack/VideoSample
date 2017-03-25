/**
 * parameter-model file for ndp-video-spa on 05-Mar-17.
 */

define('log-parameter-model', ['knockout', 'jquery'], function (ko, $) {
    var page = $page,
        utils = page.utils,
        requestFrame = window.$REQUEST_FRAME,
        _console = window.$page.console.getInstance('Logging Parameter Model');

    function ParameterModel(parameterName) {
        this.name = parameterName || this.timestamp;
        this.instanceOptions = ko.observableArray([]);
        this.typeOptions = ko.observableArray([]);

        this.total = ko.observable(0);
        this.total.subscribe(function (number) {
            if (number) this.updateOptions();
        }, this);

        requestFrame.add(this.getTotal, this);
    }

    ParameterModel.prototype = Object.create({
        constructor: ParameterModel
    }, {
        timestamp: {value: Date.now()}
        , updateOptions: {value: updateOptions}
        , getTotal: {value: getTotal}
        , destroy: {value: destroy}
    });

    return ParameterModel;

    function updateOptions() {
        var storage = window.$GLOBAL_PARAM.$LOG_STORAGE[this.name];
        if (!storage || !storage.length) {
            _console.error('THIS STORAGE OPTION DOES NOT EXIST OR IS EMPTY ::', this.name);
            return;
        }

        var item, i = storage.length;
        while (i--) {
            item = storage[i];
            if (!utils.has((item.instance), this.instanceOptions())) {
                this.instanceOptions.push(item.instance);
            }
            if (!utils.has((item.type), this.typeOptions())) {
                this.typeOptions.push(item.type);
            }
        }
    }

    function getTotal() {
        this.total((window.$GLOBAL_PARAM.$LOG_STORAGE[this.name]).length);
    }

    function destroy() {
        requestFrame.remove(this.getTotal, this);
    }

});