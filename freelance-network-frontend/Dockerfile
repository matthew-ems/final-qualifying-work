# Используем официальный образ Nginx с Alpine Linux
FROM nginx:alpine

# Копируем собранные файлы из папки build в корневую директорию Nginx
COPY dist /usr/share/nginx/html

# Копируем конфигурацию Nginx
COPY nginx/nginx.conf /etc/nginx/nginx.conf

# Копируем SSL сертификаты
COPY nginx/cert.crt /etc/nginx/ssl/cert.crt
COPY nginx/cert.key /etc/nginx/ssl/cert.key

# Экспонируем порт 443 для HTTPS
EXPOSE 8080

# Запускаем Nginx при старте контейнера
CMD ["nginx", "-g", "daemon off;"]
