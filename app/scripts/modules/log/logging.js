/**
 * logging file for ndp-video-spa on 16-Mar-16.
 */

define('log-logging', [
        'knockout',
        'jquery',
        'log-parameter-model',
        'log-item-parameter-model'],
    function (ko, $, ParameterModel, ItemModel) {
        var page = $page,
            data = page.data,
            utils = page.utils,
            variables = window.$GLOBAL_PARAM,
            requestFrame = window.$REQUEST_FRAME,
            _console = window.$page.console.getInstance('Log Logging Model');


        function LoggingModel(parent) {

            this.parameters = ko.observableArray([]);
            this.parameters.subscribe(function (arr) {
                this.updateParameterOptions(arr);
            }, this);

            this.parameterOptions = ko.observableArray([]);

            this.selectedParameterOption = ko.observable();
            this.selectedParameterOption.subscribe(function (name) {
                this.selectedParameter(this.updateSelectedParameter(name));
            }, this);

            this.selectedParameter = ko.observable(false);
            this.selectedParameter.subscribe(function (parameter) {
                if (!parameter || !parameter.total()) return;
                parameter.updateOptions();
            }, this);

            this.parameterInstances = ko.computed(function () {
                var parameter = this.selectedParameter();
                if (!parameter) return [];
                return parameter.instanceOptions();
            }, this);
            this.parameterTypes = ko.computed(function () {
                var parameter = this.selectedParameter();
                if (!parameter) return [];
                return parameter.typeOptions();
            }, this);

            this.allInstances = ko.observable(true);
            this.allInstances.subscribe(function (bool) {
                if (bool) this.selectedInstances([]);
            }, this);
            this.selectedInstances = ko.observableArray([]);
            this.selectedInstances.subscribe(function (arr) {
                if (arr.length && this.allInstances()) {
                    this.allInstances(false);
                }
            }, this);

            this.allTypes = ko.observable(true);
            this.allTypes.subscribe(function (bool) {
                if (bool) this.selectedTypes([]);
            }, this);
            this.selectedTypes = ko.observableArray([]);
            this.selectedTypes.subscribe(function (arr) {
                if (arr.length && this.allTypes()) {
                    this.allTypes(false);
                }
            }, this);

            this.filtered = ko.observableArray([]);
            this.filtered.subscribe(function (arr) {
                var count = (arr && arr.length) || 0;
                this.filteredCount(count);
                var results = [],
                    i = arr.length;

                var item, obj;
                while (i--) {
                    item = arr[i];
                    obj = new ItemModel(item);
                    results.push(obj);
                }
                this.filteredPrint(results);
            }, this);

            this.filteredCount = ko.observable(0);

            this.filteredPrint = ko.observableArray([]);

            Object.defineProperties(this, {
                parent: {
                    get: function () {
                        return parent
                    }
                }
                , storage: {
                    get: function () {
                        return parent.storage
                    }
                }
            });

            var _this = this;
            this.search = function () {
                _this.filtered(_this.searchFiltered());
            };

        }

        LoggingModel.prototype = Object.create({
            constructor: LoggingModel
        }, {
            start: _define(start)
            , stop: _define(stop)
            , checkStorage: _define(checkStorage)
            , updateParameterOptions: _define(updateParameterOptions)
            , updateSelectedParameter: _define(updateSelectedParameter)
            , searchFiltered: _define(searchFiltered)
        });

        return LoggingModel;

        function start() {
            var arr = Object.keys(this.storage),
                i = arr.length;

            requestFrame.add(this.checkStorage, this);

            while (i--) this.parameterOptions.push(arr[i]);
            if (arr.length) this.selectedParameterOption(arr[0]);

        }

        function stop() {
            requestFrame.remove(this.checkStorage, this);

        }

        function checkStorage() {
            var prop,
                keys = Object.keys(this.storage),
                i = keys.length;

            while (i--) {
                prop = keys[i];
                if (!!prop && !utils.has(prop, this.parameterOptions())) {
                    var model = new ParameterModel(prop);
                    this.parameters.push(model);
                    if ((this.storage[prop]).length) model.updateOptions();
                }
            }
        }

        function updateParameterOptions(arr) {
            var item, i = arr.length;
            this.parameterOptions([]);
            while (i--) {
                item = arr[i];
                this.parameterOptions.push(item.name);
            }
        }

        function updateSelectedParameter(name) {
            var arr = this.parameters(),
                i = arr.length;
            while (i--) {
                if ((arr[i]).name === name) return arr[i];
            }
            return false;
        }

        function searchFiltered() {
            var parameter = this.selectedParameter(),
                items = ([]).concat(this.storage[parameter.name]);

            if (!parameter || !items.length) return [];
            if (!this.allTypes()) {
                items = filterTypes(items, this.selectedTypes());
            }

            if (!this.allInstances()) {
                items = filterInstances(items, this.selectedInstances());
            }

            return items;
        }


        function filterTypes(items, options) {
            var _type, i = items.length;
            while (i--) {
                _type = items[i];
                if (!utils.has(_type.type, options)) {
                    items.splice(i, 1);
                }
            }
            return items;
        }

        function filterInstances(items, options) {
            var instance, i = items.length;
            while (i--) {
                instance = items[i];
                if (!utils.has(instance.instance, options)) {
                    items.splice(i, 1);
                }
            }
            return items;
        }

        function mapConsole() {

        }


        function _define(obj) {
            return {
                value: obj,
                enumerable: true
            }
        }
    })
;