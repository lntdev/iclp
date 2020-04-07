const Logging   = require('cccommon/logging').logger('common.dal.gateway');
Logging.enable();

const models = require('cccommon/models/internaldb');

/**
 * Find the gateway and all associated shipments.
 *
 * The purpose is to support "reverse" look ups in order to find out if a shipment
 * already exists that's associated the given gateways, in order to prevent multiple
 * shipments from using the same gateway.
 */
exports.findByUUID = (uuid) => {
  return models.Gateway.findAll({
    where: {
      uuid: uuid
    }
  });
};

exports.gatewayUpcert = (spec) => {
  return models.Gateway
      .findOne({ where: { uuid: spec.uuid }})
      .then(function(obj) {
          // update
          if(obj)
              return obj.update(spec);
          // insert
          return models.Gateway.create(spec);
      })
};

async function localTest(){
  let spec = {
    uuid: '1234567890ABCEDFGHIJ1234567890BB',
    wsnId: 12344,
    panId: 56784,
    channelId: 22,
    beaconKey: 'osndinf0842n0n4ibn2e98g802h04428n',
    microInterval: 60,
    macroInterval: 900
  };
  let ret = await exports.gatewayUpcert(spec);
  Logging.msg('return: ' + JSON.stringify(ret));
  let get = await exports.findByUUID('1234567890ABCEDFGHIJ1234567890BB');
  Logging.msg('get: ' + JSON.stringify(get));
}

//localTest();
