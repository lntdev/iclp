#!/bin/bash
if [ "$1" == "" ]; then
CONTAINER_ID="gva"
else
CONTAINER_ID="$1"
fi

echo "once inside, run this to check on the GVA processes"
echo ""
echo " pm2 list"
echo ""
docker exec -it "$CONTAINER_ID" /bin/bash
