#!/bin/bash

# Настройки
GITHUB_API="https://api.github.com/repos/USER/REPO/releases/latest"
LOCAL_VERSION_FILE="/app/local_version"
MODS_DIR="/app/mods"
DOCKER_CONTAINER_NAME="minecraft-server"

# Проверка последнего релиза
LATEST_RELEASE=$(curl -s $GITHUB_API)
LATEST_VERSION=$(echo $LATEST_RELEASE | jq -r '.tag_name')
ZIP_URL=$(echo $LATEST_RELEASE | jq -r '.assets[0].browser_download_url')

# Проверка локальной версии
if [ -f "$LOCAL_VERSION_FILE" ]; then
  LOCAL_VERSION=$(cat "$LOCAL_VERSION_FILE")
else
  LOCAL_VERSION=""
fi

if [ "$LATEST_VERSION" != "$LOCAL_VERSION" ]; then
  echo "Найдена новая версия: $LATEST_VERSION. Обновляем..."
  
  # Скачивание нового архива
  curl -L -o server.zip $ZIP_URL
  
  # Очистка старых модов и разархивация новых
  mkdir -p $MODS_DIR
  rm -rf $MODS_DIR/*
  unzip server.zip -d $MODS_DIR
  
  # Сохранение новой версии
  echo $LATEST_VERSION > $LOCAL_VERSION_FILE
  
  # Перезапуск Docker-контейнера
  docker stop $DOCKER_CONTAINER_NAME || true
  docker rm $DOCKER_CONTAINER_NAME || true
  docker run -d --name $DOCKER_CONTAINER_NAME \
    -v $MODS_DIR:/data/mods \
    -e EULA=TRUE \
    -e TYPE=FORGE \
    -e VERSION=1.20.1 \
    -e FORGEVERSION=47.3.22 \
    -e JVM_OPTS="-Xmx6G -Xms1G" \
    -p 25565:25565 \
    itzg/minecraft-server:latest
  
  echo "Сервер обновлён и запущен с новой версией."
else
  echo "Новых версий не найдено."
fi
