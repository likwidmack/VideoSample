/**
 * configuration file for ndp-video-spa on 16-Mar-16.
 */

define('info-config', ['jquery', 'knockout'], function ($, ko) {
    Date = window.Date;
    var page = $page,
        _data = page.data,
        utils = page.utils,
        _console = window.$page.console.getInstance('Information Configuration');

    var protocol = location.protocol;
    var _cliendId = '',
        _geolocation = null,
        _clientInfo = {};

    function SystemConfiguration(parent) {

        Object.defineProperties(this, {
            parent: {
                get: function () {
                    return parent
                }
            }
        });

        this.user = ko.observable(false);
        this.user.subscribe(function (obj) {
            this.lastUpdated(utils.getTimeString());
        }, this);

        this.environment = ko.observable(window.$GLOBAL_PARAM.$SYSTEM_ENVIRONMENT);
        this.environment.subscribe(function (obj) {
            this.lastUpdated(utils.getTimeString());
        }, this);

        this.navigator = ko.observable(utils.cloneObjToJson(navigator));
        this.navigator.subscribe(function (obj) {
            this.lastUpdated(utils.getTimeString());
        }, this);

        this.geolocation = ko.observable(false);
        this.geolocation.subscribe(function (obj) {
            this.lastUpdated(utils.getTimeString());
        }, this);

        this.lastUpdated = ko.observable(utils.getTimeString());

        this.htmlPrint = ko.computed(function () {
            return {
                user: utils.printHTML(this.user()),
                environment: utils.printHTML(this.environment()),
                navigator: utils.printHTML(this.navigator()),
                geolocation: utils.printHTML(this.geolocation())
            };

        }, this).extend({rateLimit: 200});

        var _this = this;
        this.refresh = function () {
            _this._refresh();
        }
    }

    SystemConfiguration.prototype = Object.create({
        constructor: SystemConfiguration
    }, {
        timestamp: {value: Date.now()}
        , init: {
            value: init,
            enumerable: true
        }
        , _refresh: {value: refresh}
        , getUser: {value: getUser}
        , getGeolocation: {value: getGeolocation}
        , getNavigator: {value: getNavigator}
    });

    return SystemConfiguration;

    function init() {

        this.getGeolocation();
        this.getUser();
    }

    function refresh() {
        this.getGeolocation();
        this.getUser();
        this.getNavigator();
    }

    function getUser() {
        var _this = this;
        $.get(protocol + "//ipinfo.io", function (response) {
            //console.warn('ipinfo.io', response);
            _clientInfo = response;
            _cliendId = response.ip;
            _geolocation = response.loc;

            _this.user({
                info: response,
                ip: response.ip,
                location: response.loc
            })
        }, "jsonp");
    }

    function getGeolocation() {
        if (protocol === 'http:')return;
        var _this = this;
        var options = {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
        };

        navigator.geolocation.getCurrentPosition(success, error, options);

        function error(err) {
            _console.warn('ERROR(' + err.code + '): ' + err.message);
            _this.geolocation(false);
        }

        function success(position) {
            _console.info('GeoLocation', position);
            var crd = position.coords;
            _this.geolocation({
                lat: crd.latitude,
                long: crd.longitude,
                accuracy: crd.accuracy
            });
        }
    }

    function getNavigator() {
        this.navigator(utils.cloneObjToJson(navigator));
    }
});