/**
 * player file for ndp-video-spa on 18-May-16.
 */

define(['jquery'],function($){
    // determine which player to use

    function NDPPlayerModel(){
        this.player = null;

    }

    NDPPlayerModel.prototype = Object.create({
        constructor: NDPPlayerModel
    },{
        timestamp:{value:Date.now()}
    });

    return NDPPlayerModel;
});