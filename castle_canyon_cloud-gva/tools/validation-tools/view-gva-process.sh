#!/bin/bash

CONTAINER_ID="unknown-barf"

if [ "$1" == "" ]; then
    echo "specify a CONTAINER ID in arg 1"
    echo "here are the running containers:"
    docker container ls
    exit 1
fi

CONTAINER_ID="$1"

if [ "$2" == "" ]; then
    echo "specify a speciic GVA PM2 process id"
    echo "Here are a list of GVA processes in the container you specified"
    docker exec -u ubuntu -it "$CONTAINER_ID" pm2 list
    exit 1
fi

GVA_PROCESS="$2"

echo "this script enters the GVA container and automatically runs the command:"
echo "     pm2 logs --lines 100 "
echo ""
echo "to exit the container, hit CTRL-C"

docker exec -u ubuntu -it "$CONTAINER_ID" pm2 log "$GVA_PROCESS" --lines 100

