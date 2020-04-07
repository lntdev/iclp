/*
  File: sms/index.js

  Description:
  utility to send sms alerts

  License:
  Intel TODO

*/
'use strict';

/* logging ..*/
const Logging = require('cccommon/logging').logger("SMS Alerts");
Logging.enable();
const commonConfig = require('cccommon/config');
const smsEnable = require('cccommon/config').smsAlerts.enable();

exports.sendAlert = function (msgBody, toPhnoeNumber) {
  try {
    if (smsEnable) {
      const accountSid = commonConfig.smsAlerts.accountSid();
      const authToken = commonConfig.smsAlerts.authToken();
      const client = require('twilio')(accountSid, authToken);
      client.messages
        .create({
          body: msgBody,
          from: commonConfig.smsAlerts.registeredPhoneNumber(),
          to: toPhnoeNumber
        })
        .then(message => Logging.msg("Sent SMS alert to: " + toPhnoeNumber +
          ", with Body: " + msgBody +
          ", response code: " + message.sid))
        .catch(err => Logging.msg('Error Sending SMS: ' + err))
        .done();
    }
  } catch (error) {
    Logging.msg("Error sending SMS Alert: " + error);
  }
}
