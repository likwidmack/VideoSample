/**
 * File name: AssetListModel, created on 09-May-16 in project, ndp-video-spa.
 */

define('panel-assetItems-model', ['knockout', 'panel-checkedItem-model'], function (ko, checkedItem) {
    Date = window.Date;

    var _data = window.$page.data,
        utils = window.$page.utils,
        toBool = utils.toBoolean;

    var _console = window.$page.console.getInstance('Control Panel Asset Item');

    function AssetListSelect() {
        var _this = this;
        this.type = 'assets';

        this.dataAssets = ko.observableArray(this.getDataAssets);
        this.checkboxItems = {
            defaultPlaylist: new checkedItem({
                name: 'defaultPlaylist',
                label: 'Use Default Playlist',
                value: false
            }, function (_bool) {
                var defaultAsset = {
                    type: 'playlistId',
                    input: 'giDDVYo81SY3',
                    label: 'NBCNews Latest'
                };
                _this.addRemove(_bool, defaultAsset);
            }),
            addLive: new checkedItem({
                name: 'addLive',
                label: 'Use Default Live Feed',
                value: _data.live
            }, function (_bool) {
                _data.live = _bool;
                var liveAsset = {
                    type: 'playlistId',
                    input: 'nnd_livevideo',
                    label: 'Live Videos'
                };
                _this.addRemove(_bool, liveAsset);
            })
        };

        this.selectType = ko.observableArray([
            {id: 'playlistId', label: 'Playlist Id'}
            , {id: 'mpxId', label: 'MPX Id'}
            , {id: 'url', label: 'Canonical Url'}
        ]);
        this.listItems = ko.observableArray(this.getDataAssets);
        this.listItems.subscribe(function (assetArray) {
            var i = assetArray.length,
                hasLive = false,
                hasDefault = false;
            while (i--) {
                var item = assetArray[i];
                if(!item)continue;
                hasLive = (item.input === 'nnd_livevideo');
                hasDefault = (item.input === 'giDDVYo81SY3');
            }
            this.checkboxItems.addLive.value(hasLive);
            this.checkboxItems.defaultPlaylist.value(hasDefault);
        }, this);

        this.inputLabel = ko.observable('');
        this.inputText = ko.observable('');
        this.inputType = ko.observable(this.selectType()[0]);

        this.disabled = ko.pureComputed(function () {
            var localItems = this.listItems(),
                dataItems = this.dataAssets();
            if (localItems == dataItems)return true;
            return false;
        }, this);

        this.add = function (d, e) {
            var item = {
                label: d.inputLabel() || 'Playlist #' + d.listItems().length,
                type: d.inputType().id,
                input: d.inputText()
            };
            if (item.input.length) {
                d.listItems.push(item);
                d.inputLabel('');
                d.inputText('');
                d.inputType(_this.selectType()[0]);
            }
        };
        this.remove = function (d, e) {
            if (d.type === 'default') {
                _this.checkboxItems.defaultPlaylist.value(false);
            } else if (d.input === 'nnd_livevideo') {
                _this.checkboxItems.addLive.value(false);
            }
            _data.assets.remove(d);
        };

        this.refresh = function (d, e) {
            _this.listItems(_this.getDataAssets);
        };

        this.update = function (d, e) {
            var items = _this.listItems();
            if (items != _this.getDataAssets) {
                _data.assets = _this.listItems();
            }
        };
    }


    AssetListSelect.prototype = Object.create({
        constructor: AssetListSelect
    }, {
        findAsset: {value: findAsset}
        , addRemove: {value: addRemove}
        , getDataAssets: {
            get: function () {
                return _data.assets.raw;
            }
        }
    });

    return AssetListSelect;

    function findAsset(asset) {
        var list = this.listItems(),
            len = list.length;

        while (len--) {
            var assetInList = list[len];
            if (assetInList.type === asset.type
                && assetInList.input === asset.input
                && assetInList.label === asset.label) {
                return len;
            }
        }
        //console.warn('None Found', len, asset, list);
        return -1;
    }

    function addRemove(_bool, asset) {
        var findIndex = this.findAsset(asset);
        //console.warn('addRemove', _bool, findIndex, asset);
        if (_bool && findIndex === -1) {
            this.listItems.push(asset);
        }
        if (!_bool && findIndex > -1) {
            this.listItems.removeAll([this.listItems()[findIndex]]);
        }
    }

});