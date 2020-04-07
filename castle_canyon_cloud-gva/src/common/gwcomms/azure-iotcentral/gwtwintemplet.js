/*
  File: gwtwintemplate.js

  Description:
  Device Twin Template

  License:
  Intel TODO

*/

'use strict';

/*
Device twin detials.. 

{
    icplGwProperties: {
        shipmentId: <int- unique shipment Id>,
        shipmentState: <String- "New, Monitoring, End">,
        oceanGeofenceCellularStatusIndication: <String - "Active, Breached">,
        wsnChannel: <int - 15.4 channel id, 11-26>,
        macroFrameInterval: <int- time in seconds>,
        microFrameInterval: <int- time in seconds>,
        thresholds: {
            temperature:{
                state: <boolean - True/False>,
                min: <int- temp in C>,
                max: <int- temp in C>
            },
            humidity:{
                state: <boolean - True/False>,
                min: <int- humidity in %>,
                max: <int- humidity in %>
            },
            light:{
                state: <boolean - True/False>,
                max: <int- light in lux>
            },
            shock:{
                state: <boolean - True/False>,
                max: <int- shock in mili G>
            },
            tilt:{
                state: <boolean - True/False>,
                max: <int- tilt in degrees>
            },
            battery:{
                state: <boolean - True/False>,
                min: <int- capicity in %>
            },
            pressure:{
                state: <boolean - True/False>,
                min: <int- pressure in hPA>,
                max: <int- pressure in hPA>
            }
        }
    }
}
*/


module.exports = {
    icplGwProperties: {
        shipmentId: null,
        shipmentState: null
        oceanGeofenceCellularStatusIndication: null
        wsnChannel: null,
        macroFrameInterval: null,
        microFrameInterval: null,
        thresholds: {
            temperature:{
                state: false,
                min: null,
                max: null
            },
            humidity:{
                state: false,
                min: null,
                max: null
            },
            light:{
                state: false,
                max: null
            },
            shock:{
                state: false,
                max: null
            },
            tilt:{
                state: false,
                max: null
            },
            battery:{
                state: false,
                min: null
            },
            pressure:{
                state: false,
                min: null,
                max: null
            }
        }
    }
};

