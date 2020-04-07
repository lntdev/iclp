const Logging   = require('cccommon/logging').logger('common.dal.gateway');
Logging.enable();

const models = require('cccommon/models/internaldb');

exports.updateAlert = function(geofenceId){
  return models.Geofence.update({"alertStatus":"1"}, {where:{"id":geofenceId}});
}
