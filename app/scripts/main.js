/**
 * main file for ndp-video-spa on 21-Mar-16.
 */

require(['./config.js'], function () {
    document = window.document;
    var _console = window.console;
    _console.debug('Main.js Initialized');

    var wait = window.$PAGE_WAIT;
    wait.on(wait.CONSOLE, function () {
        _console = window.$page.console;
    });

    require([
        'jquery',
        'knockout',
        'foundation',
        'ko-extended',
        'configuration'
    ], function ($, ko) {

        _console.info('Data configuration ADDED', new Date().toLocaleString());
        _console.dir($);
        _console.debug('ko', ko);

        require(['data/viewmodel'],
            function (ViewModel) {
                window.$page = new ViewModel();
                _console.debug('window[$page]', window.$page);

                setTimeout(function () {
                    $(document).foundation();
                    window.$page.init();
                }, 1);

                $(function () {
                    ko.applyBindings(window.$page);
                    _console.debug('foundation initialized!');
                    $('#module_pages').removeClass('hide');
                });
            });
    });
});