# Docker и Traefik - Итоговая информация

## 📁 Созданные файлы

### 1. **Dockerfile** - Multi-stage сборка приложения
- **Stage 1 (builder)**: Использует Node.js 22-alpine для сборки React приложения
- **Stage 2 (runner)**: Использует Nginx Alpine для раздачи статики
- Оптимизирован для минимального размера образа
- Включает health check

**Особенности:**
- Использует unprivileged nginx (порт 8080 вместо 80)
- Кэширование npm пакетов для быстрой пересборки
- Health check endpoint: `/health`

### 2. **nginx.conf** - Конфигурация веб-сервера
- SPA routing поддержка (try_files для React Router)
- Gzip компрессия для всех текстовых файлов
- Кэширование статических ресурсов (1 год)
- Security headers (X-Frame-Options, X-Content-Type-Options и т.д.)
- Health check endpoint

### 3. **docker-compose.yml** - Продакшен с Traefik
Полная интеграция с Traefik reverse proxy:

**Автоматические функции:**
- SSL сертификаты через Let's Encrypt
- HTTP → HTTPS redirect
- WWW → non-WWW redirect (опционально)
- Security headers middleware
- Health checks

**Labels для Traefik:**
```yaml
traefik.enable=true
traefik.http.routers.*.rule=Host(`ph1l74.com`)
traefik.http.routers.*-secure.tls.certresolver=letsencrypt
```

### 4. **docker-compose.local.yml** - Локальная разработка
Упрощенная версия без Traefik:
- Прямое проброс портов (3000:8080)
- Нет SSL
- Быстрый запуск для тестирования

### 5. **.dockerignore** - Оптимизация образа
Исключает из образа:
- node_modules
- build артефакты
- IDE файлы
- документацию
- Git файлы

### 6. **DEPLOYMENT.md** - Подробное руководство
Полная документация по:
- Локальному развертыванию
- Продакшен развертыванию с Traefik
- Настройке SSL
- Мониторингу и troubleshooting
- CI/CD примеры

### 7. **QUICK_START.md** - Быстрый старт
Краткие команды для:
- Быстрого локального запуска
- Продакшен деплоя
- Управления контейнерами

## 🚀 Быстрый запуск

### Локально (без Traefik)
```bash
docker-compose -f docker-compose.local.yml up --build
# → http://localhost:3000
```

### Продакшен (с Traefik)
```bash
# 1. Создать сеть
docker network create traefik-network

# 2. Запустить
docker-compose up -d --build

# 3. Проверить
docker-compose logs -f
```

## 🔧 NPM скрипты

Добавлены новые команды в `package.json`:
```bash
npm run docker:local        # Запуск локально
npm run docker:local:down   # Остановка локальной версии
npm run docker:prod         # Запуск в продакшене
npm run docker:logs         # Просмотр логов
```

## 📊 Архитектура

```
┌─────────────────────────────────────────────────┐
│                   Internet                       │
└────────────────┬────────────────────────────────┘
                 │
                 │ HTTPS (443)
                 │ HTTP (80)
                 ▼
┌─────────────────────────────────────────────────┐
│              Traefik Reverse Proxy              │
│  • SSL Termination (Let's Encrypt)             │
│  • HTTP → HTTPS Redirect                        │
│  • Load Balancing                               │
│  • Health Checks                                │
└────────────────┬────────────────────────────────┘
                 │
                 │ traefik-network
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│         ph1l74-frontend Container               │
│  ┌───────────────────────────────────────────┐ │
│  │     Nginx (unprivileged) :8080            │ │
│  │  • React SPA routing                      │ │
│  │  • Gzip compression                       │ │
│  │  • Static file caching                    │ │
│  │  • Security headers                       │ │
│  └───────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
```

## 🔐 Безопасность

### Реализованные меры:
1. **Unprivileged Nginx** - работает не от root
2. **Security Headers** - защита от XSS, clickjacking и т.д.
3. **SSL/TLS** - автоматические сертификаты Let's Encrypt
4. **Health Checks** - автоматическое обнаружение проблем
5. **Network Isolation** - изолированная Docker сеть

