#!/bin/bash
IMAGE_ID="unknown-barf"

if [ "$1" == "" ]; then
        echo "specify a image id in arg 1"
        echo "here are the available images:"
docker images
exit 1
fi

echo "here are the available images (just in case)"
docker images

IMAGE_ID="$1"

echo IMAGE_ID is $IMAGE_ID

#this runs the container
docker \
    run \
    --env-file '/home/ubuntu/private/gva.env' \
    --restart always \
    -p=3001:3001 \
    -p=3002:3002 \
    --name gva \
    -d "$IMAGE_ID"
