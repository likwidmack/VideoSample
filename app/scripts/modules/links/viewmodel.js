/**
 * list file for ndp-video-spa on 01-Apr-16.
 */

require(['knockout'], function (ko) {
    Date = window.Date;

    var _console = window.$page.console.getInstance('Links Viewmodel');
    var $AbstractModule = window.$GLOBAL_FUNCTIONS.AbstractModule;

    function LinksModel(moduleName) {
        $AbstractModule.call(this, moduleName || 'links');

        this.drilldownLinks = ko.observableArray([]);
        this.drilldownLinks.subscribe(function () {
            _console.debug('drilldownLinks', arguments);
            if (window['Foundation']) {
                setTimeout(function(){
                    _console.debug('ReInit Foundation dropdown menu');
                    Foundation.reInit('dropdown-menu');
                }, 500);
            }
        });
    }

    LinksModel.prototype = Object.create($AbstractModule.prototype, {
        start: {value: startOverride}

        , presets: {
            value: [
                new linkModel('Clean', 'http://ndp-spa.herokuapp.com/?preset=clean', '_top')
                , new linkModel('QA', 'http://ndp-spa.herokuapp.com/?preset=qa', '_top')
                , new linkModel('DEV', 'http://ndp-spa.herokuapp.com/?preset=dev', '_top')
                , new linkModel('Perf', 'http://ndp-spa.herokuapp.com/?preset=perf', '_top')
                , new linkModel('Baseline', 'http://ndp-spa.herokuapp.com/?preset=baseline', '_top')
            ],
            enumerable: true
        }

        , prod_links: {
            value: [
                new linkModel('Today', 'http://www.today.com/video')
                , new linkModel('NBC News', 'http://www.nbcnews.com/video')
                , new linkModel('MSNBC', 'http://www.msnbc.com/')
            ],
            enumerable: true
        }

        , head_links: {
            value: [
                new linkModel('NDP WIKI', 'https://nbcnewsdigital.atlassian.net/wiki/display/NEWSVIDEO/NEWS+Video+Home')
                , new linkModel('NDP Video Player GitHub', 'https://github.com/nbcnews/video-player')
                , new linkModel('NDP SPA GitHub', 'https://github.com/nbcnews/ndp-video-spa')
            ],
            enumerable: true
        }

        , foot_reference: {
            value: [],
            enumerable: true
        }
    });

    window.$page.modules.add({
        module: 'links',
        constructor: LinksModel,
        html: false
    });

    function startOverride(deferTimeout) {
        $AbstractModule.prototype.start.call(this, deferTimeout);
        var arr = [];
        arr.push(new drilldownModel('Presets', this.presets), new drilldownModel('Production', this.prod_links));
        this.drilldownLinks(arr.concat(this.head_links));
    }

    /**
     *
     * @param title
     * @param array
     */
    function drilldownModel(title, _array) {
        this.title = title;
        this.links = _array;
    }

    /**
     * Link model for the link module
     * @param name
     * @param link
     * @param target
     */
    function linkModel(name, link, target) {
        this.name = name || 'No Name';
        this.href = link || '#';
        this.target = target || '_blank';
    }
});