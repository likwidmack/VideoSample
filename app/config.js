/**
 * index file for ndp-video-spa on 16-Mar-16.
 * http://stackoverflow.com/questions/35424053/what-are-the-differences-between-normal-and-slim-package-of-jquery
 * https://github.com/requirejs/example-multipage
 * http://www.sitepoint.com/understanding-requirejs-for-effective-javascript-module-loading/
 * https://coderwall.com/p/u8xgvq/requirejs-basic-introduction
 */

(function () {
    var debug = window.$GLOBAL_PARAM.$NDP_DEBUG ? 'js/debug' : 'js';
    var modules = debug + '/modules';
    var data = debug + '/data';
    var player = modules + '/player';
    var baseline = player + '/baseline';

    require.config({
        baseUrl: './',
        paths: {
            // data files
            'data': debug + '/data',
            'configuration': data + '/configuration',
            'ko-extended': data + '/ko',

            'modules': debug + '/modules',
            'assets': modules + '/assets',
            'info': modules + '/info',
            'links': modules + '/links',
            'log': modules + '/log',
            'panel': modules +  '/panel',
            'player': modules + '/player',

            // player folder Extended
            'player-frameworks': player + '/frameworks',
            'player-baseline': player + '/baseline',
            'player-baseline-pdk': baseline + '/pdk',
            'player-baseline-native': baseline + '/native',
            'player-baseline-hls': baseline + '/hls',
            'player-baseline-fw_ads': baseline + '/fw_ads',

            // view script files
            'views': debug + '/views',

            'html-player': '/views/modules/player/player.html',
            'html-assets': '/views/modules/assets/view.html',
            'html-info': '/views/modules/info/view.html',
            'html-log': '/views/modules/log/view.html',
            'html-panel': '/views/modules/panel/control_panel.html',


            // 3rd party libs
            'text': '/libs/text/text',
            'plugins': '/libs/durandal/js/plugins',
            'transitions': '/libs/durandal/js/transitions',
            'backbone': '/libs/backbone/backbone',
            'angular': '/libs/angular/angular',
            'knockout': '/libs/knockout/dist/knockout',
            'foundation': '/libs/foundation-sites/dist/js/foundation',
            'jquery': '/libs/jquery/dist/jquery',
            'jquery-slim': '/libs/jquery/dist/jquery.slim',
            'jquery-ui': '/libs/jquery-ui/jquery-ui',
            'underscore': 'libs/underscore/underscore'
        },
        shim: {
            'jquery': {exports: '$'},
            'underscore': {exports: '_'},
            'knockout': {exports: 'ko'},
            'ko-extended': {
                deps: ['knockout']
            },
            'foundation': {
                deps: ['jquery'],
                exports: 'jQuery'
            },
            'jquery-ui': {
                deps: ['jquery'],
                exports: 'jQuery'
            },
            'configuration': {
                deps: ['jquery', 'knockout']
            }
        },
        config: {
            text: {
                onXhr: function (xhr, url) {
                    console.log("XMLHttpRequest onXhr data: ", arguments);
                },
                onXhrComplete: function (xhr, url) {
                    console.log("XMLHttpRequest onXhrComplete data: ", arguments);
                }
            }
        }
    });

})();
