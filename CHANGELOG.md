# Changelog

## [1.0.2] - 2025-10-11

### Добавлено
- Docker поддержка с multi-stage build
- `Dockerfile` для контейнеризации приложения
- `nginx.conf` с оптимизацией для React SPA
- `docker-compose.yml` с полной интеграцией Traefik (SSL, redirects, headers)
- `docker-compose.local.yml` для локальной разработки
- `.dockerignore` для оптимизации размера образа
- Health check endpoint `/health` в Nginx
- Gzip compression для статических файлов
- Кэширование статических ресурсов
- Security headers в Nginx конфигурации
- Документация по Docker и Traefik в README

### Особенности Docker образа
- Multi-stage build: Node.js (builder) + Nginx Alpine (runner)
- Unprivileged Nginx (порт 8080)
- Автоматическая конфигурация с Traefik labels
- Поддержка Let's Encrypt для SSL
- Оптимизированный размер финального образа

## [1.0.1] - 2025-10-11

### Исправлено
- Исправлена ошибка с PostCSS конфигурацией для Tailwind CSS v4
- Установлен официальный `@tailwindcss/vite` плагин для Vite
- Обновлен `vite.config.ts` с поддержкой нового плагина
- Удален устаревший `postcss.config.js` (не требуется при использовании Vite плагина)
- Обновлен `index.css` для использования синтаксиса Tailwind CSS v4 (`@import "tailwindcss"` и `@theme`)
- Перенесены анимации из JS конфига в CSS с использованием `@theme` директивы
- Упрощен `tailwind.config.js` (оставлен только content)

### Технические детали
В Tailwind CSS v4 изменилась интеграция с PostCSS:
- Для Vite теперь используется отдельный пакет `@tailwindcss/vite`
- Вместо `@tailwind base/components/utilities` используется `@import "tailwindcss"`
- Кастомные темы и анимации настраиваются через `@theme` блок в CSS

## [1.0.0] - 2025-10-11

### Добавлено
- Создано React TypeScript приложение с использованием Vite
- Реализована архитектура FSD (Feature-Sliced Design)
- Интегрированы компоненты из Aceternity UI:
  - Background Gradient Animation
  - Background Ripple Effect
- Созданы два интерактивных блока (ART и DEV)
- Настроены path aliases (@/) для удобного импорта
- Добавлена полная типизация TypeScript
- Настроен Tailwind CSS для стилизации

