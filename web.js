/**
 * web file for ndp-video-spa on 16-Mar-16.
 * http://expressjs.com/en/api.html
 */
console.log("Initiate web.js");

var server;
var livereload = require('connect-livereload');
var express = require("express");
var compression = require('compression');
var http = require("http");
var path = require("path");
var fs = require('fs');

var request = require('request');
var LRU = require('lru-cache');
var public_lru = new LRU();
var private_lru = new LRU();
var request_cache = require('request-caching');
var cache = new request_cache.MemoryCache(public_lru, private_lru);
var app = express();

var _ = require('underscore');
var nodemailer = require('nodemailer');
var swig = require('swig');
var sass = require('node-sass');
var package = require('./package.json');


var PORT = normalizePort(process.env.PORT || package.config.port);
var ENV = process.env.NODE_ENV || app.get('env') || 'development';
//var BUILD = process.env.BUILD_NUMBER || 0;

console.log(sass.info);
swig.setDefaults({cache: false});

app.set('port', PORT);
app.set('views', __dirname + '/app/views');
app.engine('html', swig.renderFile);
app.set('view engine', 'html');
app.set('view cache', false);
app.set('case sensitive routing', false);

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.use(compression());

app.use('/', _path('/app'));
app.use('/dist', _path('/dist'));
app.use('/js', _path('/build/js'));
app.use('/css', _path('/build/css'));
app.use('/temp', _path('/build/temp'));

app.use('/data', _path('/app/data'));
app.use('/views', _path('/app/views'));
app.use('/modules', _path('/app/views/modules'));
app.use('/scripts', _path('/app/scripts'));
app.use('/styles', _path('/app/styles'));


app.use('/libs', _path('/bower_components'));
app.use('/node', _path('/node_modules'));


if (ENV === 'development') {
    app.use(livereload());
} else {
    app.use('/app', _path('/app'));
}

app.get('/crossdomain.xml', function (req, res) {
    res.sendFile(__dirname + '/bin/crossdomain.xml');
});

app.get('/favicon.ico', function (req, res) {
    res.sendFile(__dirname + '/favicon.ico');
});

app.get('/npm-debug.log', function (req, res) {
    res.sendFile(__dirname + '/npm-debug.log');
});

app.get('/', setFlags, setJSONFlags, function (req, res) {

    res.render('main');
});

app.get('/index', function (req, res) {
    res.render('index');
});

app.get('/help', function (req, res) {
    res.render('help');
});

app.get('/legacy', setFlags, function (req, res) {
    res.render('old');
});

app.get('/simpleSimon', function (req, res) {
    res.locals.hls = isTrue(req.query.hls);
    res.render('sims');
});

app.get('/getAssets', function (req, res) {
    var _query = req.query,
        isCached = _query.cache === 'true';
    console.log('\nURL:', _query.url);
    console.log('CACHE:', _query.cache, isCached);
    var dataObj = {
        json: true,
        timeout: parseInt(_query.timeout) || 3000
    };

    //Personal Favs: nnd_livevideo,nnd_18424748,giDDVYo81SY3
    if (isCached) {
        dataObj.cache = cache;
        request_cache(_query.url, dataObj, requestJsonCallback(res, isCached));
    } else {
        request.get(_query.url, dataObj, requestJsonCallback(res));
    }
});

app.get('/ndp', function (req, res) {
    var user_agent = req.headers['user-agent'];
    var _ip = req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress;

    console.log('User-Agent: ' + user_agent);
    console.log('IP Address: ', (_ip).split(':'));

    var url = getNDP_URL(req.query, req);
    console.log('getNDP_URL', url);

    //res.sendFile(url);
    res.redirect(url);
    /*request.get(url, {timeout: 5000}, function (error, response, body) {
     console.log('REQUEST GET', url, response.statusCode);
     if (!error && response.statusCode == 200) {
     res.setHeader('content-type', 'text/javascript');
     res.end(body);
     } else {
     res.redirect(url);
     }
     });*/
});

app.get('/siteData', function (req, res) {
    var brand = req.query.brand,
        str_path = ('./app/data/siteDatas'),
        json = require(str_path + '/nbcnews_meet-the-press.json');
    if (brand === 'today') {
        json = require(str_path + '/today_parents.json');
    }

    console.log('\n/siteData', brand);
    res.json(json);
});

if (ENV === 'development') {
    module.exports = app;
} else {
    server = http.createServer(app);
    server.listen(app.get('port'));
    server.on('error', onError);
    server.on('listening', onListening);
}


function _path(url) {
    return express.static(path.join(__dirname, url));
}

