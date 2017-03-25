/**
 * File name: checkedItem, created on 09-May-16 in project, ndp-video-spa.
 */

define('panel-checkedItem-model',['knockout'], function (ko) {

    return function checkedItem(obj, func) {
        this.type = 'checkbox';
        this.id = 'chk_' + obj.name;
        this.label = obj.label;
        this.title = obj.description || false;

        this.value = ko.observable(obj.value);

        var _enable = typeof obj.enable === 'undefined' ? true : !!obj.enable;
        this.enable = ko.observable(_enable);

        if (typeof func === 'function')
            this.value.subscribe(func, this);

        return this;
    };

    /*return function checkedItem(name, label, value, func) {
        this.type = 'checkbox';
        this.id = 'chk_' + name;
        this.name = name;
        this.label = label;

        this.value = ko.observable(value);
        this.enable = ko.observable(true);

        if (typeof func === 'function')
            this.value.subscribe(func, this);

        return this;
    };*/

});