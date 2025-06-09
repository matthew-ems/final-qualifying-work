#!/bin/bash

#Password bmXm5V@RS1kGS^

# === ПАРАМЕТРЫ ===
IMAGE_NAME="front:latest"
TAR_FILE="app.tar"
REMOTE_USER="root"
REMOTE_HOST="83.217.223.238"
REMOTE_PATH="/dockerfiles/"
CONTAINER_NAME="dev"
APP_PORT="8080"

# === Очистка терминала ===
clear

# === Очистка старой сборки Vite ===
echo "Start cleaning"
rm -rf dist

# === Сборка фронта ===
echo "Start building project"
npm install
npm run build

# === Сборка Docker-образа через docker-compose ===
echo "Start building Docker image"
docker-compose build

if [ $? -ne 0 ]; then
  echo "❌ Ошибка сборки. Прерывание."
  exit 1
fi

# === Сохраняем образ в .tar файл ===
echo "Saving image to tar file"
docker save -o ${TAR_FILE} front:latest

if [ $? -ne 0 ]; then
  echo "❌ Ошибка сохранения Docker-образа. Прерывание."
  exit 1
fi

# === Копируем tar-файл на сервер ===
echo "Copying image to remote server..."
scp ${TAR_FILE} ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_PATH}

if [ $? -ne 0 ]; then
  echo "❌ Ошибка копирования. Прерывание."
  exit 1
fi

echo "✅ Образ успешно отправлен."

# === Удаляем локальный tar-файл ===
rm -f ${TAR_FILE}

# === Подключение и развертывание на сервере ===
echo "Deploying on remote server..."
ssh ${REMOTE_USER}@${REMOTE_HOST} << EOF
  set -e

  echo "📁 Создание директории (если нет)..."
  mkdir -p ${REMOTE_PATH}

  echo "📦 Переход в каталог с образом..."
  cd ${REMOTE_PATH}

  echo "🛑 Остановка старого контейнера (если есть)..."
  docker stop ${CONTAINER_NAME} || true
  docker rm ${CONTAINER_NAME} || true

  echo "🧹 Очистка старого образа (если есть)..."
  docker rmi front:latest || true

  echo "📥 Загрузка нового Docker-образа..."
  docker load -i ${TAR_FILE}

  echo "🚀 Запуск нового контейнера..."
  docker run -d --name ${CONTAINER_NAME} -p ${APP_PORT}:${APP_PORT} front:latest
EOF

echo "✅ Деплой завершён успешно."
