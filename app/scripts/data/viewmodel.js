/**
 * data file for ndp-video-spa on 16-Mar-16.
 */

define([
    'jquery',
    'knockout',
    'views/layout',
    'configuration-property-model',
    'configuration-detection',
    'configuration-utils-model',
    'configuration-module-viewmodel'
], function ($, ko, Layout, DataConfigurationModel, Detection, UtilsModel, ModuleViewModel) {
    Date = window.Date;
    //window.$PageConfiguration = new Configuration();

    var gFunctions = window.$GLOBAL_FUNCTIONS,
        wait = window.$PAGE_WAIT,
        _console = window.console;

    wait.on(wait.CONSOLE, function () {
        _console = window.$page.console.getInstance('Data ViewModel');
        _console.log('Wait Condition Initialized :: window.$page.console', Date.now());
    });

    /**
     * ViewModel
     * Global data binding of viewmodel for module connection
     * @constructor
     */
    function ViewModel() {
        this.assets = ko.observable(false);
        this.info = ko.observable(false);
        this.log = ko.observable(false);
        this.panel = ko.observable(false);
        this.player = ko.observable(false);
        this.links = ko.observable(false);

        this.pageRefresh = ko.observable(false);
        this.toggleContainers = ko.observable('body');
        this.toggleContainers.subscribe(function (container) {
            if (container === 'info' && this.info()) {
                this.info().refresh();
            } else if (container === 'log' && this.log()) {

            }
        }, this);
        this.showNotification = function () {
        };
        this.imgError = function (data, event) {
            $(event.target).prop({
                'src': '',
                'width': '92'
            });
        };

        this.posterClick = function (d, e) {
            _console.debug('posterClick', d, e);
            if (!$page.player())return;
            $page.player().play();
        };
        this.currentAsset = ko.observable(false);
        this.currentAsset.subscribe(function (asset) {
            if (!this.player())return;
            this.player().asset(asset);
        }, this);
        this.getAsset = $.noop;
        this.getNextAsset = $.noop;

        Object.defineProperties(this, {
            layout: _define(new Layout(this))
        });
        this.console = null;

        setTimeout(function () {
            window.$PAGE_WAIT.trigger(window.$PAGE_WAIT.PAGE);
        }, 1);
    }


    /**
     * Create ViewModel prototype object and non-enumerable properties
     * @description Create single inheritance,
     * currently to itself but possible override to $ndp console & utilities functions
     * all properties are non-enumerable, non-writable, and non-configurable
     * with the exception of the 'timestamp' that is enumerable only
     * @type {Object}
     */
    ViewModel.prototype = Object.create({
        constructor: ViewModel
    }, {
        timestamp: {value: Date.now()}
        , data: _define(new DataConfigurationModel())

        , detect: {value: new Detection()}

        , utils: _define(new UtilsModel())

        , modules: {value: new ModuleViewModel()}

        , init: _define(init)
    });

    return ViewModel;

    function init() {
        _console.log('Initializing ViewModel');
        setTimeout(function () {
            window.$PAGE_WAIT.trigger(window.$PAGE_WAIT.UTILS);
        }, 1);
        var _this = this;

        this.layout.init();
        Object.defineProperties(this, {
            console: _define(new gFunctions.PageConsole(this))
        });

        window.$PAGE_WAIT.trigger(window.$PAGE_WAIT.CONSOLE);
        window.$REQUEST_FRAME.start();
        setTimeout(function () {
            _this.modules.init();
        }, 1);
    }

    function _define(obj) {
        return {
            value: obj,
            enumerable: true
        }
    }

});