var instagram = require('instagram-node-lib');

module.exports = function(app, config) {
    var subscriptionID = 1 * new Date(),
        instagramSubscriptions,
        currentSubscriptions = [],
        createSubscriptions,
        unsubscribe_all,
        sendCachedMedia,
        startMediaQueue = [],
        errorCB,
        mediaQueue = [];

    instagram.set('client_id', config.instagramConfig.clientId);
    instagram.set('client_secret',config.instagramConfig.clientSecret);

    errorCB = function() {
        console.log(arguments);
    };

    newSubscriptions = function() {
        getStartMediaList();
        var cityCoverage = config.cityCoverage;
        for( var i in cityCoverage) {
            subscribeCity.apply(null, [cityCoverage[i].lat, cityCoverage[i].lng]);
        }
        var tags = config.tagSubscriptions;
        for(var i in tags) {
            subscribeTag.call(null, tags[i]);
        }
    };
    unsubscribe_all = function() {
        getSubscriptions(true);
    };

    sendCachedMedia = function() {
        if (startMediaQueue.length>0) {
            sendInitialPhotos(startMediaQueue);
        }
    };

    createSubscriptions = function() {
        newSubscriptions();
    };

    // helper functions

    function getStartMediaList() {
       var cityCoverage = config.cityCoverage[0]; 
        instagram.media.search({
            lat: cityCoverage.lat,
            lng: cityCoverage.lng,
            error: errorCB,
            complete: sendInitialPhotos
         });
    }

    function getSubscriptions(unsubscribe) {
        instagram.subscriptions.list({
            error: errorCB,
            complete: function(data) {
                if (unsubscribe) {
                    instagram.subscriptions.unsubscribe_all(data);
                    currentSubscriptions.splice(0);
                } else {
                    console.log('subscription list', data);
                }
            }
        });
    };

    function emitNewPhoto(media) {
        if (config.socketio && config.socketio.emit) {
            config.socketio.emit('add photo', media);
        }
    }

    function subscribeCity(latitude, longitude) {
        instagram.media.subscribe({
            lat: latitude,
            lng: longitude,
            radius: 5000,
            callback_url: config.callbackURL,
            complete: function(data) {
                console.log('new subscription created');
                currentSubscriptions.push(data);
            },
            error: errorCB,
            verify_token: subscriptionID
        });
    }

    function subscribeTag(tag) {
        instagram.tags.subscribe({
                object_id: tag,
                aspect: 'media',
                verify_token: subscriptionID,
                callback_url: config.callbackURL,
                complete: function(data) {
                    currentSubscriptions.push(data);
                },
                error: errorCB
        });
    }

    function getTagSubscriptionList(list) {
        var list=list[0] || list;
        var media = extractMediaInfo(list);
        addToStartMediaQueue(media);
        emitNewPhoto(media);
    }

    function addToStartMediaQueue(media) {
        startMediaQueue.splice(-1);
        startMediaQueue.push(media);
    };

    function mediaInfoCompletedCB(data) {
        var media = extractMediaInfo(data);
        addToStartMediaQueue(media);
        emitNewPhoto(media);
    }

    function extractMediaInfo(data) {
        var media = {
            id: data.id,
            link: data.link,
            url: data.images.thumbnail.url,
            created: data.created_time,
            username: data.user.username,
            title: data.caption? data.caption.text: ''
        };
        return media;
    }

    function getMediaInfo() {
        var localMedia = mediaQueue.splice(0);
        for (var i in localMedia) {
            var id = localMedia[i];
            if(id) {
                instagram.media.info({
                    media_id: 1*id,
                    complete: mediaInfoCompletedCB,
                    error: errorCB
                });
            }
        }
    }

    function sendInitialPhotos(medias) {
        startMediaQueue = medias;
        var media,
            data,
            i;
        for(i in medias) {
            data = medias[i];
            media = extractMediaInfo(data);
            emitNewPhoto(media);
        }
    }
    // application routing

    app.get('/instagram/cb', function(req, res) {
        var query = req.query;
        if (1*query['hub.verify_token'] === subscriptionID) {
            res.send(query['hub.challenge']);
        }
        res.end();
    });

    app.post('/instagram/cb', function(req, res) {
            var query = req.body;
            for (var i in query) {
                var elem = query[i];
                var typeofobject = elem['object'];
                var id = elem.object_id;
                switch(typeofobject) {
                    case 'geography': {
                        mediaQueue.push(id);
                        getMediaInfo.call(null);
                    }; break;
                    case 'tag': {
                        instagram.tags.recent({name: id,
                            callback_url: config.callbackURL,
                            complete: getTagSubscriptionList,
                            error: errorCB
                        });
                    }; break;
                    }
            }
            res.send(200);
    });

    return {
        unsubscribe_all: unsubscribe_all,
        createSubscriptions: createSubscriptions,
        sendCachedMedia: sendCachedMedia
    }
}
