/**
 * File name: selectItem, created on 09-May-16 in project, ndp-video-spa.
 */

define('panel-selectItem-model',['knockout', 'jquery'], function (ko, $) {

    return function CheckModel(obj, arr, chosenIndex, func) {
        this.type = obj.type;
        this.id = 'toggle_' + obj.name;
        this.name = obj.name;
        this.header = obj.header || obj.name;
        this.summary = obj.summary || false;

        this.enable = ko.observable(true);
        this.options = ko.observableArray([]);

        var i = arr.length;
        while (i--) {
            this.options.unshift(new checkedItem(arr[i], this));
        }

        this.selected = ko.observable();
        this.selected(this.options()[chosenIndex]);

        if (typeof func === 'function')
            this.selected.subscribe(func, this);

        return this;
    };

    function checkedItem(obj, owner) {
        this.type = 'checkbox';
        this.id = owner.name + '_chk_' + obj.id;
        this.value = obj.id;
        this.label = obj.label;
        this.title = obj.title || false;

        var _enable = typeof obj.enable === 'undefined' ? true : !!obj.enable;
        this.enable = ko.observable(_enable);

        this.selected = ko.pureComputed(function () {
            var chosen = owner.selected();
            if ($.isArray(chosen))
                return ($.inArray(this, chosen) > -1);

            return (chosen === this);
        }, this);

        return this;
    }

    /*return function selectItem(type, name, label, options, selectedIndex, func) {
     this.type = type;
     this.id = 'toggle_' + name;
     this.name = name;
     this.label = label;

     this.options = ko.observableArray(options);
     this.selected = ko.observable(this.options()[selectedIndex]);
     this.enable = ko.observable(true);

     if (typeof func === 'function')
     this.selected.subscribe(func);

     return this;
     };*/

});