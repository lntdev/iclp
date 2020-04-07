/*
  File: geolocation.js

  Description:
  Main etry point for the devicesim tool.

  License:
  Intel TODO

*/
/* logging ..*/
const Logging = require('cccommon/logging').logger("gwlistener.geolocation");
Logging.enable();
const Commonconfig = require('cccommon/config');
var https = require('https');

module.exports = async function (networkLocationStructure) {
    return new Promise(function (resolve, reject) {
        try {
            var geoLocationKey = Commonconfig.geolocationApi.key();
            if (geoLocationKey ==""){
                reject();
            }
            var https_header = {
                host: 'www.googleapis.com',
                port: 443,
                path: '/geolocation/v1/geolocate?key=' + geoLocationKey,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
            };
            var https_body = {
                "considerIp": "false",
                "cellTowers": networkLocationStructure.cellTowersArray,
                "wifiAccessPoints": networkLocationStructure.wifiAccessPointsArray
            }
            //Logging.msg("Geolocation Request header: " + JSON.stringify(https_header));
            Logging.msg("Geolocation Request body: " + JSON.stringify(https_body));
            var reqGet = https.request(https_header, function (res) {
                glaLocation = {}
                glaLocation.statusCode = res.statusCode;
                glaLocation.headers = res.headers;
                Logging.msg("GeoLocation Response statusCode: " + glaLocation.statusCode);
                //Logging.msg("GeoLocation Response headers: " + JSON.stringify(glaLocation.headers));
                res.on('data', function (responseLocation) {
                    //Logging.msg("GeoLocation Response body: " +  responseLocation);
                    if (res.statusCode == 200) {
                        glaLocation.locationData = JSON.parse(responseLocation);
                        resolve(glaLocation);
                    } else {
                        Logging.msg("Error: " + res.statusCode);
                        reject("Error: " + res.statusCode);
                    }
                    reqGet.end();
                });
            });
            reqGet.on('error', function (error) {
                Logging.msg("GeoLocation Error: " + error);
                reject("Error: " + error);
            });
            reqGet.setTimeout(60000, function () {
                Logging.msg("https request timedout");
                reqGet.abort();
                reject("Error: https Timeout");
            }.bind(reqGet));
            reqGet.on('socket', function (socket) {
                socket.setTimeout(60000, function () {
                    Logging.msg("socket timeout");
                    reqGet.abort();
                    reject("Error: Socket Timeout");
                });
            });
            reqGet.write(JSON.stringify(https_body));
            reqGet.end();
        } catch (error) {
            Logging.msg("Exception: " + error);
            reject("Exception: " + error);
        }
    });
}
