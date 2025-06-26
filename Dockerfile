# Используем официальный slim-образ Python
FROM python:3.10-slim

# Устанавливаем рабочую директорию
WORKDIR /app

# Устанавливаем системные зависимости
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Копируем дефолтные static/ и templates/ в отдельную директорию
COPY cofemine-website/static/ /defaults/static/
COPY cofemine-website/templates/ /defaults/templates/

# Копируем остальной проект (включая Flask-приложение, requirements.txt и т.д.)
COPY . .

# Устанавливаем Python-зависимости
RUN pip install --no-cache-dir -r requirements.txt

# Копируем и делаем исполняемым entrypoint
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Открываем порт
EXPOSE 25577

# Используем entrypoint, который копирует файлы если volume пуст
ENTRYPOINT ["/entrypoint.sh"]
CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:25577", "app:app"]
