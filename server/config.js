module.exports = function(app) {
    var domainName = 'http://';
    // subscriptions for geo location and for tags
    var cityCoverage=[
    //dublin
        { lat: 53.3494, lng:-6.2601 },
        { lat: 53.3731, lng: -6.324 },
        { lat: 53.305,  lng: -6.2457 },
        { lat: 53.3825, lng: -6.2251 },
        { lat: 53.2964, lng: -6.1379 },
        { lat: 53.393,  lng: -6.1321 },
        { lat: 53.4288, lng: -6.2766 }
    ];
    var tagSubscriptions = ['dublinedge'];

    var callbackURL = domainName+'/instagram/cb';
    var instagramConfig = {
        clientId: 'YOUR_CLIENT_ID',
        clientSecret: 'YOUR_CLIENT_SECRET'
    };

    var config = {
        cityCoverage: cityCoverage,
        instagramConfig: instagramConfig,
        tagSubscriptions: tagSubscriptions,
        callbackURL: callbackURL
    };
    return config;
};
