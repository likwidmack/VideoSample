function logEvents(e, Id) {
    var li, msg = e.type,
        strDate = _getLocalTime();
        console.debug('LOG:: ',e.type[0]);

    if (!e.message) e.message = Id;
    li = $('#outputLog ol li:last');
    var txt = $.trim((li.text()).split('::')[0]);
    msg = $.isArray(msg) ? msg[0] : msg;
    var msgArray = msg.split('_');
    //$ndp.console.debug('DOES TEXT MATCH MESSAGE?', [txt, msg, txt == msg])

    if (txt === msg && li.length) {
        li.html(_appendDateTime(e, strDate));
    } else {
        li = $('<li>').html(_appendDateTime(e, strDate));
        $('#outputLog ol').append(li);
    }
    //$ndp.console.log('eventDatetime', [li.length, li.data('eventDatetime')]);
    if (!(li.data('eventDatetime'))) li.data('eventDatetime', []);
    (li.data('eventDatetime')).push(strDate);

    if (msgArray[msgArray.length-1] !== 'PROGRESS') {
        $ndp.console.debug('Got player event ', e);
        if (msgArray[msgArray.length-1] === 'ERROR') {
            li.append('<br/><span style="color:blue">' + e.payload.error + '</span>');
        }
    } else {
        var time = e.getPlayheadPosition instanceof Function ? e.getPlayheadPosition() : 0;
        var duration = e.getTotalLength instanceof Function ? e.getTotalLength() : 0;
        var strDur = 'Time: ' + Math.round(time) + ' || Duration: ' + Math.round(duration);
        //$ndp.console.log(msg, strDur);
        li.append('<br/><span style="color:blue">' + strDur + '</span>');
    }

    if (msgArray[msgArray.length-1] === 'START' && e.payload && e.payload.asset && e.payload.asset.isLiveMedia) {
        li.append('<br/><span style="color:blue">This is a live stream</span>');
    }

    $('#playerEvents').text(msg);
}

function _getLocalTime() {
    var date = new Date(),
        options = {
            hour: "numeric",
            minute: "numeric",
            second: "numeric",
            hour12: false
        };
    return date.toLocaleTimeString('en-us', options) + '.' + date.getMilliseconds();
}
function _appendDateTime(e, strDate) {
    var msg = e.type;
    msg += ' :: ' + strDate;
    if (e.message) {
        if (e.originator) {
            e.message += ' -- ' + e.originator.controlId;
        }
        msg += ' <br/> <i>' + e.message + '</i>';
    } else {
        if (e.originator) {
            msg += ' <br/> <i>' + e.originator.controlId + '</i>';
        }
    }
    return msg;
}

function _GetURLParameter(sParam) {
    var sPageURL = window.location.search.substring(1);
    var sURLVariables = sPageURL.split('&');
    for (var i = 0; i < sURLVariables.length; i++) {
        var sParameterName = sURLVariables[i].split('=');
        if (sParameterName[0] == sParam) {
            return sParameterName[1];
        }
    }
}
