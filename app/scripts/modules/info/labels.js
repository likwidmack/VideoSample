/**
 * labels file for ndp-video-spa on 16-Mar-16.
 */

define('info-labels', ['jquery', 'knockout'], function ($, ko) {
    Date = window.Date;

    var _data = window.$page.data,
        utils = window.$page.utils,
        variables = window.$GLOBAL_PARAM,
        _console = window.$page.console.getInstance('Information Labels');

    function LabelUpdate(parent) {

        Object.defineProperties(this, {
            parent: {
                get: function () {
                    return parent;
                }
            }
            , labels: {
                value: ko.observableArray([]).extend({
                    rateLimit: 200
                }),
                enumerable: true
            }
        });

        this.labels.subscribe(function () {
            _console.debug('Update Info Labels', ko.toJS(this.labels));
        }, this);
    }

    LabelUpdate.prototype = Object.create({
        constructor: LabelUpdate
    }, {
        timestamp: {value: Date.now()}
        , build: {value: build}
        , update: {value: update}
        , destroy: {value: destroy}
        , length: {
            get: function () {
                return (this.labels()).length;
            }
        }
    });

    return LabelUpdate;

    function build() {
        var _keys = Object.keys(variables.$DATA2GLOBAL),
            LabelModel = this.parent.LabelModel,
            len = _keys.length;

        while (len--) {
            this.update(new LabelModel(_keys[len], _data[_keys[len]]));
        }
        _console.debug('Build Info Labels', ko.toJS(this.labels));
    }

    function update(model) {
        if (utils.has(model.name, ['merged', 'async', 'assets']))
            return;

        var LabelModel = this.parent.LabelModel;
        switch (model.name) {
            case 'debug':
                model.title += '-' + _data.mode;
                model.css.push('info-label-debug');
                break;
            case 'mode':
                model = new LabelModel('debug', _data.debug);
                model.title += '-' + _data.mode;
                model.css.push('info-label-debug');
                break;
            case 'controlrack':
                model.title = ('control rack').toUpperCase();
                break;
            default:
                model.css.unshift('secondary');
                break;
        }

        var len = this.length,
            index = -1;

        while (len--) {
            var label = this.labels()[len];
            if ((label).name === model.name) {
                index = len;
                break;
            }
        }

        if (index > -1) {
            this.labels.splice(index, 1, model);
        } else {
            this.labels.unshift(model);
        }

        //Update Header Labels also if property exists
        var headerLabels = this.parent.headerLabels();
        if(headerLabels.hasOwnProperty(model.name)){
            (headerLabels[model.name])(model);
        }

    }

    function destroy() {
        this.labels.removeAll();
    }

});