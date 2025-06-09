#!/bin/bash

#   yiJUMWgu38m+5f

REMOTE_HOST="80.248.60.201"
REMOTE_USER="root"
CONTAINER_NAME="dev"
IMAGE_NAME="fn-backend"

clear

ssh ${REMOTE_USER}@${REMOTE_HOST} << EOF
  set -e
  
  if docker ps | grep -q ${CONTAINER_NAME}; then
    echo "Stopping container '${CONTAINER_NAME}'..."
    docker stop ${CONTAINER_NAME}
  else
    echo "Container 'dev' is not running."
  fi

  if docker ps -a | grep -q ${CONTAINER_NAME}; then
    echo "Removing container '${CONTAINER_NAME}'..."
    docker rm ${CONTAINER_NAME}
  else
    echo "Container '${CONTAINER_NAME}' does not exist."
  fi

EOF