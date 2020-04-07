#!/bin/bash

# currently visually monitoring output at the following places:
#  1) gwmessenger receives events via REST
#  2) gwmessenger sends C2D message
#  3) devicesim receives C2D message
#  4) devicesim looks at C2D message and sends an appropriate D2C response
#  5) gwlistener receives the D2C response (via IoT/Event Hub).
#  6) inspect stdout messages from gwlistener to ensure correct

#
# this issues a 'test' event, which causes a 'test' C2D message
# to be sent to the gateway(devicesim).
# the gateway then responds with several message
#   - test response
#   - association complete message
#   - sensor data (not encrypted)
#
http http://localhost:3000/event/test shippingid=doozle

#
# this issues a 'config change' event for a shippingid
# gwmessenger then sends a C2C multiple config change request
# gateway(devicesim) then responds with a multiple config change response D2C message
#
http http://localhost:3000/event/configchange shippingid=shmoozle

#
# this issues a disassociate event for a shipping id
# gwmessenger then sends a C2D disassociation request message
# gateway(devicesim) then responds with a disassociation response D2C message
#
http http://localhost:3000/event/disassociate shippingid=shmoozle
