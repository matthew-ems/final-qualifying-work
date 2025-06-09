#!/bin/bash

#   yiJUMWgu38m+5f

REMOTE_HOST="80.248.60.201"
REMOTE_USER="root"
CONTAINER_NAME="dev"

clear

ssh ${REMOTE_USER}@${REMOTE_HOST} << EOF
  set -e

  if docker ps | grep -q ${CONTAINER_NAME}; then
    echo "Container logs: "
    docker logs -f ${CONTAINER_NAME}
  else
    echo "Container 'dev' is not running."
    echo "Now the last 50 lines of logs will be shown"
    docker logs --tail 50 ${CONTAINER_NAME}
  fi

EOF