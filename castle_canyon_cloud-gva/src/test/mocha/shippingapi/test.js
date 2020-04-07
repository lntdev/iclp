/* eslint-disable no-console */

const expect = T.expect;
const helper = T.helper.shippingapi;

describe('shippingapi test helper', function() {
  describe('#mergeGateways', function() {
    it('should rely on entity IDs', function() {
      const a = [
        {
          id: 'c8de532d23221e63',
          wsnId: 32768,
          panId: 16384,
          channelId: 1,
          shippingUnits: [
            {
              id: 'any packageId e412fe21f3fd22b4',
              tags: [
                { id: '17e343f3d009ff64', wsnId: 8192 }
              ]
            },
            {
              id: 'any packageId 5553da4c4e1c7b97',
              tags: [
                { id: 'eccd5fa6b9f3f6b0', wsnId: 8193 }
              ]
            }
          ]
        }
      ];
      const b = [
        {
          id: 'c8de532d23221e63',
          shippingUnits: [
            {
              id: 'any packageId e412fe21f3fd22b4',
              tags: [
                {
                  id: '17e343f3d009ff64',
                  wsnId: 8192,
                  thresholds: {
                    temperature: { min: 33, max: 73 },
                    humidity: { min: 53, max: 78 },
                    light: { min: 23, max: 33 },
                    pressure: { min: 83, max: 93 },
                    tilt: { max: 8 },
                    shock: { max: 16 },
                    battery: { min: 28 }
                  }
                }
              ]
            },
            {
              id: 'any packageId 5553da4c4e1c7b97',
              tags: [
                {
                  id: 'eccd5fa6b9f3f6b0',
                  wsnId: 8193,
                  thresholds: {
                    temperature: { min: 33, max: 73 },
                    humidity: { min: 53, max: 78 },
                    light: { min: 23, max: 33 },
                    pressure: { min: 83, max: 93 },
                    tilt: { max: 8 },
                    shock: { max: 16 },
                    battery: { min: 28 }
                  }
                }
              ]
            }
          ]
        }
      ];

      const actual = helper.shipment.mergeGateways(a, b);
      const expected = [
        {
          id: 'c8de532d23221e63',
          wsnId: 32768,
          panId: 16384,
          channelId: 1,
          shippingUnits: [
            {
              id: 'any packageId e412fe21f3fd22b4',
              tags: [
                {
                  id: '17e343f3d009ff64',
                  wsnId: 8192,
                  thresholds: {
                    temperature: { min: 33, max: 73 },
                    humidity: { min: 53, max: 78 },
                    light: { min: 23, max: 33 },
                    pressure: { min: 83, max: 93 },
                    tilt: { max: 8 },
                    shock: { max: 16 },
                    battery: { min: 28 }
                  }
                }
              ]
            },
            {
              id: 'any packageId 5553da4c4e1c7b97',
              tags: [
                {
                  id: 'eccd5fa6b9f3f6b0',
                  wsnId: 8193,
                  thresholds: {
                    temperature: { min: 33, max: 73 },
                    humidity: { min: 53, max: 78 },
                    light: { min: 23, max: 33 },
                    pressure: { min: 83, max: 93 },
                    tilt: { max: 8 },
                    shock: { max: 16 },
                    battery: { min: 28 }
                  }
                }
              ]
            }
          ]
        }
      ];

      expect(actual).to.be.deepEqualAndDefined(expected);
    });
  });

  describe('#buildExpected', function() {
    it('should build shipment JSON', function() {
      const origShip = {
        id: 604,
        status: 'new',
        shipmentId: 'any shipmentId',
        uShipmentId: 'any uShipmentId 6d1b76a5816581a2',
        shipmentName: 'any shipmentName',
        referenceId: 'any referenceId',
        shippingUnitCount: 2,
        shipmentNote: 'any shipmentNote',
        customerName: 'any customerName',
        customerEmail: 'anyCustomer@be88c2a6edea4900',
        customerAddress: {
          line1: 'any line1 eca366f4fb45a00d',
          city: 'any city 0d25f01eb7a9e775',
          state: 'any state 119d8fce2887ee5e',
          pin: 'any pin 799053b856a765a9',
          country: 'any country bf6f4530105544b0',
          phone: 'any phone a537e65bf7881aea'
        },
        earliestPickup: '2017-11-26 23:23:47',
        latestDelivery: '2017-11-26 23:23:47',
        pickupAddress: {
          line1: 'any line1 7617c1b821f5d03d',
          city: 'any city ec0625ce53bc4d54',
          state: 'any state 8c10d3c8d54e4823',
          pin: 'any pin dc3aac625547f2f2',
          country: 'any country c974f6720d849ee5',
          phone: 'any phone 50908dce5670fd4e'
        },
        deliveryAddress: {
          line1: 'any line1 8e445946a659cecb',
          city: 'any city 73076b9775dc606c',
          state: 'any state 45087024af187c55',
          pin: 'any pin ae01bc4f40efa427',
          country: 'any country b7e2b70097df7a5f',
          phone: 'any phone b2bdabef6cf6aa72'
        },
        tag2GwReportingTime: 123,
        gw2CloudReportingTime: 456,
        gateways: [
          {
            id: '',
            wsnId: 32768,
            panId: 16384,
            channelId: 1,
            shippingUnits: [
              {
                packageId: '',
                tags: [
                  {
                    id: '',
                    wsnId: 0,
                    thresholds: {
                      temperature: { min: 30, max: 70 },
                      humidity: { min: 50, max: 75 },
                      light: { min: 20, max: 30 },
                      pressure: { min: 80, max: 90 },
                      tilt: { max: 5 },
                      shock: { max: 13 },
                      battery: { min: 25 }
                    }
                  }
                ]
              },
              {
                packageId: '',
                tags: [
                  {
                    id: '',
                    wsnId: 0,
                    thresholds: {
                      temperature: { min: 30, max: 70 },
                      humidity: { min: 50, max: 75 },
                      light: { min: 20, max: 30 },
                      pressure: { min: 80, max: 90 },
                      tilt: { max: 5 },
                      shock: { max: 13 },
                      battery: { min: 25 }
                    }
                  }
                ]
              }
            ]
          }
        ],
        statusLockUser: 'any status lock user email',
        photos: {
          proof_of_delivery: { url: 'any proof_of_delivery url', note: 'any proof_of_delivery note' }
        }
      };

      const initialConfig = {
        gateways: [
          {
            id: '3702dad44fe5e99b',
            shippingUnits: [
              {
                id: 'any packageId 4aeef3d7e5956e9c',
                tags: [
                  { id: 'b23247d047864699', wsnId: 8192 }
                ]
              },
              {
                id: 'any packageId 133e5a040f87fdb1',
                tags: [
                  { id: 'e978637a305238d2', wsnId: 8193 }
                ]
              }
            ]
          }
        ]
      };

      const configChange = {
        tag2GwReportingTime: 126,
        gw2CloudReportingTime: 459,
        gateways: [
          {
            id: '3702dad44fe5e99b',
            shippingUnits: [
              {
                id: 'any packageId 4aeef3d7e5956e9c',
                tags: [
                  {
                    id: 'b23247d047864699',
                    thresholds: {
                      temperature: { min: 33, max: 73 },
                      humidity: { min: 53, max: 78 },
                      light: { min: 23, max: 33 },
                      pressure: { min: 83, max: 93 },
                      tilt: { max: 8 },
                      shock: { max: 16 },
                      battery: { min: 28 }
                    }
                  }
                ]
              },
              {
                id: 'any packageId 133e5a040f87fdb1',
                tags: [
                  {
                    id: 'e978637a305238d2',
                    thresholds: {
                      temperature: { min: 33, max: 73 },
                      humidity: { min: 53, max: 78 },
                      light: { min: 23, max: 33 },
                      pressure: { min: 83, max: 93 },
                      tilt: { max: 8 },
                      shock: { max: 16 },
                      battery: { min: 28 }
                    }
                  }
                ]
              }
            ]
          }
        ]
      };

      const expected = {
        id: 604,
        status: 'new',
        shipmentId: 'any shipmentId',
        uShipmentId: 'any uShipmentId 6d1b76a5816581a2',
        shipmentName: 'any shipmentName',
        referenceId: 'any referenceId',
        shippingUnitCount: 2,
        shipmentNote: 'any shipmentNote',
        customerName: 'any customerName',
        customerEmail: 'anyCustomer@be88c2a6edea4900',
        customerAddress: {
          line1: 'any line1 eca366f4fb45a00d',
          city: 'any city 0d25f01eb7a9e775',
          state: 'any state 119d8fce2887ee5e',
          pin: 'any pin 799053b856a765a9',
          country: 'any country bf6f4530105544b0',
          phone: 'any phone a537e65bf7881aea'
        },
        earliestPickup: '2017-11-26 23:23:47',
        latestDelivery: '2017-11-26 23:23:47',
        pickupAddress: {
          line1: 'any line1 7617c1b821f5d03d',
          city: 'any city ec0625ce53bc4d54',
          state: 'any state 8c10d3c8d54e4823',
          pin: 'any pin dc3aac625547f2f2',
          country: 'any country c974f6720d849ee5',
          phone: 'any phone 50908dce5670fd4e'
        },
        deliveryAddress: {
          line1: 'any line1 8e445946a659cecb',
          city: 'any city 73076b9775dc606c',
          state: 'any state 45087024af187c55',
          pin: 'any pin ae01bc4f40efa427',
          country: 'any country b7e2b70097df7a5f',
          phone: 'any phone b2bdabef6cf6aa72'
        },
        tag2GwReportingTime: 126,
        gw2CloudReportingTime: 459,
        gateways: [
          {
            id: '3702dad44fe5e99b',
            wsnId: 32768,
            panId: 16384,
            channelId: 1,
            shippingUnits: [
              {
                id: 'any packageId 4aeef3d7e5956e9c',
                tags: [
                  {
                    id: 'b23247d047864699',
                    wsnId: 8192,
                    thresholds: {
                      temperature: { min: 33, max: 73 },
                      humidity: { min: 53, max: 78 },
                      light: { min: 23, max: 33 },
                      pressure: { min: 83, max: 93 },
                      tilt: { max: 8 },
                      shock: { max: 16 },
                      battery: { min: 28 }
                    }
                  }
                ]
              },
              {
                id: 'any packageId 133e5a040f87fdb1',
                tags: [
                  {
                    id: 'e978637a305238d2',
                    wsnId: 8193,
                    thresholds: {
                      temperature: { min: 33, max: 73 },
                      humidity: { min: 53, max: 78 },
                      light: { min: 23, max: 33 },
                      pressure: { min: 83, max: 93 },
                      tilt: { max: 8 },
                      shock: { max: 16 },
                      battery: { min: 28 }
                    }
                  }
                ]
              }
            ]
          }
        ],
        statusLockUser: 'any status lock user email',
        photos: {
          proof_of_delivery: { url: 'any proof_of_delivery url', note: 'any proof_of_delivery note' }
        }
      };

      let merge = Object.assign({}, initialConfig, configChange);
      merge.gateways = helper.shipment.mergeGateways(initialConfig.gateways, configChange.gateways);
      const actual = helper.shipment.buildExpected(origShip, {
        merge: merge
      });

      expect(actual).to.be.deepEqualAndDefined(expected);
    });
  });
});
