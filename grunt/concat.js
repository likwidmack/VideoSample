/**
 * concat file for ndp-video-spa on 16-Mar-16.
 */
module.exports = function (grunt, opt) {
    var path = 'app/scripts/',
        data = path + 'data/',
        configuration = data + "configuration/",
        console = data + 'console/',
        moduleMgmt = data + 'module/',
        utils = data + "utils/";

    var modulePath = path + 'modules/',
        assets = modulePath + 'assets/',
        info = modulePath + 'info/',
        links = modulePath + 'links/',
        log = modulePath + 'log/',
        panel = modulePath + 'panel/',
        player = modulePath + 'player/';

    var bower = 'bower_component/';

    return {
        options: {
            separator: '\n',
            process: function (src, filepath) {
                return '\n/**\n * SOURCE: ' + filepath + '\n*/\n' + src;
            }
        },
        configuration: {
            files: {
                'dist/configuration/_events.js': [data + 'events/**.js']
                , 'dist/configuration/abstracts.js': [data + 'abstracts/**.js']
                , "dist/configuration/module-management.js": [
                    moduleMgmt + 'views.js',
                    moduleMgmt + 'management.js',
                    moduleMgmt + 'viewmodel.js'
                ]
                , "dist/configuration/utils.js": [
                    utils + 'detect.js',
                    utils + 'models.js',
                    utils + 'utils.js'
                ]
                , "dist/configuration/console.js": [
                    console + 'console.js',
                    console + 'page.js'
                ]
                , "dist/configuration/configuration.js": [
                    configuration + 'asset-configuration.js',
                    configuration + 'preset-configuration.js',
                    configuration + 'data-property-triggers.js',
                    configuration + 'data-property-configuration.js'
                ]
            }
        },
        modules: {
            files: {
                'dist/modules/panel.js': [
                    panel + 'models/**.js',
                    panel + 'items.js',
                    panel + 'viewmodel.js'
                ]
                , 'dist/modules/assets.js': [
                    assets + 'models/**.js',
                    assets + 'get-assets.js',
                    assets + 'viewmodel.js'
                ]
                , 'dist/modules/info.js': [
                    info + 'configuration.js',
                    info + 'labels.js',
                    info + 'page.js',
                    info + 'viewmodel.js'
                ]
                , 'dist/modules/links.js': [
                    links + '**.js'
                ]
                , 'dist/modules/log.js': [
                    log + 'models/**.js',
                    log + 'logging.js',
                    log + 'notification.js',
                    log + 'performance.js',
                    log + 'viewmodel.js'
                ]
                , 'dist/modules/player.js': [
                    player + 'events/pdk.js'
                    , player + 'events/native.js'
                    , player + 'events/ndp.js'
                    , player + 'events/player.js'
                    , player + 'models/event.js'
                    , player + 'models/player.js'
                    , player + 'viewmodel.js'
                ]
                , 'dist/modules/player/controlrack.js': [player + 'controlrack.js']
                , 'dist/modules/player/baseline.js': [player + 'baseline/base.js']
                , 'dist/modules/player/baseline/fw_ads.js': [player + 'baseline/fw_ads.js']
                , 'dist/modules/player/baseline/hls.js': [player + 'baseline/hls.js']
                , 'dist/modules/player/baseline/native.js': [player + 'baseline/native.js']
                , 'dist/modules/player/baseline/pdk.js': [player + 'baseline/pdk.js']
            }
        }
    }
};