/**
 * Normalize a port into a number, string, or false.
 */
function normalizePort(val) {
    var port = parseInt(val, 10);
    if (isNaN(port)) return val;
    if (port >= 0) return port;
    return false;
}

/**
 * Event listener for HTTP server "error" event.
 */
function onError(error) {
    if (error.syscall !== 'listen') throw error;

    var bind = typeof PORT === 'string'
        ? 'Pipe ' + PORT
        : 'Port ' + PORT;

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(bind + ' is already in use');
            process.exit(1);
            break;
        default:
            throw error;
    }
}

/**
 * Event listener for HTTP server "listening" event.
 */
function onListening() {
    if (!server)return;
    var addr = server.address();
    var bind = typeof addr === 'string'
        ? 'pipe ' + addr
        : 'port ' + addr.port;
    console.log('Listening on ' + bind);
}

function isTrue(obj) {
    if (typeof obj === 'undefined') return false;
    if (typeof obj === 'boolean') return obj;
    var _obj = parseInt(obj);
    if (isNaN(_obj))return obj === 'true';
    return _obj !== 0;
}

function isOne(obj, defValue) {
    if (typeof obj === 'undefined') return defValue || 0;
    var _obj = parseInt(obj);
    if (isNaN(_obj)) {
        _obj = 0;
        if (obj === true || obj === 'true') _obj = 1;
    }
    return _obj;
}

function verifyString(obj) {
    if (!!obj)return obj.toString();
    return false;
}

function setFlags(req, res, next) {
    res.locals.merged = isTrue(req.query.merged);
    if (typeof req.query.player === "string") {
        res.locals.type = "-" + req.query.player;
    } else {
        res.locals.type = "";
    }
    res.locals.native = (req.query.player === 'native');
    res.locals.legacy = (req.query.player === 'legacy');
    res.locals.async = isTrue(req.query.async);
    res.locals.debug = isTrue(req.query.debug);
    res.locals.ads = isTrue(req.query.ads);
    res.locals.live = isTrue(req.query.live);
    res.locals.autoplay = isTrue(req.query.autoplay);
    res.locals.debugMode = req.query.mode || (res.locals.debug ? 3 : 0);
    res.locals.sourcePath = req.query.sourcepath || getNDP_URL(req.query, req);
    res.locals.configPath = req.query.configpath || false;
    res.locals.pdk = req.query.pdk || false;
    res.locals.preset = req.query.preset || false;
    if (!res.locals.native && req.query.pdk) {
        res.locals.pdk = ((req.query.pdk).replace(/v/ig, '').replace(/\_/g, '.'));
    }
    next();
}

// new & modified flags middleware
function setJSONFlags(req, res, next) {
    var user_agent = req.headers['user-agent'],
        _port = typeof PORT === 'string'
            ? 'Pipe ' + PORT
            : 'Port ' + PORT;
    var _ip = req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress;

    console.log(typeof PORT === 'string'
        ? 'Pipe ' + PORT
        : 'Port ' + PORT);
    console.log('IP Address: ' + _ip);
    console.log('Environment: ' + ENV);
    console.log('User-Agent: ' + user_agent);
    console.log('HTTPS SECURED: ' + req.headers['X-Forwarded-Proto'], req.secure);
    console.log('PARAMS', JSON.stringify(req.params));

    var _query = req.query || {},
        _flagObj = {
            //merged: isOne(_query.merged, 1), //DEPRECATED
            debug: isOne(_query.debug),
            debugMode: isOne(_query.mode),
            autoplay: isOne(_query.autoplay),
            //async: isOne(_query.async), //DEPRECATED
            continuous: isOne(_query.continuous, 1),
            controlRack: isOne(_query.controlrack),
            live: isOne(_query.live),
            ads: isOne(_query.ads, 1),
            playerType: verifyString(_query.player),
            pdkVersion: verifyString(_query.pdk),
            brand: verifyString(_query.brand),
            branch: verifyString(_query.branch),
            version: verifyString(_query.version),
            //assets: _query.assets || false, //DEPRECATED
            preset: verifyString(_query.preset),
            modules: configureModules(_query.modules),
            _environment: {
                env: ENV,
                ip: _ip,
                port: _port,
                userAgent: user_agent,
                timestamp: Date.now()
            },
            _page: {
                playlistid: verifyString(_query.playlistid), //string,string,string
                mpxid: verifyString(_query.mpxid),
                canonicalurl: verifyString(_query.canonicalurl),
                sourcePath: res.locals.sourcePath,
                configPath: res.locals.configPath,
                native: (_query.player === 'native'),
                hls: (_query.player === 'hls'),
                pdk: (_query.player === 'pdk' || _query.player === 'legacy')
            }
        };

    if (_query.env && (/[|]/g).test(_query.env)) {
        var _split = (_query.env).split('|');
        _flagObj.branch = (!!_split[0]) ? _split[0] : _flagObj.branch;
        _flagObj.version = (!!_split[1]) ? _split[1] : _flagObj.version;
    }

    if (_flagObj._page.pdk && _flagObj.pdkVersion) {
        _flagObj._page.pdk = ((_query.pdk).replace(/v/ig, '')).replace(/\_/g, '.');
    }

    if (!_flagObj.debugMode && (/[,*]/g).test(_query.mode)) {
        _flagObj.debugMode = _query.mode.replace(/[\s*]/g, '');
    }
    if (ENV !== 'development') {
        _flagObj.debugMode = _flagObj.debugMode || (_flagObj.debug ? 3 : 0);
    }

    if (!(_flagObj._page.playlistid || _flagObj._page.mpxid || _flagObj._page.canonicalurl)) {
        _flagObj._page.playlistid = _flagObj.live ? 'nnd_livevideo|Live_Videos' : 'giDDVYo81SY3|NBCNews_Latest';
    }

    if (typeof _flagObj.preset === 'string') {
        _flagObj.preset = (_flagObj.preset).toLowerCase();

        switch (_flagObj.preset) {
            case 'dev':
                break;
            case 'qa':
                break;
            case 'clean':
                break;
            case 'baseline':
                break;
            case 'perf':
                break;
        }
    }

    res.locals.datastring = JSON.stringify(_flagObj);
    next();
}

