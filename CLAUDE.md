# CLAUDE.md

Этот файл содержит инструкции для Claude Code при работе с репозиторием.

## Описание проекта

**ph1l74.com** — визуальный роутер: одностраничный лендинг на весь экран, направляющий пользователя на один из трёх поддоменов:

- **ART** → `art.ph1l74.com` — интерактивный градиентный анимированный фон, круглый курсор
- **DEV** → `dev.ph1l74.com` — canvas-анимация с точечной сеткой, квадратный курсор
- **MUSIC** → `music.ph1l74.com` — фиолетовый акцент

Центральный разделитель — стеклянная таблетка (`GlassEllipse`) с лейблом «ph1l74.com».

На десктопе обе половины стартуют в grayscale и переходят в цвет при hover (`md:grayscale md:hover:grayscale-0`).

## Команды

```bash
npm run dev          # Dev-сервер (localhost:3000)
npm run build        # Production-сборка
npm run lint         # ESLint

# Docker
npm run docker:local      # Собрать и запустить локально
npm run docker:local:down # Остановить локальный Docker
npm run docker:prod       # Production Docker (detached)
npm run docker:logs       # Логи контейнера
```

## Переменные окружения

Файл `.env` (не коммитится, в `.gitignore`). Шаблон: `.env.example`.

| Переменная | Назначение |
|------------|------------|
| `NEXT_PUBLIC_GA_ID` | Google Analytics 4 Measurement ID (`G-XXXXXXXXXX`) |
| `NEXT_PUBLIC_YM_ID` | Яндекс Метрика — номер счётчика (8 цифр) |

Переменные `NEXT_PUBLIC_*` вшиваются в клиентский бандл во время `next build`. При Docker-сборке передаются через build args — docker-compose подхватывает из `.env` автоматически. Скрипты аналитики подключаются в `src/app/[locale]/layout.tsx` через `next/script` с `strategy="afterInteractive"` и рендерятся только при непустом значении переменной.

## Архитектура

### Структура слоёв (FSD-lite)

```
src/
  app/
    layout.tsx              # Корневой pass-through (locale layout отдаёт html/body)
    globals.css             # Сброс стилей + ::selection токен
    not-found.tsx           # 404
    [locale]/               # next-intl локали (ru по умолчанию, en на /en)
      layout.tsx            # html/body, шрифты, метатеги, скрипты аналитики
      page.tsx              # Оболочка → PortalPage
      opengraph-image.tsx   # next/og ImageResponse 1200×630
    api/health/route.ts     # Health probe

  page-layer/
    portal-page.tsx         # 'use client' — состояние hover/active, управляет виджетами

  widgets/
    portal-canvas/          # Three.js WebGL (динамический импорт, ssr:false)
      index.tsx             # forwardRef canvas + виньетка
      use-portal-shader.ts  # init, RAF loop, адаптивный DPR, GLSL шейдеры
    desktop-zones/          # 3-колоночный layout (≥860px)
      index.tsx
      zone-item.tsx
    mobile-stack/           # Стек снизу (<860px)
      index.tsx
      mobile-block.tsx
    portal-header/          # Фиксированная шапка + переключатель RU/EN
    portal-footer/          # Фиксированный подвал, динамический лейбл

  shared/
    config/
      portal.config.ts      # Секции (id/url/accent), имя, handle, intensity
    i18n/
      routing.ts            # next-intl локали, localePrefix, навигационные хелперы
      request.ts            # getRequestConfig для серверных компонентов
      messages/ru.json      # Русские переводы
      messages/en.json      # Английские переводы
    lib/
      utils.ts              # cn()
      hex-to-vec3.ts        # hex → [r,g,b] float
```

### Ключевые архитектурные решения

- **`PortalPage`** — `'use client'`: владеет состоянием `hover`/`active`. Вызывает `canvasRef.current.setFocus()` императивно, чтобы изменение lerp-цвета шейдера не триггерило React-рендеры.
- **`PortalCanvas`** — динамический импорт с `ssr: false`. Экспортирует `setFocus(id)` через `useImperativeHandle`.
- **`usePortalShader`** — все объекты Three.js в рефах. RAF-цикл читает `focusIdRef.current` каждый кадр для определения целевого цвета lerp.
- **Адаптивный DPR** в `usePortalShader`: ограничивает внутреннее разрешение до ~2MP вне зависимости от размера экрана — сохраняет производительность на 4K без потери качества на мягком градиенте + зерне.
- **Имена секций (ART/DEV/MUSIC) не переводятся.** Переводятся: aliases, descriptions, enter labels, hints, meta.
- **i18n роутинг**: `localePrefix: 'as-needed'` — `ph1l74.com` → RU, `ph1l74.com/en` → EN. Middleware next-intl встроен после проверок безопасности в `middleware.ts`.
- **Шрифты**: `next/font/google` автоматически скачивает Space Grotesk + Montserrat при сборке и self-hosts их. CSS-переменные `--font-space-grotesk` / `--font-montserrat` используются в inline-стилях. Science Gothic загружается через `<link>` в layout.
- **Безопасность** (три слоя): Traefik (сетевой edge), `next.config.ts` (статические заголовки), `middleware.ts` (динамические: rate limit, IP-блок, бот-UA, подозрительные паттерны).
- **Docker**: 3-стадийная Alpine-сборка, `output: 'standalone'`, непривилегированный пользователь `nextjs`, healthcheck со спуфингом заголовка `Host: ph1l74.com`.

### Добавить или изменить раздел

Отредактировать `src/shared/config/portal.config.ts` — добавить запись в `sections[]` с полями `id`, `url`, `accent`. Затем добавить соответствующие ключи в `ru.json` и `en.json` под `sections.<id>`.
