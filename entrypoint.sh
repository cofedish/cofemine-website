#!/bin/sh

copy_if_empty() {
  SRC="$1"
  DEST="$2"

  if [ ! -d "$DEST" ] || [ -z "$(ls -A "$DEST" 2>/dev/null)" ]; then
    echo "[init] $DEST пуст, копируем из $SRC"
    mkdir -p "$DEST"
    cp -r "$SRC"/* "$DEST"/
  else
    echo "[init] $DEST уже содержит файлы, пропускаем"
  fi
}

copy_if_empty "/defaults/static" "/app/static"
copy_if_empty "/defaults/templates" "/app/templates"

exec "$@"
