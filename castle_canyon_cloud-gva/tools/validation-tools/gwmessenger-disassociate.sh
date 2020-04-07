#!/bin/bash

# pull in private env vars
. ~/private/container-env-private.template.txt

# create a python 3 environment that makes the httpie tool (aka 'http' command) available
. ~/venvpy3/bin/activate

echo "gwmessenger is targeting $gva_gwmessenger_test_device_id "
echo "if that device id is incorrect, you need to change that environment variable"
echo "and restart the GVA docker container. (Andy and Arvind can help if needed)"

# poke gwmessenger via port 3001 to cause it to generate a north-to-south disassociation request message
# to the configured test device in environment variable : gva_gwmessenger_test_device_id
# this is using the httpie tool : https://httpie.org/doc

http http://localhost:3000/event/disassociate \
shipmentId="gwmessenger-disassociate-script" \
requestId="req-from-test-script"

