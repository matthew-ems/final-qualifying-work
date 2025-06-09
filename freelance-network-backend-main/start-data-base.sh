#!/bin/bash

clear

CONTAINER_NAME="postgres-db"

POSTGRES_PASSWORD="1234"
POSTGRES_DB="freelance-network"

if (! docker info > /dev/null 2>&1); then
    echo "Docker не запущен. Запустите его в ручную."
    exit 1
fi

if [ "$(docker ps -q -f name=${CONTAINER_NAME})" ]; then
    echo "Контейнер ${CONTAINER_NAME} уже запущен."
else
    echo "Контейнер ${CONTAINER_NAME} не запущен. Запуск..."
    docker run --name ${CONTAINER_NAME} -e POSTGRES_PASSWORD=${POSTGRES_PASSWORD} -e POSTGRES_DB=${POSTGRES_DB} -d -p 5432:5432 postgres
    echo "Контейнер ${CONTAINER_NAME} запущен."
fi