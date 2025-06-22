# Используем официальный slim-образ Python
FROM python:3.10-slim

# Устанавливаем рабочую директорию
WORKDIR /app

# Устанавливаем системные зависимости
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Копируем файлы проекта
COPY . .

# Устанавливаем зависимости
RUN pip install --no-cache-dir -r requirements.txt

# Открываем порт
EXPOSE 25577

# Используем Gunicorn с 4 воркерами (можно подстроить под CPU)
CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:25577", "app:app"]