function requestJsonCallback(res, isCached) {
    return function (error, response, body) {
        if (isCached) {
            response = (response && response.value && response.value.response) || response;
        }
        var _json = {
            status: 'success',
            statusCode: response && response.statusCode,
            statusMessage: response && response.statusMessage,
            timestamp: Date.now()
        };
        console.log(_json);
        if (error) {
            console.log('\nERROR_TIMED_OUT', error.code === 'ETIMEDOUT');
            console.error(error);
            _json.status = 'error';
            _json.error = JSON.parse(JSON.stringify(error));
            _json.timestamp = Date.now();
        }

        if (body) _json.json = body;
        if (response) res.json(_json);
    };
}

function configureModules(_moduleObject) {
    //set modules
    var modules = {
        assets: 1
        , info: 1
        , links: 1
        , log: 1
        , panel: 1
        , player: 1
    };

    var arrModules = false;
    if (_.isString(_moduleObject)) {
        arrModules = _moduleObject.split(',');
    } else if (_.isArray(_moduleObject)) {
        arrModules = _moduleObject;
    }
    if (arrModules) {
        for (var _prop in modules) {
            if (_.contains(arrModules, _prop))continue;
            modules[_prop] = 0;
        }
    }

    return modules;
}

function getNDP_URL(_query, req) {
    var debug = isTrue(_query.debug),
        isHTTPS = isTrue(_query.isHTTPS),
        playerType = verifyString(_query.player) || 'native',
        branch = verifyString(_query.branch) || 'qa',
        version = _query.version === 'false' ? false : verifyString(_query.version);

    if (!!_query.env && (/[|]/g).test(_query.env)) {
        var _split = (_query.env).split('|');
        branch = (!!_split[0]) ? _split[0] : branch;
        version = (!!_split[1]) ? _split[1] : version;
    }

    if (branch === 'custom') return version;

    var preHLS = false,
        isPROD = (branch === 'prod');
    if(branch === 'prod'
        && parseInt(version.split('.')[1]) < 3){
        preHLS = true;
    }

    var _filename = 'ndp';
    switch (playerType) {
        case 'native':
            // file names are currently messed up
            // here is a temporary fix until resolved
            if (isPROD && preHLS) {
                _filename = 'ndpplayer-native';
            }

            break;
        case 'hls':
            _filename += '-hls';

            if (isPROD && preHLS) {
                _filename = 'ndpplayer';
            }
            break;
        case 'legacy':
            // file names are currently messed up
            // here is a temporary fix until resolved
            _filename = 'ndpplayer-legacy';
            break;

        case 'pdk':
            // file names are currently messed up
            // here is a temporary fix until resolved
            if (isPROD && preHLS) {
                _filename = 'ndpplayer';
                break;
            }
        default:
            _filename += '-' + playerType;
            break;
    }

    //if (debug && /* missing scripts, temporary fix until resolved */ playerType === 'hybrid')
    if (debug && !preHLS) _filename += '.debug';

    _filename += '.js';

    var protocol = (req.secure || isHTTPS) ? 'https://' : 'http://';
    var host = protocol + 'media1.s-nbcnews.com/i/videoassets/';
    var ipChain = getIpAddress();
    console.log('IP Chain', ipChain);

    console.log('GET NDP String Url', branch);
    switch (branch) {
        case 'baseline':
            host += 'dev/qa/';
            //host = getLocalhostUrl(_filename, branch, ipChain, true);
            break;
        case 'prod':
            host += 'ndp/' + version + '/';
            break;
        case 'local':
            host = getLocalhostUrl(_filename, version, ipChain, isLocalSPA(ipChain), protocol);
            break;
        default:
            host += 'dev/' + branch + '/';
            break;
    }

    return host + _filename;
}

