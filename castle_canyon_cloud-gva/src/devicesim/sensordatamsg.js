/*
  File: sensordatamsg.js

  Description:
  Main etry point for the devicesim tool.

  License:
  Intel TODO

*/

'use strict';

var USEID = "1600";

const Northsouth = require('cccommon/northsouth');

exports.get = function() {
  return {
    data: sensordata, 
    properties: {
      southnorth_msgid: Northsouth.northbound.msgids.sensordata,
      egg: "SensorData Message!",
    },
  };
};

const sensordata = { 
   "time":"1579758070504",
   "gatewayId":"2050362BE64C0DA5ED43978DD541DAA9",
   "shipmentId":"0",
   "status":"128",
   "messageToken":"token",
   "isEncrypted":"no",
   "payload":[ 
      { 
         "tagId":"C9C6AF5B1BBF7C8775793283B0A9EE3A",
         "tagHandle":"{\"shipmentId\":456,\"packageId\":\"C9C6AF5B1BBF7C8775793283B0A9EE3A\",\"referenceId\":\"C9C6AF5B1BBF7C8775793283B0A9EE3A\"}",
         "time":"1579758068000",
         "sensorData":[ 
            { 
               "type":"light",
               "isAnalysis":"true",
               "isAnomaly":"false",
               "currentValue":"206",
               "anomalyValue":"0"
            },
            { 
               "type":"humidity",
               "isAnalysis":"true",
               "isAnomaly":"false",
               "currentValue":"61",
               "anomalyValue":"0"
            },
            { 
               "type":"temperature",
               "isAnalysis":"true",
               "isAnomaly":"false",
               "currentValue":"25.4",
               "anomalyValue":"0.0"
            },
            { 
               "type":"battery",
               "isAnalysis":"true",
               "isAnomaly":"false",
               "currentValue":"95",
               "anomalyValue":"0"
            },
            { 
               "type":"shock",
               "isAnalysis":"true",
               "isAnomaly":"false",
               "currentValue":"1000",
               "anomalyMinValue":"0",
               "anomalyMaxValue":"0",
               "anomalyCount":"1"
            },
            { 
               "type":"tilt",
               "isAnalysis":"true",
               "isAnomaly":"false",
               "currentValue":"0",
               "anomalyValue":"0"
            }
         ]
      },
      { 
         "tagId":"D0893697DF9DABE579E3C0A70FBD348E",
         "tagHandle":"{\"shipmentId\":456,\"packageId\":\"D0893697DF9DABE579E3C0A70FBD348E\",\"referenceId\":\"D0893697DF9DABE579E3C0A70FBD348E\"}",
         "time":"1579758068000",
         "sensorData":[ 
            { 
               "type":"light",
               "isAnalysis":"true",
               "isAnomaly":"false",
               "currentValue":"198",
               "anomalyValue":"0"
            },
            { 
               "type":"humidity",
               "isAnalysis":"true",
               "isAnomaly":"false",
               "currentValue":"66",
               "anomalyValue":"0"
            },
            { 
               "type":"temperature",
               "isAnalysis":"true",
               "isAnomaly":"false",
               "currentValue":"25.4",
               "anomalyValue":"0.0"
            },
            { 
               "type":"battery",
               "isAnalysis":"true",
               "isAnomaly":"false",
               "currentValue":"57",
               "anomalyValue":"0"
            },
            { 
               "type":"shock",
               "isAnalysis":"true",
               "isAnomaly":"false",
               "currentValue":"1000",
               "anomalyMinValue":"0",
               "anomalyMaxValue":"0",
               "anomalyCount":"1"
            },
            { 
               "type":"tilt",
               "isAnalysis":"true",
               "isAnomaly":"false",
               "currentValue":"0",
               "anomalyValue":"0"
            }
         ]
      },
      { 
         "tagId":"200B96AA2E213F5E77DB554E3464A13F",
         "tagHandle":"{\"shipmentId\":456,\"packageId\":\"200B96AA2E213F5E77DB554E3464A13F\",\"referenceId\":\"200B96AA2E213F5E77DB554E3464A13F\"}",
         "time":"1579758068000",
         "sensorData":[ 
            { 
               "type":"light",
               "isAnalysis":"true",
               "isAnomaly":"false",
               "currentValue":"243",
               "anomalyValue":"0"
            },
            { 
               "type":"humidity",
               "isAnalysis":"true",
               "isAnomaly":"false",
               "currentValue":"64",
               "anomalyValue":"0"
            },
            { 
               "type":"temperature",
               "isAnalysis":"true",
               "isAnomaly":"false",
               "currentValue":"25.2",
               "anomalyValue":"0.0"
            },
            { 
               "type":"battery",
               "isAnalysis":"true",
               "isAnomaly":"false",
               "currentValue":"61",
               "anomalyValue":"0"
            },
            { 
               "type":"shock",
               "isAnalysis":"true",
               "isAnomaly":"false",
               "currentValue":"1000",
               "anomalyMinValue":"0",
               "anomalyMaxValue":"0",
               "anomalyCount":"1"
            },
            { 
               "type":"tilt",
               "isAnalysis":"true",
               "isAnomaly":"false",
               "currentValue":"2",
               "anomalyValue":"0"
            }
         ]
      },
      { 
         "tagId":"A5E8B65297F46B5D5EC5A1604F59519F",
         "tagHandle":"{\"shipmentId\":456,\"packageId\":\"A5E8B65297F46B5D5EC5A1604F59519F\",\"referenceId\":\"A5E8B65297F46B5D5EC5A1604F59519F\"}",
         "time":"1579758068000",
         "sensorData":[ 
            { 
               "type":"light",
               "isAnalysis":"true",
               "isAnomaly":"false",
               "currentValue":"226",
               "anomalyValue":"0"
            },
            { 
               "type":"humidity",
               "isAnalysis":"true",
               "isAnomaly":"false",
               "currentValue":"60",
               "anomalyValue":"0"
            },
            { 
               "type":"temperature",
               "isAnalysis":"true",
               "isAnomaly":"false",
               "currentValue":"25.3",
               "anomalyValue":"0.0"
            },
            { 
               "type":"battery",
               "isAnalysis":"true",
               "isAnomaly":"false",
               "currentValue":"53",
               "anomalyValue":"0"
            },
            { 
               "type":"shock",
               "isAnalysis":"true",
               "isAnomaly":"false",
               "currentValue":"1000",
               "anomalyMinValue":"0",
               "anomalyMaxValue":"0",
               "anomalyCount":"1"
            },
            { 
               "type":"tilt",
               "isAnalysis":"true",
               "isAnomaly":"false",
               "currentValue":"0",
               "anomalyValue":"0"
            }
         ]
      },
      { 
         "tagId":"9E0C4DDF21A4642CFD54B9F9C02ADF06",
         "tagHandle":"{\"shipmentId\":456,\"packageId\":\"9E0C4DDF21A4642CFD54B9F9C02ADF06\",\"referenceId\":\"9E0C4DDF21A4642CFD54B9F9C02ADF06\"}",
         "time":"1579758068000",
         "sensorData":[ 
            { 
               "type":"light",
               "isAnalysis":"true",
               "isAnomaly":"false",
               "currentValue":"255",
               "anomalyValue":"0"
            },
            { 
               "type":"humidity",
               "isAnalysis":"true",
               "isAnomaly":"false",
               "currentValue":"63",
               "anomalyValue":"0"
            },
            { 
               "type":"temperature",
               "isAnalysis":"true",
               "isAnomaly":"false",
               "currentValue":"25.1",
               "anomalyValue":"0.0"
            },
            { 
               "type":"battery",
               "isAnalysis":"true",
               "isAnomaly":"false",
               "currentValue":"32",
               "anomalyValue":"0"
            },
            { 
               "type":"shock",
               "isAnalysis":"true",
               "isAnomaly":"false",
               "currentValue":"1000",
               "anomalyMinValue":"0",
               "anomalyMaxValue":"0",
               "anomalyCount":"1"
            },
            { 
               "type":"tilt",
               "isAnalysis":"true",
               "isAnomaly":"false",
               "currentValue":"0",
               "anomalyValue":"0"
            },
            { 
               "type":"txPower",
               "isAnalysis":"true",
               "isAnomaly":"false",
               "power":"0"
            }
         ]
      },
      { 
         "tagId":"EB24E3BDA4EA0FC05E81692866A9D952",
         "tagHandle":"{\"shipmentId\":456,\"packageId\":\"EB24E3BDA4EA0FC05E81692866A9D952\",\"referenceId\":\"EB24E3BDA4EA0FC05E81692866A9D952\"}",
         "time":"1579758068000",
         "sensorData":[ 
            { 
               "type":"light",
               "isAnalysis":"true",
               "isAnomaly":"false",
               "currentValue":"147",
               "anomalyValue":"0"
            },
            { 
               "type":"humidity",
               "isAnalysis":"true",
               "isAnomaly":"false",
               "currentValue":"58",
               "anomalyValue":"0"
            },
            { 
               "type":"temperature",
               "isAnalysis":"true",
               "isAnomaly":"false",
               "currentValue":"25.6",
               "anomalyValue":"0.0"
            },
            { 
               "type":"battery",
               "isAnalysis":"true",
               "isAnomaly":"false",
               "currentValue":"68",
               "anomalyValue":"0"
            },
            { 
               "type":"shock",
               "isAnalysis":"true",
               "isAnomaly":"false",
               "currentValue":"1000",
               "anomalyMinValue":"0",
               "anomalyMaxValue":"0",
               "anomalyCount":"1"
            },
            { 
               "type":"tilt",
               "isAnalysis":"true",
               "isAnomaly":"false",
               "currentValue":"2",
               "anomalyValue":"0"
            }
         ]
      },
      { 
         "tagId":"B5950B49E746B86250A0B46AEE6DB184",
         "tagHandle":"{\"shipmentId\":456,\"packageId\":\"B5950B49E746B86250A0B46AEE6DB184\",\"referenceId\":\"B5950B49E746B86250A0B46AEE6DB184\"}",
         "time":"1579758068000",
         "sensorData":[ 
            { 
               "type":"light",
               "isAnalysis":"true",
               "isAnomaly":"false",
               "currentValue":"197",
               "anomalyValue":"0"
            },
            { 
               "type":"humidity",
               "isAnalysis":"true",
               "isAnomaly":"false",
               "currentValue":"87",
               "anomalyValue":"0"
            },
            { 
               "type":"temperature",
               "isAnalysis":"true",
               "isAnomaly":"false",
               "currentValue":"25.1",
               "anomalyValue":"0.0"
            },
            { 
               "type":"battery",
               "isAnalysis":"true",
               "isAnomaly":"false",
               "currentValue":"59",
               "anomalyValue":"0"
            },
            { 
               "type":"shock",
               "isAnalysis":"true",
               "isAnomaly":"false",
               "currentValue":"1000",
               "anomalyMinValue":"0",
               "anomalyMaxValue":"0",
               "anomalyCount":"1"
            },
            { 
               "type":"tilt",
               "isAnalysis":"true",
               "isAnomaly":"false",
               "currentValue":"0",
               "anomalyValue":"0"
            }
         ]
      },
      { 
         "tagId":"2050362BE64C0DA5ED43978DD541DAA9",
         "tagHandle":"{\"shipmentId\":456,\"packageId\":\"2050362BE64C0DA5ED43978DD541DAA9\",\"referenceId\":\"2050362BE64C0DA5ED43978DD541DAA9\"}",
         "time":"1579758069000",
         "sensorData":[ 
            { 
               "type":"light",
               "isAnalysis":"true",
               "isAnomaly":"false",
               "currentValue":"35",
               "anomalyValue":"0"
            },
            { 
               "type":"humidity",
               "isAnalysis":"true",
               "isAnomaly":"false",
               "currentValue":"53",
               "anomalyValue":"0"
            },
            { 
               "type":"temperature",
               "isAnalysis":"true",
               "isAnomaly":"false",
               "currentValue":"27.9",
               "anomalyValue":"0.0"
            },
            { 
               "type":"pressure",
               "isAnalysis":"true",
               "isAnomaly":"false",
               "currentValue":"920",
               "anomalyValue":"0"
            },
            { 
               "type":"shock",
               "isAnalysis":"true",
               "isAnomaly":"false",
               "currentValue":"1000",
               "anomalyMinValue":"0",
               "anomalyMaxValue":"0",
               "anomalyCount":"1"
            },
            { 
               "type":"tilt",
               "isAnalysis":"true",
               "isAnomaly":"false",
               "currentValue":"0",
               "anomalyValue":"0"
            },
            { 
               "type":"battery",
               "isAnalysis":"true",
               "isAnomaly":"false",
               "currentValue":"100",
               "anomalyValue":"0"
            }
         ]
      }
   ],
   "location":{ 
      "latitude":"-200.0",
      "longitude":"-200.0",
      "altitude":"-1.0",
      "positionUncertainty":"-1.0",
      "locationMethod":"NoPosition",
      "timeOfPosition":"1579758070756",
      "cellTowers":[ 
         { 
            "cellId":20876215,
            "locationAreaCode":21802,
            "mobileCountryCode":404,
            "mobileNetworkCode":86,
            "signalStrength":-31
         }
      ],
      "wifiAccessPoints":[ 

      ]
   }
};
