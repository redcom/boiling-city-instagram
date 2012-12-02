module.exports = function(app) {
    var dublinCoverage=[
    //dublin
        { lat: 53.3494, lng:-6.2601 },
        { lat: 53.3731, lng: -6.324 },
        //{ lat: 53.305,  lng: -6.2457 },
        //{ lat: 53.3825, lng: -6.2251 },
        //{ lat: 53.2964, lng: -6.1379 },
        { lat: 53.393,  lng: -6.1321 },
        { lat: 53.4288, lng: -6.2766 }
    ];
    var tagSubscriptions = ['dublinedge'];
    var callbackURL = 'http://wrt.ro:8080/instagram/cb';
    var instagramConfig = {
        clientId: '84246d45a2f24951b661a717d130c57e',
        clientSecret: 'ac63a198d3a54e5194b3375a1fb21589'

        //clientId: '32b55f2c330e479a9e4ccb401d935c7d',
        //clientSecret: '38ac13830cd24499bf9a5276b3d98704'
    };

    app.set('cityCoverege', dublinCoverage);
    app.set('callbackURL', callbackURL);
    app.set('instagramConfig', instagramConfig);

    var config = {
        cityCoverage: dublinCoverage,
        instagramConfig: instagramConfig,
        tagSubscriptions: tagSubscriptions,
        callbackURL: callbackURL

    };
    return config;
};
