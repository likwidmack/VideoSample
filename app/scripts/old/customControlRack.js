(function(ndp) {

    var PlaybackEvent = ndp.events.PlaybackEvent;
    var AdEvent = ndp.events.AdEvent;
    var thisPlayer = {};

    function getDisplayTimeFormat (time) {
        if (!time) return "0:00";
        time = time / 1000;
        var minutes = Math.floor((time / 60));
        var seconds = Math.floor((time - (minutes * 60)));
        return minutes + ":" + ( seconds < 10 ? "0" + seconds : seconds );
    }

    function CustomControlRack(player) {
        thisPlayer = player;
        this.bindClicks();
        this.bindNDPevents(true);
    }

    CustomControlRack.prototype.bindClicks = function() {
        $('#customPlay').click(function() {
            thisPlayer.play();
        });
        $('#customPause').click(function() {
            thisPlayer.pause();
        });
        $('#customSeek').click(function(e){
            thisPlayer.scrub((e.offsetX / e.target.clientWidth));
        });
        $('#customPip').click(function(e){
            e.stopPropagation();
        });
        $('#customCC').click(function(){
            thisPlayer.caption();
            // need to accept parameter for multiple track elements
        });
        $('#customFullscreen').click(function(){
            thisPlayer.fullscreen(true);
        });
        $('#customVolume').click(function(e){
            thisPlayer.mute();
        });
        $('#customVolumeBar').click(function(e){
            e.stopPropagation();
            thisPlayer.volume((1 - (e.offsetY / 100)));
            $('#customPim').css('bottom', ((100 - e.offsetY) + 40) + "px");
        });
    };

    CustomControlRack.prototype.bindNDPevents = function (on) {
        var handler = on ? "on" : "off";
        thisPlayer[handler](PlaybackEvent.START, this.onMediaStart);
        thisPlayer[handler](PlaybackEvent.PROGRESS, this.onMediaProgress);
        thisPlayer[handler](AdEvent.START, this.onAdStart);
        thisPlayer[handler](AdEvent.PROGRESS, this.onAdProgress);
        thisPlayer[handler](AdEvent.COMPLETE, this.onAdComplete);
    };

    CustomControlRack.prototype.onMediaStart = function(e) {
        $('#customControls').show();
        var vidDuration = getDisplayTimeFormat(e.getTotalLength());
        $('#customTimeRemaining').text(vidDuration);
    };

    CustomControlRack.prototype.onMediaProgress = function(e) {
        // UX can _.throttle() this if they want
        var currentTime = getDisplayTimeFormat(e.getPlayheadPosition());
        $('#customTimePosition').text(currentTime);
        var currentPercent = ( (e.getPlayheadPosition()) / (e.getTotalLength()) * 100 );
        $('#customPip').css('left', currentPercent + "%");
    };

    CustomControlRack.prototype.onAdStart = function(e) {
        $('#customControls').addClass('adState');
        var remainingTime = getDisplayTimeFormat(e.getRemainingTime());
        $('#customTimeRemaining').text(remainingTime);
    };

    CustomControlRack.prototype.onAdProgress = function(e) {
        var remainingTime = getDisplayTimeFormat(e.getRemainingTime());
        $('#customTimeRemaining').text(remainingTime);
    };

    CustomControlRack.prototype.onAdComplete = function(e) {
        $('#customControls').removeClass('adState');
    };

    CustomControlRack.prototype.destroy = function() {
        this.bindNDPevents(false);
    };

    window.CustomControlRack = CustomControlRack;
})(window.$ndp);