function isLocalSPA(ipChain) {
    if (ENV === 'development') return true;
    if (PORT === 9005) return true;
    var len = ipChain.length;
    while (len--) {
        var _ip = (ipChain[len]).address || '';
        if ((_ip.split(':'))[0] === '172') {
            return true;
        }
    }

    return false;
}

function getGeoLocation(req, res, next) {
    var geolocation = require('geolocation');
    var options = {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
    };

    function error(err) {
        console.warn('ERROR(' + err.code + '): ' + err.message);
        next();
    }

    function success(position) {
        console.log(position);
        var crd = position.coords;
        res.query.geolocation = {
            lat: crd.latitude,
            long: crd.longitude,
            accuracy: crd.accuracy
        };

        next();
    }

    geolocation.getCurrentPosition(success, error, options);
}

function getLocalhostUrl(_filename, version, ipChain, isLocal, protocol) {
    var relPath = 'js/';

    // if ndp-video-spa is active on localhost, complete this task
    if (isLocal) {
        relPath = 'temp/';
        console.log('\nDIR_NAME', __dirname, process.cwd());
        var fromPath = path.join(__dirname, '/../video-player/build/js/'),
            toPath = path.join(__dirname, '/build/temp/');

        console.log('\nFILEPATH', fromPath + _filename, toPath + _filename);
        var data = fs.readFileSync(fromPath + _filename, "utf8");
        if (!(typeof data === 'string' && data.length > 10)) {
            console.error('SCRIPTS DOES NOT EXIST', fromPath + _filename);
            return protocol+'media1.s-nbcnews.com/i/videoassets/dev/qa/';
        }
        if (!fs.existsSync(toPath)) {
            fs.mkdirSync(toPath);
        }
        fs.writeFileSync(toPath + _filename, data);
    }

    var location = (!!version && ipChain.length) ? version : 'localhost';
    return protocol + location + ':9005/' + relPath;
}

function getIpAddress() {
    var os = require('os');
    var ifaces = os.networkInterfaces();
    var ipArray = [];

    Object.keys(ifaces).forEach(function (ifname) {
        var alias = 0;

        ifaces[ifname].forEach(function (iface) {
            var _ifname = ifname;
            if ('IPv4' !== iface.family || iface.internal !== false) {
                // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
                return;
            }

            if (alias >= 1) {
                // this single interface has multiple ipv4 addresses
                _ifname += ':' + alias;
                console.log(_ifname, iface.address);
            } else {
                // this interface has only one ipv4 address
                console.log(_ifname, iface.address);
            }

            ipArray.push({
                name: _ifname,
                address: iface.address
            });
            ++alias;
        });
    });

    /*var ip = _.chain(ifaces).flatten().filter(function (val) {
     return (val.family == 'IPv4' && val.internal == false)
     }).pluck('address').first().value();
     console.log('Underscore IP Chain :: First', ip);
     var ip_sec = require('dns').lookup(os.hostname(), function (err, add, fam) {
     console.log('addr: ' + add);
     });*/

    return ipArray;
}

function sendEmailerNotifier(req, res) {
    //https://github.com/andris9/Nodemailer
    var date = new Date();
    var datetime = date.toDateString() + ' ' + date.toTimeString();
    var smtpTransport = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: "nd.vidreq@gmail.com",
            pass: "nbcnewsvideo"
        }
    });

    var mailOptions = {
        from: "nd.vidreq@gmail.com", // sender address
        to: "nd.vidreq@gmail.com", // list of receivers
        subject: "This is a Test: " + datetime, // Subject line
        text: "Hello world, This is test.  Please ignore.", // plaintext body
        html: req.query.html
    };

    smtpTransport.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
            res.end("error");
        } else {
            console.log("Message sent: " + info.response);
            res.end("sent");
        }
    });
}