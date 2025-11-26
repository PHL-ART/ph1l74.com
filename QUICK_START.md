# Быстрый старт

## 🚀 Локальная разработка (без Docker)

```bash
npm install
npm run dev
```

Откройте http://localhost:5173

## 🐳 Локальная разработка (Docker)

```bash
docker-compose -f docker-compose.local.yml up --build
```

Откройте http://localhost:3000

## 📦 Продакшен (с Traefik)

### 1. Создайте Docker сеть

```bash
docker network create traefik-network
```

### 2. Настройте домен в docker-compose.yml

```yaml
# Замените ph1l74.com на ваш домен
- "traefik.http.routers.ph1l74-frontend.rule=Host(`your-domain.com`)"
```

### 3. Запустите контейнер

```bash
docker-compose up -d --build
```

### 4. Проверьте статус

```bash
docker-compose ps
docker-compose logs -f
```

## 🛠 Полезные команды

### Разработка
```bash
npm run dev      # Dev сервер
npm run build    # Сборка для продакшена
npm run preview  # Просмотр продакшен сборки
npm run lint     # Проверка кода
```

### Docker
```bash
# Локальная разработка
docker-compose -f docker-compose.local.yml up --build
docker-compose -f docker-compose.local.yml down

# Продакшен
docker-compose up -d --build       # Запуск
docker-compose logs -f             # Логи
docker-compose restart             # Перезапуск
docker-compose down                # Остановка
```

### Обновление
```bash
git pull
docker-compose up -d --build
docker image prune -f
```

## 📚 Дополнительная информация

- [README.md](./README.md) - Полная документация проекта
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Подробное руководство по развертыванию
- [CHANGELOG.md](./CHANGELOG.md) - История изменений

## 🔧 Структура проекта

```
ph1l74.com/
├── src/
│   ├── shared/        # Переиспользуемые модули (FSD)
│   ├── widgets/       # Композитные блоки
│   ├── pages/         # Страницы
│   └── App.tsx        # Корневой компонент
├── Dockerfile         # Docker образ
├── nginx.conf         # Конфигурация Nginx
├── docker-compose.yml # Продакшен с Traefik
└── docker-compose.local.yml  # Локальная разработка
```

## ❓ Проблемы?

1. Проверьте логи: `docker-compose logs -f`
2. Пересоберите: `docker-compose build --no-cache`
3. Проверьте сеть: `docker network ls`
4. Читайте [DEPLOYMENT.md](./DEPLOYMENT.md) для troubleshooting

