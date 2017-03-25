/**
 * viewmodel file for ndp-video-spa on 27-Apr-16.
 */


require(['knockout', 'jquery', 'log-logging', 'log-notification', 'log-performance'],
    function (ko, $, LoggingModel, NotificationModel, PerformanceModel) {
        var $AbstractModule = window.$GLOBAL_FUNCTIONS.AbstractModule;

        var page = $page,
            data = page.data,
            variables = window.$GLOBAL_PARAM,
            _console = window.$page.console.getInstance('Log Viewmodel');

        function LogViewModel(moduleName) {
            $AbstractModule.call(this, moduleName || 'log');
            this.logging = ko.observable(false);
            this.notification = ko.observable(false);
            this.performance = ko.observable(false);

            this.storageOptions = ko.observableArray(['logging','notification','performance']);
            this.filterBy = ko.observable();
        }

        LogViewModel.prototype = Object.create($AbstractModule.prototype, {
            init: {value: init}
            , start: {value: startOverride}
            , stop: {value: stopOverride}
            , storage:{
                get:function(){
                    return window.$GLOBAL_PARAM.$LOG_STORAGE;
                }
            }
        });

        window.$page.modules.add({
            module: 'log',
            constructor: LogViewModel,
            html: 'html-log'
        });

        function init() {
            if(this.logging()){
                this.logging().start();
            }

        }

        function startOverride(deferTimeout) {
            $AbstractModule.prototype.start.apply(this, arguments);

            this.logging(new LoggingModel(this));
            this.notification(new NotificationModel(this));
            this.performance(new PerformanceModel(this));
            this.init();
        }

        function stopOverride() {
            $AbstractModule.prototype.stop.call(this);

        }
    });