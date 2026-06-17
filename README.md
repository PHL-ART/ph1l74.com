# ph1l74.com

Визуальный роутер — одностраничный лендинг на весь экран, который направляет пользователя на одно из трёх поддоменов.

## Разделы

| Раздел | Поддомен | Акцентный цвет |
|--------|----------|----------------|
| **ART** | art.ph1l74.com | `#e8454c` (красный) |
| **DEV** | dev.ph1l74.com | `#4ea2f2` (синий) |
| **MUSIC** | music.ph1l74.com | `#d94ec6` (фиолетовый) |

На десктопе все секции стартуют в grayscale и переходят в цвет при hover. В центре — стеклянная таблетка (`GlassEllipse`) с меткой «ph1l74.com».

## Технологический стек

- **Next.js 15** (App Router, standalone output)
- **React 19**
- **TypeScript**
- **Tailwind CSS v4**
- **Three.js** — WebGL шейдер (GLSL, адаптивный DPR, 30 fps cap)
- **next-intl** — i18n (RU по умолчанию, EN по `/en`)
- **motion** — анимации
- **next/font/google** — Space Grotesk, Montserrat (self-hosted)

## Команды

```bash
npm run dev           # Dev-сервер на localhost:3000
npm run build         # Production-сборка
npm run lint          # ESLint

# Docker
npm run docker:local      # Собрать и запустить локально
npm run docker:local:down # Остановить локальный Docker
npm run docker:prod       # Запустить production (detached)
npm run docker:logs       # Логи контейнера
```

## Переменные окружения

Скопируйте шаблон и заполните значения:

```bash
cp .env.example .env
```

| Переменная | Описание | Формат |
|------------|----------|--------|
| `NEXT_PUBLIC_GA_ID` | Google Analytics 4 | `G-XXXXXXXXXX` |
| `NEXT_PUBLIC_YM_ID` | Яндекс Метрика | 8-значный номер счётчика |

> **Важно:** переменные `NEXT_PUBLIC_*` вшиваются в клиентский бандл во время `next build`. При сборке через Docker они передаются как build args — docker-compose читает их автоматически из `.env`.

## Архитектура (FSD-lite)

```
src/
  app/
    layout.tsx                  # Корневой pass-through
    globals.css                 # Сброс стилей + ::selection
    not-found.tsx               # 404
    [locale]/
      layout.tsx                # html/body, шрифты, метатеги, аналитика
      page.tsx                  # Оболочка → PortalPage
      opengraph-image.tsx       # OG-изображение 1200×630
    api/health/route.ts         # Health probe для Traefik/Docker

  page-layer/
    portal-page.tsx             # 'use client' — состояние hover/active

  widgets/
    portal-canvas/              # Three.js WebGL (ssr: false)
      index.tsx                 # forwardRef canvas + виньетка
      use-portal-shader.ts      # init, RAF loop, GLSL шейдеры
    desktop-zones/              # 3-колоночный layout (≥860px)
    mobile-stack/               # Стек снизу (<860px)
    portal-header/              # Шапка + переключатель RU/EN
    portal-footer/              # Подвал с динамической меткой

  shared/
    config/
      portal.config.ts          # Секции (id/url/accent), имя, handle
    i18n/
      routing.ts                # next-intl локали и навигация
      request.ts                # getRequestConfig для серверных компонентов
      messages/ru.json          # Русский
      messages/en.json          # Английский
    lib/
      utils.ts                  # cn()
      hex-to-vec3.ts            # hex → [r,g,b] float
```

## Деплой (Docker + Traefik)

### Локально

```bash
npm run docker:local
# http://localhost:3000
```

### Production

Убедитесь, что внешняя сеть создана:

```bash
docker network create ph1l74-network
```

Запустите:

```bash
npm run docker:prod
npm run docker:logs
```

docker-compose настроен на автоматическую работу с Traefik:
- SSL через Let's Encrypt
- Редирект HTTP → HTTPS
- Редирект www → non-www
- Security headers
- Rate limiting (100 req/мин)

### Переменные при Docker-сборке

`.env` автоматически считывается docker-compose. Переменные `NEXT_PUBLIC_*` передаются в `Dockerfile` как build args и доступны во время `next build`.

## Безопасность (три слоя)

1. **Traefik** — сетевой edge (rate limit, HTTPS, headers)
2. **next.config.ts** — статические HTTP-заголовки
3. **middleware.ts** — динамические проверки: rate limit, IP-блокировка, бот-UA, подозрительные паттерны

## i18n

Роутинг: `localePrefix: 'as-needed'`
- `ph1l74.com` → RU
- `ph1l74.com/en` → EN

Имена секций (ART / DEV / MUSIC) не переводятся. Переводятся: alias, description, enter-label, meta.

## Добавить новую секцию

1. Добавить запись в `src/shared/config/portal.config.ts` → `sections[]` (поля: `id`, `url`, `accent`)
2. Добавить ключи `sections.<id>` в `ru.json` и `en.json`

## Лицензия

MIT
