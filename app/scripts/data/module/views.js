/**
 * File name: views, created on 05-May-16 in project, ndp-video-spa.
 */

define('module-html', ['knockout'], function (ko) {
    Date = window.Date;
    var wait = window.$PAGE_WAIT,
        _console = window.console;

    wait.on(wait.CONSOLE, function () {
        _console = window.$page.console.getInstance('Module Html Handler');
        _console.log('Wait Condition Initialized :: window.$page.console', Date.now());
    });

    var preset = function _preset() {
        var _this = this,
            _arguments = arguments;
        if (!(this.get).html) {
            setTimeout(function () {
                _preset.apply(_this, _arguments);
            }, 10);
            return;
        }

        _set.apply(_this, _arguments);
        Object.defineProperty(this, 'set', {
            value: _set
        });
    };

    function ModuleHtmlHandler(moduleName, path) {
        var _this = this;
        Object.defineProperties(this, {
            moduleName: _define(moduleName)
            , containerName: _define(moduleName + '_container')
            , path: _define(path)
            , html: {
                value: false,
                writable: true
            }
        });

        require(['text!' + this.path], function (html) {
            if (!!html)_this.html = html;
        }, function () {
            window.console.error('ERROR HTML', _this.moduleName, _this.path, arguments);
        });
    }

    ModuleHtmlHandler.prototype = Object.create({
        constructor: ModuleHtmlHandler
    }, {
        timestamp: {value: Date.now()}
        , remove: {value: remove}
        , toggle: {value: toggle}
        , set: {
            value: preset,
            configurable: true
        }
        , get: {
            get: function () {
                var parent = this.container,
                    hasChildren = parent && parent.children.length;
                return {
                    visible: !!hasChildren,
                    html: this.html
                }
            }
        }
        , container: {
            get: function () {
                return document.getElementById(this.containerName);
            }
        }
    });

    return ModuleHtmlHandler;

    function toggle(_bool) {
        var parent = this.container,
            hasChildren = parent && parent.children.length;
        if (!this.container)return false;

        if (typeof _bool === 'boolean') {
            if ((_bool && hasChildren) || (!_bool && !hasChildren))return true;
            _console.warn('HTML VIEWS', !!(_bool && hasChildren), (!_bool && !hasChildren), this);
            return this.set(_bool);
        }
        return this.set(!hasChildren);
    }

    function _set(condition) {
        //NOT READY FOR THIS
        // TODO: implement knockout rebinding after removing html
        return false;
        var parent = this.container;
        _console.warn('HTML VIEWS2 container', this.container);

        this.remove();

        if (condition && !!this.html) {
            var div = document.createElement('div');
            div.innerHTML = this.html;
            var len = div.children.length;
            while (len--) {
                parent.appendChild(div.children[len]);
            }
        }
        return true;
    }

    function remove() {
        var parent = this.container;
        while (parent.firstChild) {
            parent.removeChild(parent.firstChild);
        }
    }

    function _define(fnObj) {
        return {
            value: fnObj,
            enumerable: !(fnObj instanceof Function)
        }
    }

});