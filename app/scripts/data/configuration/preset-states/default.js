/**
 * default file for ndp-video-spa on 06-Jun-16.
 */

(function(){
    function DefaultState(preset){
        this.preset = preset;

    }

    DefaultState.prototype = Object.create({
        constructor:DefaultState
    },{

    });

    return DefaultState;
})();