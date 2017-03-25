/**
 * page file for ndp-video-spa on 16-Mar-16.
 */

define('info-page', ['jquery', 'knockout'], function ($, ko) {
    var page = $page,
        _data = page.data,
        utils = page.utils,
        _console = window.$page.console.getInstance('Information Page');

    function PageInformation(parent) {

        Object.defineProperties(this, {
            parent: {
                get: function () {
                    return parent;
                }
            }
        });

        this.ndp = ko.observable(false);
        this.ndp.subscribe(function (obj) {
            this.lastUpdated(utils.getTimeString());
        }, this);

        this.detect = ko.observable(false);
        this.detect.subscribe(function (obj) {
            this.lastUpdated(utils.getTimeString());
        }, this);

        this.urlLocation = ko.observable(location.href);
        this.urlLocation.subscribe(function (_text) {
            this.lastUpdated(utils.getTimeString());
        }, this);

        this.lastUpdated = ko.observable(utils.getTimeString());

        this.htmlPrint = ko.computed(function () {
            return {
                ndp: utils.printHTML(this.ndp()),
                detect: utils.printHTML(this.detect())
            };

        }, this).extend({rateLimit: 200});

        var _this = this;
        this.refresh = function () {
            _this._refresh();
        };

        this.copyContent = function (d, e) {
            var input = document.getElementById('info-page-urlLocation');
            if (!input)return;
            var success = _copyURLSelection(input);

            if (!!success) {
                var $button = $(e.target);
                $button.text('Copied!').addClass('success');
                setTimeout(function () {
                    $button.text('Copy').removeClass('success');
                }, (10 * 1000));
            }
        };
    }

    PageInformation.prototype = Object.create({
        constructor: PageInformation
    }, {
        timestamp: {value: Date.now()}
        , init: {value: init}
        , _refresh: {value: refresh}
        , getNdpConfig: {value: getNdpConfig}
        , updateDetectConfig: {value: updateDetectConfig}
        , getUrlLocation: {value: getUrlLocation}
    });

    return PageInformation;

    function init() {
        page.detect.addCallbackDetection(this.updateDetectConfig());
        this.getNdpConfig();
    }

    function refresh() {
        this.getNdpConfig();
        this.updateDetectConfig();
        this.getUrlLocation();
    }

    function getNdpConfig() {
        if (window['$ndp']) {
            var obj = {
                configuration: $ndp.configuration,
                datastore: $ndp.dataStore
            };
            this.ndp(obj);
        }

    }

    function updateDetectConfig() {
        var obj = {},
            attr = $('html').attr('class');
        attr = attr.trim();

        var det = page.detect;
        obj.SYSTEM_DETECT = {
            HTML5: det.HTML5,
            AUTOPLAY: det.AUTOPLAY,
            HTML: attr.split(' ')
        };

        var detV = det.HTML5VIDEO;
        obj.SYSTEM_DETECT.HTML5VIDEO = {
            'canPlay': Boolean(detV)
        };
        if(Boolean(detV)) {
            for (var prop in detV) {
                obj.SYSTEM_DETECT.HTML5VIDEO[prop] = detV[prop];
            }
        }

        var detF = det.FLASH;
        obj.SYSTEM_DETECT.FLASH = {
            'hasFlash': Boolean(detF),
            blocked: detF.blocked,
            version: detF.version,
            legacy: detF.legacy
        };

        this.detect(obj);
    }

    function getUrlLocation() {
        this.urlLocation(_data.href);
    }

    function _copyURLSelection(input) {
        var orgSelectStart = input.selectionStart,
            orgSelectEnd = input.selectionEnd,
            currentFocus = document.activeElement;

        input.focus();
        input.setSelectionRange(0, input.value.length);

        var succeed;
        try {
            succeed = document.execCommand("copy");
        } catch (e) {
            succeed = false;
            _console.error('Attempts to copy URL Location has failed', e);
        }

        // restore original focus
        if (currentFocus && typeof currentFocus.focus === "function") {
            currentFocus.focus();
        }

        // restore prior selection
        input.setSelectionRange(orgSelectStart, orgSelectEnd);
        return succeed;
    }

});