/* logging ..*/
const Logging = require('cccommon/logging').logger("gwlistener.geofence");
Logging.enable();

/* modules that are part of this tool's codebase */
const shipDal = require('cccommon/dal/shipment');
const smsAlert = require('cccommon/alerts/sms');
const gwmClient = require('cccommon/client/gwmessenger');
const geofenceDal = require('cccommon/dal/geofence');
const sensorDataDal = require('cccommon/dal/sensordata');

exports.checkAndNotifyGeofenceAlert = (payload) => {
return new Promise(function (resolve, reject) {
  Logging.msg("Checking for GeoFences..");
  var shipmentid = payload.shipmentId;
  if (isNaN(shipmentid)) {
    //Logging.msg("using shipDal.findByShipmentId for shipment lookup: " + shipmentid);
    var queryFn = shipDal.findByShipmentId;
  } else {
    //Logging.msg("using shipDal.findByPrimaryKey for shipment lookup: " + shipmentid);
    var queryFn = shipDal.findByPrimaryKey;
  }
  queryFn(shipmentid)
    .then(function (shipment) {
      if (!shipment) {
        var msg = "failed to retrieve shipment from dal for shipment id: " + shipmentid;
        Logging.msg(msg);
        resolve();
      }
      //Logging.msg("Shipment: " + JSON.stringify(shipment));
      if (shipment.geofences.length < 1) {
        Logging.msg("This shipment does not have any configured geofences");
        resolve();
      }
      for (var i = 0; i < shipment.geofences.length; i++) {
        let geofence = shipment.geofences[i];
        Logging.msg("Geofence[" + i + "] - " + JSON.stringify(geofence));
        if (geofence.shape == "circle") {
          if (geofence.alertStatus == "0") {
            let distance = computeDistance(
              parseFloat(geofence.coordinates[0].latitude),
              parseFloat(geofence.coordinates[0].longitude),
              payload.location.latitude,
              payload.location.longitude);
            Logging.msg("Lat1: " + parseFloat(geofence.coordinates[0].latitude) +
              ", Lon1: " + parseFloat(geofence.coordinates[0].longitude) +
              ", Lat2: " + payload.location.latitude +
              ", Lon2: " + payload.location.longitude +
              ", distance: " + distance);
            if ((geofence.type == "origin" || geofence.type == "source") && distance > geofence.coordinates[0].radius) {
              Logging.msg("Source/Origin breach Detected!!");
              executeBreachAction(payload, shipment, geofence);
              sendCalibToGW(shipment);
            }
            if (geofence.type == "destination" && distance < geofence.coordinates[0].radius) {
              Logging.msg("Destination breach Detected!!");
              executeBreachAction(payload, shipment, geofence);
            }
            if (geofence.type == "ocean" && distance < geofence.coordinates[0].radius) {
              Logging.msg("Ocean breach Detected!!");
              executeBreachAction(payload, shipment, geofence);
            }
          } else
            Logging.msg(geofence.type + " Geofence breach has already been alerted");
            resolve();
        } else
          Logging.msg("not a circluar geofence shape");
          resolve();
      }
      resolve();
    })
    .catch(function (err) {
      Logging.msg("Error while trying to compute Geofence Breach for shipmentId " + shipmentid + ": " + err);
      resolve();
    })
});
}


async function sendCalibToGW(shipment) {
  Logging.msg("sendCalibToGW!!");
  // Get list of Tag UUID's in a given shipment
  const tagsInShipment = [];
  shipment.shippingUnits.forEach(shippingUnit => {
    shippingUnit.tags.forEach(tag => {
      tagsInShipment.push(tag.uuid);
    });
  });
  //Logging.msg('tagsInShipment: ' + JSON.stringify(tagsInShipment));

  // Loop over each Tag UUID and get last associated gateway UUID
  let gatewaysList = {};
  for (let tagId of tagsInShipment) {
    // Get last associated gateway UUID form AddTagResponseRecord collection
    let lastRecord = await sensorDataDal.getLastAddTagResponseRecordByTagId(tagId);
    if (!lastRecord) continue;

    // Is Tag device last associated to current shipment?
    if (JSON.parse(lastRecord.handle).shipmentId != shipment.id) continue;
    if (!gatewaysList[lastRecord.gatewayId])
      gatewaysList[lastRecord.gatewayId] = [];
    gatewaysList[lastRecord.gatewayId].push(tagId);
  };

  Logging.msg('gatewaysList: ' + JSON.stringify(gatewaysList));

  // Loop over each associated gateway UUID list and then trigger device calibration command.
  for (let gatewayId in gatewaysList) {
    // Send a caliberate request command to the gateway
    var req = {
      id: 'fromGeoFenceBreach',
      params: {
        id: 'calibrategateway'
      },
      body: {
        shipmentId: shipment.id,
        gatewayId: gatewayId,
        requestId: ' ',
        tagList: gatewaysList[gatewayId]
      }
    };
    Logging.msg('gatewayId: ' + gatewayId);
    Logging.msg("Send Gateway Calibrate Command: " + JSON.stringify(req));
    gwmClient.calibrateGateway(req, gatewayId);
  }
}

