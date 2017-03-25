/**
 * control_panel file for ndp-video-spa on 16-Mar-16.
 */
require(['jquery', 'knockout', 'panel-items'], function ($, ko, PanelItems) {
    Date = window.Date;
    var $AbstractModule = window.$GLOBAL_FUNCTIONS.AbstractModule;
    var _console = window['console'];
    window.$PAGE_WAIT.on($PAGE_WAIT.CONSOLE, function () {
        _console = window.$page.console.getInstance('Control Panel');
        _console.log('Wait Condition Initialized :: window.$page.console', Date.now());
    });

    var _data = window.$page.data,
        utils = window.$page.utils,
        variables = window.$GLOBAL_PARAM;

    function PanelModel(moduleName) {
        $AbstractModule.call(this, moduleName || 'panel');

        this.enableDebugMode = ko.observable();
        this.enableDebugMode.subscribe(function (_bool) {
            var mode = this.items.mode;
            mode.selected(mode.options()[(_bool ? _data.mode : 0)]).enable(_bool);
        }, this);

        this.enableVersion = ko.observable();
        this.enableVersion.subscribe(function (_bool) {
            var num = this.items.version;
            num.enable(_bool).value(_data.version || '');
        }, this);

        this.enableControlRack = ko.observable();
        this.enableControlRack.subscribe(function (_bool) {
            var rack = this.items.controlrack;
            rack.enable(_bool).value(_data.controlrack);
        }, this);

        this.enablePdkVersion = ko.observable();
        this.enablePdkVersion.subscribe(function (_bool) {
            var pdk = this.items.pdk;
            pdk.enable(_bool);
            if (!_bool) {
                pdk.selected(pdk.options()[0]);
            } else {
                pdk.selected(pdk.options()[1]);
            }
        }, this);

        this.items = new PanelItems(this);

        this.toggleFieldset = function (d, e) {
            $(e.target).next('div.toggle-section').slideToggle(200);
        };

    }

    PanelModel.prototype = Object.create($AbstractModule.prototype, {
        start: {value: startOverride}
        , stop: {value: stopOverride}
        , handler: {value: window.$PAGE_WAIT.debounce(handler, 100, 'ControlPanelDataHandler')}
        , isPDK:{
            get:function(){
                return (_data.player !== 'native' && _data.player !== 'hls')
            }
        }
    });

    window.$page.modules.add({
        module: 'panel',
        constructor: PanelModel,
        html: 'html-panel'
    });

    function startOverride(deferTimeout) {
        $AbstractModule.prototype.start.call(this, deferTimeout);

        this.enableDebugMode(_data.debug);
        this.enableVersion(utils.has(_data.branch,['prod','custom','local']));
        this.enableControlRack(!this.isPDK);
        this.enablePdkVersion(this.isPDK);

        this.addListener(Object.keys(variables.$DATA2GLOBAL), this.handler, this);
    }

    function stopOverride() {
        this.removeListener(Object.keys(variables.$DATA2GLOBAL), this.handler, this);

        $AbstractModule.prototype.stop.call(this);
    }

    function handler(e) {
        var wait = window.$PAGE_WAIT;

        var key, item, data;
        var dataProperty = (Object.keys(variables.$DATA2GLOBAL)),
            len = dataProperty.length;

        while (len--) {
            key = dataProperty[len];
            item = this.items[key];
            data = _data[key];
            //this.selected(this.options()[selectedIndex]);

            switch (key) {
                case 'debug':
                case 'controlrack':
                case 'ads':
                case 'autoplay':
                case 'live':
                case 'version':
                case 'continuous':
                    if (item.value() != data) {
                        item.value(data);
                        _console.debug(wait.PANEL + '_data_' + key);
                    }
                    break;
                case 'mode':
                case 'branch':
                case 'brand':
                case 'player':
                case 'pdk':
                case 'preset':
                    if (item.selected() && data != item.selected().value) {
                        var index = _getIndex(data, item.options(), -1);
                        if (index > -1) item.selected(item.options()[index]);
                        _console.debug(wait.PANEL + '_data_' + key);
                    }
                    break;
                case 'assets':
                    if (data.length && (data.raw != item.listItems())) {
                        _console.warn(wait.PANEL + '_data_' + key, data.raw);
                        item.dataAssets(data.raw);
                        item.listItems(data.raw);
                    }
                    break;
            }
        }
    }

    function _getIndex(obj, array, _default) {
        var len = array.length;
        while (len--) {
            if ((array[len]).value == obj)return len;
        }
        return _default || 0; //if not found default to first choice
    }

});