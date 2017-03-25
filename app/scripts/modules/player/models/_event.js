/**
 * _event file for ndp-video-spa on 06-Jun-16.
 */

define([],function(){


    function AbstractPlayerEventModel(){
        Object.defineProperties(this,{

        });
    }

    AbstractPlayerEventModel.prototype = Object.create({
        constructor:AbstractPlayerEventModel
    },{
        timestamp:{value:Date.now()}
    });

    return AbstractPlayerEventModel;


});