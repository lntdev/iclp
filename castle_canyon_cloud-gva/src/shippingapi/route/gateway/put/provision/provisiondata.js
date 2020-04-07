module.exports = {
  provisionData: {
    time: Date.now(),
    gatewayId: '',
    gatewayWSNId: '200',
    airplaneMode: 'no',
    geofencingParams: '',
    channelId: '21',
    PANId: '100',
    microInterval: '15',
    macroInterval: '60',
    numberOfTags: '0',
    addedTagList: []
  },
  multiConfigChange:{
    time: Date.now(),
    messageToken: '',
    configList: [{
      applyToAll: 'yes',
      tagList: [],
      configParams: [{
        type: 'temperature',
        enableSensor: 'yes',
        thrIsValid: 'yes',
        thresholds: {
          min: '0',
          max: '50'
        }
      },
      {
        type: 'humidity',
        enableSensor: 'yes',
        thrIsValid: 'yes',
        thresholds: {
          min: '30',
          max: '60'
        }
      },
      {
        type: 'light',
        enableSensor: 'yes',
        thrIsValid: 'yes',
        thresholds: {
          min: '0',
          max: '2000'
        }
      },
      {
        type: 'pressure',
        enableSensor: 'yes',
        thrIsValid: 'yes',
        thresholds: {
          min: '600',
          max: '1200'
        }
      },
      {
        type: 'tilt',
        enableSensor: 'yes',
        thrIsValid: 'yes',
        thresholds: {
          max: '45',
          min: ''
        }
      },
      {
        type: 'shock',
        enableSensor: 'yes',
        thrIsValid: 'yes',
        thresholds: {
          max: '2000',
          min: ''
        }
      },
      {
        type: 'battery',
        enableSensor: 'yes',
        thrIsValid: 'yes',
        thresholds: {
          min: '30',
          max: ''
        }
      }]
    }]
  }
}