### Headers установленные в Nginx:
- `X-Frame-Options: SAMEORIGIN`
- `X-Content-Type-Options: nosniff`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: no-referrer-when-downgrade`

### Headers от Traefik (в middleware):
- `Strict-Transport-Security` (HSTS)
- SSL Redirect
- Force HTTPS

## 📈 Производительность

### Оптимизации:
1. **Gzip компрессия** - уменьшение размера передаваемых данных на ~70%
2. **Статическое кэширование** - браузерное кэширование на 1 год для JS/CSS/изображений
3. **Multi-stage build** - минимальный размер финального образа (~30MB)
4. **Alpine Linux** - легковесная ОС
5. **npm ci с кэшированием** - быстрая пересборка

### Ожидаемые метрики:
- Время первой загрузки: <2s
- Размер образа: ~30-40MB
- Memory usage: ~10-20MB
- CPU usage: минимальное

## 🌐 Настройка домена

### 1. DNS записи
Добавьте A-записи в вашем DNS:
```
A    @              <YOUR_SERVER_IP>
A    www            <YOUR_SERVER_IP>
```

### 2. Обновите docker-compose.yml
```yaml
labels:
  - "traefik.http.routers.ph1l74-frontend.rule=Host(`your-domain.com`) || Host(`www.your-domain.com`)"
  - "traefik.http.routers.ph1l74-frontend-secure.rule=Host(`your-domain.com`) || Host(`www.your-domain.com`)"
```

### 3. Перезапустите контейнер
```bash
docker-compose up -d --force-recreate
```

## 🔍 Мониторинг

### Health Check
```bash
# Через Docker
docker ps  # Смотрите колонку STATUS

# Напрямую
curl http://localhost:8080/health
```

### Логи
```bash
# Все логи
docker-compose logs -f

# Только ошибки
docker-compose logs -f | grep -i error

# Nginx access log
docker-compose exec frontend tail -f /var/log/nginx/access.log

# Nginx error log
docker-compose exec frontend tail -f /var/log/nginx/error.log
```

## 🛠 Troubleshooting

### Проблема: Контейнер не запускается
```bash
# Проверьте логи
docker-compose logs frontend

# Проверьте сеть
docker network inspect traefik-network

# Пересоберите без кэша
docker-compose build --no-cache
```

### Проблема: SSL сертификат не выдается
```bash
# Проверьте, что домен указывает на ваш сервер
nslookup your-domain.com

# Проверьте логи Traefik
docker logs traefik

# Убедитесь, что порты 80 и 443 открыты
sudo ufw status
```

### Проблема: 502 Bad Gateway
```bash
# Проверьте, что контейнер запущен
docker ps

# Проверьте health status
docker ps | grep frontend

# Проверьте, что Nginx слушает порт 8080
docker-compose exec frontend netstat -tulpn | grep 8080
```

## 📚 Дополнительные ресурсы

- [Docker Documentation](https://docs.docker.com/)
- [Traefik Documentation](https://doc.traefik.io/traefik/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)

## 🎯 Следующие шаги

1. **Протестируйте локально**: `npm run docker:local`
2. **Настройте Traefik** на вашем сервере
3. **Обновите домен** в docker-compose.yml
4. **Разверните в продакшене**: `npm run docker:prod`
5. **Настройте мониторинг** (Prometheus, Grafana)
6. **Настройте CI/CD** для автоматического деплоя

## ✅ Checklist для деплоя

- [ ] Установлен Docker и Docker Compose
- [ ] Настроен Traefik с Let's Encrypt
- [ ] Создана сеть `traefik-network`
- [ ] DNS записи указывают на сервер
- [ ] Обновлен домен в docker-compose.yml
- [ ] Открыты порты 80 и 443
- [ ] Настроен firewall (UFW/iptables)
- [ ] Протестирован health check
- [ ] Настроен мониторинг логов
- [ ] Настроен backup (если требуется)
- [ ] Документирован процесс обновления

---

**Версия:** 1.0.2  
**Дата:** 11 октября 2025  
**Автор:** ph1l74

