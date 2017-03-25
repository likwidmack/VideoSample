/**
 * item-model file for ndp-video-spa on 07-Mar-17.
 */
define('log-item-parameter-model', ['knockout'], function (ko) {
    var page = $page,
        data = page.data,
        utils = page.utils;

    function ItemModel(item) {
        this.time = utils.getTimeString(item.timestamp);
        this.instance = item.instance;
        this.type = item.type;
        this.dependents = ko.observable(false);

        var children = item.children;
        this.toggle = ko.observable(false);
        this.toggle.subscribe(function(_bool){
            if(_bool && !this.dependents()){
                this.dependents(this.mapPrintArray(children));
            }
        }, this);

        Object.defineProperty(this, 'performance', {value: item.timestamp});
    }

    ItemModel.prototype = Object.create({
        constructor: ItemModel
    }, {
        mapPrintArray: {value: mapPrintArray}
    });

    return ItemModel;

    function mapPrintArray(_eventArray, isChild) {
        if (!_eventArray || !_eventArray.length) return '';
        if(typeof _eventArray === 'string') return _eventArray;
        var item, i = _eventArray.length;
        var parent = $('<div class="shrink columns secondary callout" />');
        if (isChild) parent = $('<div class="horizontal-constraint inners secondary callout" />');
        while (i--) {
            if (!_eventArray[i]) continue;
            item = _eventArray[i];
            var _div = $('<div class="inline-box callout" />');

            if (utils.isArray(item)) {
                item = mapPrintArray(item);
                if(!item || typeof item !== 'string') continue;
                _div.append(item);
            } else if ((typeof item === 'object')
                && !!item.name
                && !!item.value) {
                if (!item.value) continue;

                var _obj = item.value,
                    label = $('<label class="success label" />');

                if (utils.isArray(item.value)) {
                    _obj = mapPrintArray(item.value, true);
                    if(!_obj || typeof _obj !== 'string') continue;
                    _div = $('<div class="callout" />');
                }

                _div.append(label.text(item.name), '&nbsp;', _obj);
            } else {
                _div.prepend($('<span />').text(item));
            }

            _div.prependTo(parent);
        }

        return (parent.get(0)).outerHTML;
    }

});