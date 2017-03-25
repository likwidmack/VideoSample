/**
 * page-refresh file for ndp-video-spa on 28-Jun-16.
 */

window.$PAGE_REFRESH = (function () {

    var variables = window.$GLOBAL_PARAM;

    function Refresh() {



    }

    Refresh.prototype = Object.create({
        constructor: Refresh
    }, {
        timestamp: {value: Date.now()}
    });

    return new Refresh();

})();