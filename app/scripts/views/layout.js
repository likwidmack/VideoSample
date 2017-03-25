/**
 * layout file for ndp-video-spa on 01-Apr-16.
 */

define(['jquery', 'knockout'], function ($, ko) {
    Date = window.Date;
    var wait = window.$PAGE_WAIT,
        _console = window.console;

    wait.on(wait.CONSOLE, function () {
        _console = window.$page.console.getInstance('Page Layout');
        _console.log('Wait Condition Initialized :: window.$page.console', Date.now());
    });

    /***
     * Knockout components & layouts create/updated here
     * @constructor
     */
    function LayoutModel(parent) {
        this.show_panel = ko.observable(false);
        this.show_info = ko.observable(false);
        this.show_player = ko.observable(false);
        this.show_assets = ko.observable(false);
        this.show_links = ko.observable(false);
        this.show_log = ko.observable(false);

        // options :: ['body','panel_container','info_container','log_container']
        this.activeContainer = ko.observable('body');
        this.activeContainer.subscribe(function (selection) {
            parent.toggleContainers(selection);
            _console.log('activeContainer', selection);
        });

        this.css_log = ko.computed(_cssFn('show_log', 'log'), this);
        this.css_info = ko.computed(_cssFn('show_info', 'info'), this);
        this.css_panel = ko.computed(_cssFn('show_panel', 'panel'), this);

        // Main/Primary body, never fully closes or hides
        // two modes: full or compact
        this.css_body = ko.computed(function () {
            if (!(this.show_player()) && !(this.show_assets()))return 'hide';
            if (this.activeContainer() === 'body') {
                return 'columns';
            }
            return 'small-12 medium-4 large-3 columns';
        }, this);
        this.css_player = ko.computed(function(){
            var cssClass = 'columns',
                show = this.show_player(),
                active = this.activeContainer();
            if (show && (active === 'body')) {
                cssClass = 'small-12 large-8 xlarge-9 columns';
            }else if(!show){cssClass = 'hide';}
            return cssClass;

        },this);
        this.css_assets = ko.computed(function(){
            var cssClass = 'hide',
                show = this.show_assets(),
                active = this.activeContainer();
            if (show && (active === 'body')) {
                cssClass = 'small-12 large-4 xlarge-3 columns';
            }
            return cssClass;

        },this);

        Object.defineProperties(this, {
            parent: {
                get: function () {
                    return parent;
                }
            }
            , cssLink: {
                value: {
                    body: _csslinkFn('body', this),
                    log: _csslinkFn('log', this),
                    info: _csslinkFn('info', this),
                    panel: _csslinkFn('panel', this)
                },
                enumerable: true
            }
        });


        this.containerLink = function (d, e) {
            var input = (e.target.id).split('-')[1];
            d.activeContainer(input);
        };
    }

    LayoutModel.prototype = Object.create({
        constructor: LayoutModel
    }, {
        timestamp: {value: Date.now()}
        , init: {value: init}
        , view: {value: view}
        , toggle: {
            value: {
                panel: null,
                info: null,
                player: null,
                log: null
            }
        }
    });

    return LayoutModel;

    function init() {
    }

    function view(module, _bool) {
        _console.log('Module View Update ::', module, _bool);
        var propertyName = 'show_' + module;
        this[propertyName](_bool);
    }

    function _csslinkFn(container, owner) {
        var _container = (container === 'body') ? 'player' : container;
        return ko.computed(function () {
            if (!(this['show_' + _container]())) return 'hide';
            if (this.activeContainer() === container) return 'active';
            return false;
        }, owner);
    }

    function _cssFn(showModule, container) {
        return function () {
            var cssClass = 'hide',
                show = this[showModule](),
                active = this.activeContainer();
            if (show && (active === container)) {
                cssClass = 'small-12 medium-8 large-9 columns';
            }
            return cssClass;
        };
    }

});