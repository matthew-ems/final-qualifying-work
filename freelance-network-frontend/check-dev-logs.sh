#!/bin/bash

# password => kFR77x7KF,_,na

# Параметры
REMOTE_USER="root"
REMOTE_HOST="83.217.223.238"
CONTAINER_NAME="dev"

# Очистка консоли
clear

ssh ${REMOTE_USER}@${REMOTE_HOST} << EOF
  set -e

  # check logs
  if docker ps | grep -q ${CONTAINER_NAME}; then
    docker logs -f ${CONTAINER_NAME}
  else
    echo "Container '${CONTAINER_NAME}' is not running."
  fi

EOF