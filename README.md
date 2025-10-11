# ph1l74.com

Одностраничное приложение на React TypeScript с использованием Aceternity UI компонентов.

## Описание

Приложение разделено на два интерактивных блока:
- **ART** (верхний блок) - с анимированным градиентным фоном, перенаправляет на art.ph1l74.com
- **DEV** (нижний блок) - с эффектом ripple на сетке, перенаправляет на dev.ph1l74.com

## Технологии

- **React 19** - библиотека для создания пользовательских интерфейсов
- **TypeScript** - типизированный JavaScript
- **Vite 7** - быстрый сборщик и dev сервер
- **Tailwind CSS v4** - utility-first CSS фреймворк (с @tailwindcss/vite плагином)
- **Aceternity UI** - компоненты для фоновых эффектов
- **FSD** (Feature-Sliced Design) - архитектура приложения

## Структура проекта (FSD)

```
src/
├── shared/              # Переиспользуемые модули
│   ├── ui/             # UI компоненты
│   │   ├── background-gradient-animation.tsx
│   │   ├── background-ripple-effect.tsx
│   │   └── index.ts
│   ├── lib/            # Утилиты
│   │   ├── utils.ts
│   │   └── index.ts
│   └── config/         # Конфигурация и константы
│       └── constants.ts
├── widgets/            # Композитные блоки
│   ├── art-block.tsx
│   └── dev-block.tsx
├── pages/              # Страницы приложения
│   └── home-page.tsx
├── App.tsx            # Корневой компонент
└── main.tsx           # Точка входа
```

## Установка и запуск

### Требования

- Node.js 20.19+ или 22.12+
- npm 10+

### Установка зависимостей

```bash
npm install
```

### Запуск dev сервера

```bash
npm run dev
```

Приложение будет доступно по адресу http://localhost:5173/

### Сборка для продакшена

```bash
npm run build
```

Собранные файлы будут в папке `dist/`

### Предпросмотр продакшен сборки

```bash
npm run preview
```

## Компоненты

### Background Gradient Animation

Компонент с анимированным градиентным фоном из Aceternity UI.

**Особенности:**
- Анимированные цветные круги
- Интерактивность при наведении курсора
- Настраиваемые цвета и параметры анимации

### Background Ripple Effect

Компонент с эффектом ripple на сетке при клике.

**Особенности:**
- Интерактивная сетка
- Анимация при клике на ячейки
- Настраиваемое количество строк и столбцов

## Настройка

### Изменение URL для редиректа

Отредактируйте файл `src/shared/config/constants.ts`:

```typescript
export const EXTERNAL_LINKS = {
  ART: "https://art.ph1l74.com",
  DEV: "https://dev.ph1l74.com",
} as const;
```

### Кастомизация цветов и анимаций

Настройки анимаций находятся в `src/index.css`:
- В блоке `@theme` определены CSS переменные для анимаций
- В `@keyframes` блоках описаны сами анимации

Tailwind CSS v4 использует новый подход с `@import "tailwindcss"` и `@theme` вместо традиционных директив `@tailwind`.

## Docker

### Локальная разработка

Запустить приложение в Docker контейнере локально:

```bash
# Сборка и запуск
docker-compose -f docker-compose.local.yml up --build

# Остановка
docker-compose -f docker-compose.local.yml down
```

Приложение будет доступно на http://localhost:3000/

### Продакшен с Traefik

Для продакшен окружения с Traefik:

```bash
# Убедитесь, что сеть traefik-network создана
docker network create traefik-network

# Сборка и запуск
docker-compose up -d --build

# Просмотр логов
docker-compose logs -f

# Остановка
docker-compose down
```

#### Настройка Traefik

В `docker-compose.yml` настроены labels для автоматической конфигурации Traefik:
- Автоматическое получение SSL сертификатов через Let's Encrypt
- Редирект с HTTP на HTTPS
- Редирект с www на non-www (опционально)
- Security headers

Измените доменное имя в labels на свой домен:
```yaml
- "traefik.http.routers.ph1l74-frontend.rule=Host(`your-domain.com`)"
```

### Docker образ

**Multi-stage build:**
1. **Stage 1 (builder)**: Node.js для сборки приложения
2. **Stage 2 (runner)**: Nginx Alpine для раздачи статики

**Особенности:**
- Используется unprivileged nginx (работает на порту 8080)
- Оптимизирован размер образа
- Включены health checks
- Настроен gzip compression
- Кэширование статических ресурсов

## Лицензия

MIT