function enableApmOnGw(payload, breach) {
  Logging.msg("enableApmOnGw!!");
  // Send a APM request command to the gateway
  var req = {
    id: 'fromGeoFenceBreach',
    params: {
      id: 'airplanemode'
    },
    body: {
      shipmentId: payload.shipmentId,
      gatewayId: payload.gatewayId,
      requestId: ' ',
      apmDuration: breach.duration,
      reason: 'geofence'
    }
  };
  Logging.msg("Send Gateway APM Command: " + JSON.stringify(req));
  gwmClient.airplaneMode(req, req.body.gatewayId);
}

function executeBreachAction(payload, shipment, geofence) {
  Logging.msg("executeBreachAction!!");
  geofence.breachAction.forEach((breach) => {
    if (breach.action == 'SMS alert') {
      sendBreachSms(payload, shipment, geofence, breach);
    }
    if (breach.action == 'Enable APM') {
      // only send the APM if geofence is computed using GLA
      // this overcomes a bug in the GW that was making it go
      // into multiple APM cycles
      if (payload.location.locationMethod != 'GPS')
        enableApmOnGw(payload, breach);
    }
  });
  /* update the internal DB regarding the geofence alert */
  geofenceDal.updateAlert(geofence.id);
}

function sendBreachSms(payload, shipment, geofence, breach) {
  var breachType = geofence.type;
  var alertMsg;
  if (breachType == 'destination') {
    alertMsg = "Your Shipment with ID: " + shipment.id + ", is about to arrive at its destination. " +
      "Track: https://www.google.com/maps/search/?api=1&query=" +
      payload.location.latitude + "," + payload.location.longitude;
  }
  if (breachType == 'origin' || breachType == 'source') {
    alertMsg = "Your Shipment with ID: " + shipment.id + ", has left from its origin. " +
      "Track: https://www.google.com/maps/search/?api=1&query=" +
      payload.location.latitude + "," + payload.location.longitude;
  }
  if (breachType == 'ocean') {
    alertMsg = "Your Shipment with ID: " + shipment.id + ", has arrived at the ocean port. " +
      "Track: https://www.google.com/maps/search/?api=1&query=" +
      payload.location.latitude + "," + payload.location.longitude;
  }

  Logging.msg("Alert SMS Body: " + alertMsg +
    "; sending to: " +
    shipment.customerAddrPhone + ", " +
    shipment.legs[0].fromPhone + ", " +
    shipment.legs[0].toPhone);
  if (breach.customerPhone)
    smsAlert.sendAlert(alertMsg, shipment.customerAddrPhone);
  if (breach.pickupPhone)
    smsAlert.sendAlert(alertMsg, shipment.legs[0].fromPhone);
  if (breach.deliveryPhone)
    smsAlert.sendAlert(alertMsg, shipment.legs[0].toPhone);
}

function computeDistance(lat1, lon1, lat2, lon2) {
  //Logging.msg("Lat1: " + lat1 + ", Lon1: " + lon1 + ", Lat2: " + lat2 + ", Lon2: " + lon2);
  var R = 6371;
  var dLat = deg2rad(lat2 - lat1); // convert to radians
  var dLon = deg2rad(lon2 - lon1); // convert to radians
  var a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c;
  //Logging.msg("Distance: " + d);
  return d; //distance in kilometers
}

function deg2rad(deg) {
  return deg * (Math.PI / 180)
}
