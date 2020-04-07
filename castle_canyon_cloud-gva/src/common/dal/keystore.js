/*
  File: keystore.js

  Author: sharath.srinivasan@intel.com

  Description:
  DAL APIs for keystore database

  License:
  Intel TODO

*/

'use strict';
const Logging = require('cccommon/logging').logger('common.dal.keystore');
Logging.enable();
const Commonconfig = require('cccommon/config');
const mongoose = require('mongoose');

mongoose.connect(Commonconfig.externaldb.uri(), Commonconfig.externaldb.auth())
  .then(() => console.log('Successfully connected to the keystore database (MongoDB)...'))
  .catch((err) => console.error("Error connecting to keystore DB: " + err));

var Schema = mongoose.Schema;
var keystoreSchema = new Schema({
        deviceUuid: String,
        typeOfDevice: String,
        hwRevision: String,
        swRevision: String,
        odmId: String,
        ownerName: String,
        shippingApiUrl: String,
        shipmentId:String,
        shippingApiCredentials: String,
        deviceConnectionCredentials: String,
        dateOfManufacture: String,
        signedEcdsaPublicKeyCertificate: String,
        deviceEcdhPublicKey: String,
        creationDate: String,
        provisionData: String,
        challenge: String
});
var keystoreDataModel = mongoose.model('keystore', keystoreSchema);


exports.insertRecord = (keystoreRecord, callback) => {
  Logging.msg("Insert Record: " + JSON.stringify(keystoreRecord));
  var newKeystoreRecord = new keystoreDataModel(keystoreRecord);
  exports.findByUuid(keystoreRecord.deviceUuid, function(err, data){
    Logging.msg("Error: " + err + ", Data: " + data);
    if(err) {
      callback("Error: Trying to query DB for UUID record", null);
      return;
    }
    if(data) {
      callback("Error: Device Already exists", null);
      return;
    }
    newKeystoreRecord.save(function(err) {
      if (err) {
        Logging.msg("Error: " + err);
	callback("Error: Saving keystore data to keystore DB", null);
      }
      Logging.msg("saved the keystore");
      callback(null, null);
    });
  });
}


exports.findByUuid = (uuid, callback) => {
  keystoreDataModel.findOne({'deviceUuid':uuid.toString()},function(err, data) {
    if (err) {Logging.msg(err, data); callback(err, null); return;}
    //Logging.msg("Device Record: " + data);
    if (!data) { callback(null, null); return;} //device not found
    callback(null, data);
  })
}

exports.deleteByUuid = (uuid, callback) => {
  keystoreDataModel.remove({'deviceUuid':uuid.toString()},function(err, data) {
    if (err) {Logging.msg(err, data); return;}
    //Logging.msg("Device Record: " + data);
    callback(null, data);
  })
}

exports.deleteAll = (callback) => {
  keystoreDataModel.remove({},function(err, data) {
    if (err) {Logging.msg(err, data); return;}
    //Logging.msg("Device Record: " + data);
    callback(null, data);
  })
}

exports.updateOrCreate = (uuid, deviceCredentials, provisionData, cb) => {
  //Logging.msg("Insert Record: " + JSON.stringify(keystoreRecord));
  let record ={
    deviceUuid: uuid,
    deviceConnectionCredentials: JSON.stringify(deviceCredentials),
    provisionData: JSON.stringify(provisionData)
  };
  var newKeystoreRecord = new keystoreDataModel(record);
  delete newKeystoreRecord._id;
  keystoreDataModel.findOneAndUpdate(
    {deviceUuid: uuid},
    record,
    {upsert: true, new: true, runValidators: true},
    function (err, doc) { // callback
      if (err) {
        Logging.msg("Update error: " + err);
        cb(false);
        return;
      } else {
        Logging.msg("Update Successful: " + doc);
        cb(true);
        return;
      }
    }
  );
}

exports.updateDeviceChallenge = (uuid, challenge, cb) => {
  let record ={
    challenge: challenge
  };
  var newKeystoreRecord = new keystoreDataModel(record);
  delete newKeystoreRecord._id;
  keystoreDataModel.updateOne(
    {deviceUuid: uuid},
    record,
    {upsert: true, new: true, runValidators: true},
    function (err, doc) { // callback
      if (err) {
        Logging.msg("Update error: " + err);
        cb(false);
        return;
      } else {
        Logging.msg("Update Successful: " + doc);
        cb(true);
        return;
      }
    }
  );
}

