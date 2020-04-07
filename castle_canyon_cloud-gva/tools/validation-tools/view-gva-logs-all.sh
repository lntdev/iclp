#!/bin/bash

CONTAINER_ID="unknown-barf"

if [ "$1" == "" ]; then
    echo "specify a CONTAINER ID in arg 1"
    echo "here are the running containers:"
    docker container ls
    exit 1
fi

CONTAINER_ID="$1"

echo "this script enters the GVA container and automatically runs the command:"
echo "     pm2 logs --lines 100 "
echo ""
echo "to exit the container, hit CTRL-C"

docker exec -u ubuntu -it "$CONTAINER_ID" pm2 logs --lines 100

