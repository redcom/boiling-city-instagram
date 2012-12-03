var express = require('express'),
    path = require('path'),
    http = require('http'),
    url = require('url'),
    fs = require('fs'),
    io = require('socket.io'),
    socketio,
    app = express(),
    config,
    instagramLogic,
    server;

app.configure(function() {
    app.use(express.logger());
    app.use(express.bodyParser())
    app.use(express.static(path.join(__dirname, 'public')));
});
server = http.createServer(app);
config = require('./server/config')(app);
instagramLogic = require('./server/instagramLogic')(app, config);


io = io.listen(server);
io.set('log level', 1); // reduce logging


io.configure(function() {
    io.set('authorization', function(handshakeData, callback) {
        if (handshakeData.xdomain) {
            callback('Cross-domain connections are not allowed');
        } else {
            callback(null, true);
        }
    });
    io.set('transports', [ 'xhr-polling' , 'jsonp-polling' , 'htmlfile' ]);
    io.set("polling duration", 10);
});

server.listen(process.env.PORT || 8081);

instagramLogic.createSubscriptions();
//instagramLogic.unsubscribe_all();

io.sockets.on('connection', function(socket) {
    config.socketio = socket;
    instagramLogic.sendCachedMedia();
    socket.emit('init', { init: 'new Init' });

    socket.on('message', function(message) {
        ip = socket.handshake.address.address;
        url = message;
        io.sockets.emit('init', {
            'connections': Object.keys(io.connected).length,
            'ip': '***.***.***.' + ip.substring(ip.lastIndexOf('.') + 1),
            'url': url,
            'xdomain': socket.handshake.xdomain,
            'timestamp': new Date()
        });
    });

    socket.on('disconnect', function() {
        io.sockets.emit('pageview', {
            'connections': Object.keys(io.connected).length
        });
    });

});

