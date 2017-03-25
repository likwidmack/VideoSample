/**
 * viewmodel file for ndp-video-spa on 27-Apr-16.
 */


require([
    'jquery',
    'knockout',
    'info-page',
    'info-labels',
    'info-config'
], function ($, ko, PageInformation, Labels, Configuration) {
    var $AbstractModule = window.$GLOBAL_FUNCTIONS.AbstractModule;

    var wait = window.$PAGE_WAIT,
        _data = window.$page.data,
        utils = window.$page.utils,
        variables = window.$GLOBAL_PARAM,
        _console = window.$page.console.getInstance('Information ViewModel');

    function InfoViewModel(moduleName) {
        $AbstractModule.call(this, moduleName || 'info');

        this.headerLabels = ko.observable(false);
        this.headerLabels.subscribe(function () {
            if (window['Foundation']) Foundation.reInit('responsive-toggle');
            _console.log('Header Labels Update', ko.toJS(arguments[0]));
        });

        Object.defineProperties(this, {
            labels: {
                value: new Labels(this),
                enumerable: true
            }
            , configuration: {
                value: new Configuration(this),
                enumerable: true
            }
            , page: {
                value: new PageInformation(this),
                enumerable: true
            }
        });

    }

    InfoViewModel.prototype = Object.create($AbstractModule.prototype, {
        updateHeader: {value: updateHeader}
        , start: {value: startOverride}
        , stop: {value: stopOverride}
        , refresh: {value: refresh}
        , handler: {value: wait.debounce(handler, 100, 'InformationDataHandler')}
        , LabelModel: {
            value: LabelModel,
            enumerable: true
        }
    });

    window.$page.modules.add({
        module: 'info',
        constructor: InfoViewModel,
        html: 'html-info'
    });

    function startOverride(deferTimeout) {
        $AbstractModule.prototype.start.call(this, deferTimeout);

        this.updateHeader();
        this.labels.build();
        this.configuration.init();
        this.page.init();

        this.addListener((Object.keys(variables.$DATA2GLOBAL)), this.handler, this);
    }

    function stopOverride() {
        this.removeListener((Object.keys(variables.$DATA2GLOBAL)), this.handler, this);
        this.headerLabels(false);

        $AbstractModule.prototype.stop.call(this);
    }

    function updateHeader() {
        this.headerLabels(new HeaderLabelModel());
    }

    function refresh() {
        this.page.refresh();
        this.configuration.refresh();
    }

    function LabelModel(name, value) {
        this.id = 'info-label_' + name;
        this.name = name;
        this.title = name.toUpperCase();
        this.value = value;
        this.css = ['info-label-default'];
        this.datatype = utils.identifyObject(value);
    }


    function handler(e) {
        var LabelModel = this.LabelModel;
        this.labels.update(new LabelModel(e.type, _data[e.type]));
    }

    function HeaderLabelModel() {
        this.debug = ko.observable(new LabelModel('debug', _data.debug));
        this.preset = ko.observable(new LabelModel('preset', _data.preset));
        this.branch = ko.observable(new LabelModel('branch', _data.branch));
        this.player = ko.observable(new LabelModel('player', _data.player));
        this.brand = ko.observable(new LabelModel('brand', _data.brand));
        this.adblock = ko.observable(new LabelModel('adblock', !variables.$PAGE_ADBLOCK));
    }

});