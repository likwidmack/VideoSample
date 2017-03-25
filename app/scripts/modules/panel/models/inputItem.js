/**
 * File name: inputItem, created on 09-May-16 in project, ndp-video-spa.
 */

define('panel-inputItem-model',['knockout'], function (ko) {

    return function inputItem(type, name, label, value, func) {
        this.type = type;
        this.id = 'input_' + name;
        this.name = name;
        this.label = label;

        this.value = ko.observable(value);
        this.enable = ko.observable(false);

        if (typeof func === 'function')
            this.value.subscribe(func);

        return this;
    }

});