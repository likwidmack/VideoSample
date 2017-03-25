/**
 * global file for ndp-video-spa on 16-Mar-16.
 * presets and global variables that will be shared on all pages
 */

(function () {
    var _console = window['console'];

    function _decode(str) {
        var txt = document.createElement("textarea");
        txt.innerHTML = decodeURIComponent(str);
        if (!(typeof txt.value === 'string')) {
            txt.value = '';
            _console.warn('object IS NOT a string in _decode.');
        }
        str = (txt.value).toString();
        delete txt;
        return str;
    }

    function retDefault(_object, defValue) {
        if (!!_object) return _object;
        return defValue || false;
    }

    function isUndef(_object) {
        return typeof _object === 'undefined';
    }

    var jsonString = _decode(window.$GLOBAL_PARAM.$DATASTRING);
    jsonString = jsonString.length ? JSON.parse(jsonString) : {};
    delete window.$GLOBAL_PARAM.$DATASTRING;

    _console.debug('JSON STRING QUERY', jsonString);

    var page = window.$GLOBAL_PARAM = window.$GLOBAL_PARAM || {};
    page.$NDP_DEBUG = jsonString.debug || 0;
    page.$NDP_DEBUG_MODE = testDebugMode(jsonString.debugMode) || 0;
    page.$NDP_VERSION = jsonString.version || false;
    page.$NDP_ADS = isUndef(jsonString.ads) ? 1 : jsonString.ads;
    page.$NDP_CONTROL_RACK = jsonString.controlRack || 0;

    page.$PLAYER_AUTOPLAY = jsonString.autoplay || 0;
    page.$PLAYER_TYPE = retDefault(jsonString.playerType, 'native');
    page.$PLAYER_PDK_VERSION = jsonString.pdkVersion || false;

    page.$PAGE_ASYNC = jsonString.async || 0;
    //page.$PAGE_MERGED = isUndef(jsonString.merged) ? 1 : jsonString.merged;
    page.$PAGE_BRAND = retDefault(jsonString.brand, 'nbcnews');
    page.$PAGE_BRANCH = retDefault(jsonString.branch, 'qa');
    page.$PAGE_PRESET = retDefault(jsonString.preset);
    page.$PAGE_ADBLOCK = window.hasOwnProperty('ndp_ADBLOCK') ? window.ndp_ADBLOCK : false;

    page.$PLAYLIST_CONTINUOUS = jsonString.continuous || 1;
    page.$PLAYLIST_LIVE = jsonString.live || 0;
    page.$PLAYLIST_ASSETS = [];

    page.$FWADS_VERSION = false;
    page.$LOG_STORAGE = {};
    page.$PAGE_STATIC = jsonString._page;
    page.$SYSTEM_ENVIRONMENT = jsonString._environment;
    page.$PAGE_SOURCEPATH = jsonString._page.sourcePath;

    page.isHTTPS = !!(window.location.protocol === 'https:');

    page.$MODULES = {};
    for (var prop in jsonString.modules) {
        page.$MODULES[prop] = jsonString.modules[prop];
    }

    page.$DATA2GLOBAL = {
        //merged: '$PAGE_MERGED',
        debug: '$NDP_DEBUG',
        mode: '$NDP_DEBUG_MODE',
        autoplay: '$PLAYER_AUTOPLAY',
        async: '$PAGE_ASYNC',
        continuous: '$PLAYLIST_CONTINUOUS',
        controlrack: '$NDP_CONTROL_RACK',
        live: '$PLAYLIST_LIVE',
        ads: '$NDP_ADS',
        player: '$PLAYER_TYPE',
        pdk: '$PLAYER_PDK_VERSION',
        brand: '$PAGE_BRAND',
        branch: '$PAGE_BRANCH',
        version: '$NDP_VERSION',
        assets: '$PLAYLIST_ASSETS',
        preset: '$PAGE_PRESET',
        modules: '$MODULES'
    };

    page.$GLOBAL2DATA = {};
    for (var prop in page.$DATA2GLOBAL) {
        page.$GLOBAL2DATA[page.$DATA2GLOBAL[prop]] = prop;
    }


    /*
     * wait_item_example
     * page.$WAIT_ITEMS['uniqueID'] = {
     *  condition: Function,
     *  callback: Function,
     *  status: Number
     * };
     */
    page.$WAIT_ITEMS = {};
    window.$PAGE_WAIT = {
        CONSOLE: 'console',
        PAGE: 'page',
        UTILS: 'utils',
        DATA: 'data',
        on: function _wait(eventType, callback) {
            var uniqueID = 'c_' + (Math.ceil(Math.random() * Date.now()));
            if (typeof eventType === 'string') {
                uniqueID = eventType;
            }

            if (!page.$WAIT_ITEMS.hasOwnProperty(uniqueID)) {
                page.$WAIT_ITEMS[uniqueID] = {
                    condition: false,
                    callbacks: []
                }
            }
            (page.$WAIT_ITEMS[uniqueID]).callbacks.push(callback);
            if (eventType instanceof Function) (page.$WAIT_ITEMS[uniqueID]).condition = eventType;
        }
    };


    window.$PAGE_WAIT.on(window.$PAGE_WAIT.CONSOLE, function () {
        _console = window.$page.console.getInstance('Global Variables & Functions');
        _console.log('Wait Condition Initialized :: window.$page.console', Date.now());
    });

    window.$PAGE_WAIT.on(window.$PAGE_WAIT.DATA, function () {
        if (window.$ASSET_CONFIGURATION instanceof Function)
            window.$ASSET_CONFIGURATION(page, jsonString);
    });

    /*
     // Only Chrome & Opera pass the error object.
     window.onerror = function (message, file, line, col, error) {
     _console.error(message, "from", error.stack);
     //alert(message);
     // You can send data to your server
     // sendError(data);
     };
     // Only Chrome & Opera have an error attribute on the event.
     window.addEventListener("error", function (e) {
     _console.error(e.error.message, "from", e.error.stack);
     //alert(e.error.message);
     // You can send data to your server
     // sendError(data);
     });
     */

    function testDebugMode(_object) {
        if (typeof _object !== 'string') return _object;
        return _object.split(',');
    }

})();