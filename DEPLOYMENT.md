# Руководство по развертыванию

## Предварительные требования

- Docker 20.10+
- Docker Compose 2.0+
- Traefik (для продакшен окружения)

## Локальное развертывание

### Вариант 1: С помощью Docker

```bash
# Сборка и запуск контейнера
docker-compose -f docker-compose.local.yml up --build -d

# Приложение доступно на http://localhost:3000
```

### Вариант 2: Без Docker (разработка)

```bash
# Установка зависимостей
npm install

# Запуск dev сервера
npm run dev

# Приложение доступно на http://localhost:5173
```

## Продакшен развертывание с Traefik

### 1. Подготовка сервера

```bash
# Создание директории проекта
mkdir -p /opt/ph1l74.com
cd /opt/ph1l74.com

# Клонирование репозитория (или копирование файлов)
git clone <repository-url> .
```

### 2. Настройка Traefik

Убедитесь, что Traefik запущен и настроен. Пример базовой конфигурации Traefik:

```yaml
# traefik/docker-compose.yml
version: '3.8'

services:
  traefik:
    image: traefik:v2.10
    container_name: traefik
    restart: unless-stopped
    security_opt:
      - no-new-privileges:true
    ports:
      - "80:80"
      - "443:443"
    networks:
      - traefik-network
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - ./traefik.yml:/traefik.yml:ro
      - ./acme.json:/acme.json
      - ./config:/config:ro

networks:
  traefik-network:
    external: true
```

```yaml
# traefik/traefik.yml
api:
  dashboard: true

entryPoints:
  web:
    address: ":80"
    http:
      redirections:
        entryPoint:
          to: websecure
          scheme: https
  websecure:
    address: ":443"

providers:
  docker:
    endpoint: "unix:///var/run/docker.sock"
    exposedByDefault: false
    network: traefik-network

certificatesResolvers:
  letsencrypt:
    acme:
      email: your-email@example.com
      storage: acme.json
      httpChallenge:
        entryPoint: web
```

### 3. Создание Docker сети

```bash
docker network create traefik-network
```

### 4. Настройка docker-compose.yml

Отредактируйте `docker-compose.yml`, указав ваш домен:

```yaml
labels:
  - "traefik.http.routers.ph1l74-frontend.rule=Host(`your-domain.com`) || Host(`www.your-domain.com`)"
  - "traefik.http.routers.ph1l74-frontend-secure.rule=Host(`your-domain.com`) || Host(`www.your-domain.com`)"
```

### 5. Запуск приложения

```bash
# Сборка и запуск в фоновом режиме
docker-compose up -d --build

# Проверка логов
docker-compose logs -f frontend

# Проверка статуса
docker-compose ps
```

### 6. Проверка работы

```bash
# Проверка health endpoint
curl http://localhost:8080/health

# Проверка через домен (после настройки DNS)
curl https://your-domain.com
```

## Обновление приложения

```bash
# Остановка контейнера
docker-compose down

# Обновление кода (git pull или замена файлов)
git pull

# Пересборка и запуск
docker-compose up -d --build

# Очистка старых образов (опционально)
docker image prune -f
```

## Управление

### Просмотр логов

```bash
# Все логи
docker-compose logs -f

# Только ошибки
docker-compose logs -f frontend | grep error

# Последние 100 строк
docker-compose logs --tail=100 frontend
```

### Перезапуск

```bash
# Перезапуск без пересборки
docker-compose restart

# Полная пересборка
docker-compose up -d --build --force-recreate
```

### Остановка

```bash
# Остановка контейнеров
docker-compose stop

# Остановка и удаление контейнеров
docker-compose down

# Остановка с удалением volumes
docker-compose down -v
```

## Мониторинг

### Health Checks

Docker автоматически проверяет health status:

```bash
docker ps
# Смотрите колонку STATUS для health status
```

### Метрики Nginx

Для включения метрик можно добавить stub_status в nginx.conf:

```nginx
location /nginx_status {
    stub_status on;
    access_log off;
    allow 127.0.0.1;
    deny all;
}
```

## Безопасность

### Рекомендации

1. **SSL сертификаты**: Убедитесь, что Let's Encrypt настроен корректно
2. **Firewall**: Настройте UFW или iptables
3. **Updates**: Регулярно обновляйте Docker образы
4. **Backups**: Настройте backup strategy для важных данных
5. **Monitoring**: Используйте системы мониторинга (Prometheus, Grafana)

### Настройка Firewall (UFW)

```bash
# Разрешить SSH, HTTP, HTTPS
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

## Troubleshooting

### Проблемы с сетью

```bash
# Проверка сетей
docker network ls

# Пересоздание сети
docker network rm traefik-network
docker network create traefik-network
```

### Проблемы с SSL

```bash
# Проверка acme.json
ls -la /path/to/traefik/acme.json

# Права должны быть 600
chmod 600 /path/to/traefik/acme.json
```

### Ошибки сборки

```bash
# Очистка cache
docker builder prune -a

# Пересборка без cache
docker-compose build --no-cache
```

## CI/CD

Пример GitHub Actions workflow:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to server
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.HOST }}
          username: ${{ secrets.USERNAME }}
          key: ${{ secrets.SSH_KEY }}
          script: |
            cd /opt/ph1l74.com
            git pull
            docker-compose up -d --build
            docker image prune -f
```

## Масштабирование

Для горизонтального масштабирования:

```yaml
services:
  frontend:
    # ... остальная конфигурация
    deploy:
      replicas: 3
      update_config:
        parallelism: 1
        delay: 10s
      restart_policy:
        condition: on-failure
```

## Поддержка

Для вопросов и проблем создавайте issue в репозитории.

