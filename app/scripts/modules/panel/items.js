/**
 * control_panel_items file for ndp-video-spa on 22-Mar-16.
 */

define('panel-items', [
    'knockout',
    'panel-assetItems-model',
    'panel-checkedItem-model',
    'panel-inputItem-model',
    'panel-selectItem-model'
], function (ko, assetItems, checkedItem, inputItem, selectItem) {
    Date = window.Date;

    var _data = window.$page.data,
        utils = window.$page.utils,
        _console = window.$page.console.getInstance('Control Panel ITEMS');

    var debugModeOptions = [
        {id: 0, label: 'NONE [0]'},
        {id: 1, label: 'Error Only [1]'},
        {id: 2, label: 'Info & Warn [1, 2]'},
        {id: 3, label: 'Full Logging [1, 2, 3]'},
        {id: 4, label: 'Full Logging [1, 2, 3] & Storage'}
    ];
    var brandOptions = [
        {id: 'today', label: 'Today.com'}
        , {id: 'nbcnews', label: 'NBCNews.com'}
        , {
            id: 'msnbc',
            label: 'MSNBC.com (Currently Unavailable)',
            enable: false
        }
    ];
    var presetOptions = [
        {id: false, label: 'None'}
        , {id: 'dev', label: 'Development'}
        , {id: 'qa', label: 'QA'}
        , {id: 'clean', label: 'Clean'}
        , {id: 'perf', label: 'Performance'}
        , {id: 'baseline', label: 'Baseline'}
    ];
    var branchOptions = [
        {id: 'dev', label: 'Development'}
        , {id: 'qa', label: 'QA'}
        , {id: 'stage', label: 'Staging'}
        , {id: 'hotfix', label: 'Hotfix'}
        , {id: 'local', label: 'Local Env'}
        , {id: 'custom', label: 'Custom'}
        , {id: 'prod', label: 'Production'}
        , {id: 'baseline', label: 'Baseline'}
    ];
    var pdkOptions = [
        {id: false, label: 'Choose'}
        , {id: 'v5_6_18', label: '5.6.18'}
        , {id: 'v5_6_17', label: '5.6.17'}
        , {id: 'v5_6_15', label: '5.6.15'}
        , {id: 'v5_6_12', label: '5.6.12'}
        , {id: 'v5_6_9', label: '5.6.9'}
        , {id: 'v5_6_7', label: '5.6.7'}
        , {id: 'v5_6_5', label: '5.6.5'}
        , {id: 'v5_6_3', label: '5.6.3'}
        , {id: 'v5_6_1', label: '5.6.1'}
        , {id: 'v5_5_6', label: '5.5.6'}
    ];
    var playerOptions = [
        {id: 'native', label: 'Native (HTML5, Mobile)'}
        , {id: 'hls', label: 'HLS (HTML5, Live)'}
        , {id: 'pdk', label: 'PDK (Flash)'}
        , {
            id: 'legacy',
            label: 'PDK-Legacy (IE legacy)',
            enable: false
        }
    ];
    var continuousOptions = [
        {id: 0, label: 'Off'}
        , {id: 1, label: 'Internal Playlist'}
        , {id: 2, label: 'Asset to Asset'}
    ];


    function ControlPanelItems(parent) {
        //NDP
        this.ads = new checkedItem({
            name: 'ads',
            label: 'Show Ads',
            value: _data.ads
        }, function (_bool) {
            _data.ads = _bool;
        });

        this.controlrack = new checkedItem({
            name: 'controlrack',
            label: 'Control Rack',
            value: _data.controlrack
        }, function (_bool) {
            _data.controlrack = _bool;
        });

        this.debug = new checkedItem({
            name: 'debug',
            label: 'Enable Debug',
            value: _data.debug
        }, function (_bool) {
            _data.debug = _bool;
            parent.enableDebugMode(_bool);
        });

        this.mode = new selectItem({
            type: 'radio',
            name: 'mode',
            header: 'Select Debug Mode'
        }, debugModeOptions, _data.mode, function (selected) {
            _data.mode = selected.value;
        });

        this.version = new inputItem('text', 'version', 'NDP/Branch Version (Edit for Production OR Custom Only)',
            _data.version || '', function (_string) {
                _data.version = _string;
            });


        //Page
        this.preset = new selectItem({
            type: 'radio',
            name: 'preset',
            header: 'Select Page Preset'
        }, presetOptions, _getIndex(_data.preset, presetOptions), function (selected) {
            _data.preset = selected.value;
        });

        /*this.async = new checkedItem({
         name: 'async',
         label: 'Asynchronous File Loading',
         value: _data.async
         }, function (_bool) {
         _data.async = _bool;
         });*/

        this.brand = new selectItem({
            type: 'radio',
            name: 'brand',
            header: 'Select UX Brand'
        }, brandOptions, _getIndex(_data.brand, brandOptions), function (selected) {
            _data.brand = selected.value;
        });

        /*this.merged = new checkedItem({
         name: 'merged',
         label: 'Merged',
         value: _data.merged
         }, function (_bool) {
         _data.merged = _bool;
         parent.enableBranch(_bool);
         });*/

        this.branch = new selectItem({
            type: 'select',
            name: 'version',
            header: 'Select Version/Branch of Player'
        }, branchOptions, _getIndex(_data.branch, branchOptions), function (selected) {
            var ifExtended = utils.has(selected.value, ['prod', 'custom', 'local']);
            if (!ifExtended) _data.branch = selected.value;
            parent.enableVersion(ifExtended);
        });


        //Player
        this.autoplay = new checkedItem({
            name: 'autoplay',
            label: 'Autoplay',
            value: _data.autoplay
        }, function (_bool) {
            _data.autoplay = _bool;
        });

        this.pdk = new selectItem({
            type: 'select',
            name: 'pdk',
            header: 'Select PDK Version'
        }, pdkOptions, _getIndex(_data.pdk, pdkOptions), function (selected) {
            _data.pdk = selected.value;
        });

        this.player = new selectItem({
            type: 'radio',
            name: 'player',
            header: 'Select NDP Player Type'
        }, playerOptions, _getIndex(_data.player, playerOptions), function (selected) {
            _data.player = selected.value;
            var isPDK = parent.isPDK;

            parent.enableControlRack(!isPDK);
            parent.enablePdkVersion(isPDK);
        });

        //Playlist
        this.assets = new assetItems();

        this.live = new checkedItem({
            name: 'live',
            label: 'Is Live Video',
            value: _data.live
        }, function (_bool) {
            _data.live = _bool;
        });

        this.continuous = new checkedItem({
            name: 'continuous',
            label: 'Continuous Play',
            value: _data.continuous
        }, function (_bool) {
            _data.continuous = _bool;
        });

    }

    ControlPanelItems.prototype = Object.create({
        constructor: ControlPanelItems
    }, {});

    return ControlPanelItems;

    function _getIndex(obj, array, _default) {
        var len = array.length;
        while (len--) {
            if ((array[len]).id == obj)return len;
        }
        return _default || 0; //if not found default to first choice
    }

});