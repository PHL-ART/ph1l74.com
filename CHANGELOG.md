# Changelog

## [2.0.1] - 2025-10-12

### Добавлено
- **Адаптивный дизайн** для мобильных устройств
  - Responsive typography: `text-[4rem] sm:text-[6rem] md:text-[8rem] lg:text-[10rem] xl:text-[12rem]`
  - Horizontal padding: `px-4 sm:px-6 md:px-8 lg:px-10 xl:px-0`
  - Оптимизация для всех размеров экранов (Mobile → Desktop)
  - Документация по адаптивности в `RESPONSIVE_DESIGN.md`

- **Обновленная типографика**
  - ART блок: Lato Thin (100) - локальный шрифт из `/assets/fonts/`
  - DEV блок: BBH Sans Bartle Regular (400) - локальный шрифт из `/assets/fonts/`
  - Group hover эффект: увеличение при наведении на блок
  - Локальные шрифты для лучшей производительности и контроля
  - Документация по типографике в `TYPOGRAPHY_UPDATE.md`

- **Glass Ellipse Feature**
  - Статичный эллипс по центру экрана с glass-эффектом
  - Надпись "ph1l74.com" шрифтом Inter Regular
  - Z-index 50 для отображения поверх всех блоков
  - Backdrop-blur и полупрозрачный фон для glass-эффекта
  - Документация по фиче в `GLASS_ELLIPSE_FEATURE.md`

- **Исправление мобильной высоты**
  - Блоки теперь занимают ровно 50% экрана (`h-[50vh]`)
  - Отключен вертикальный скролл на всех устройствах
  - Контент точно помещается на экран iPhone 13 mini
  - Улучшенный UX на мобильных устройствах

- **Enhanced Features**
  - Glass Ellipse: Montserrat шрифт вместо Inter
  - Толстая граница Glass Ellipse: 2px (было 1px)
  - Границы между блоками: верхняя и нижняя границы
  - Grayscale эффект: блоки черно-белые, цветные при hover
  - Кастомные курсоры: круглый для ART, квадратный для DEV
  - Плавные переходы: 500ms для всех эффектов
  - Документация по фичам в `ENHANCED_FEATURES.md`

- **Mobile & Desktop Fixes**
  - Исправлена мобильная высота: блоки ровно 50% экрана на iPhone 13 mini
  - Центрирование: текст и Glass Ellipse точно по центру
  - iOS Safari поддержка: `-webkit-fill-available` для правильной высоты
  - Кастомные курсоры: работают на десктопе через CSS классы
  - Flexbox layout: правильное распределение блоков
  - Документация по исправлениям в `MOBILE_DESKTOP_FIXES.md`

## [2.0.0] - 2025-10-12

### Изменено (Breaking Changes)
- **Миграция с Vite на Next.js 15 App Router**
  - Переход от Vite + React на Next.js с App Router
  - Полная переработка структуры проекта под Next.js
  - Сохранена архитектура FSD с адаптацией под App Router
  
- **Docker конфигурация**
  - Заменен Nginx на Next.js standalone server
  - Обновлен Dockerfile для Next.js multi-stage build
  - Изменен порт с 8080 на 3000
  - Health check через API route `/api/health`
  
- **Tailwind CSS v4**
  - Обновлен PostCSS config для Next.js
  - Использование `@tailwindcss/postcss` вместо `@tailwindcss/vite`
  - Переход на `postcss.config.js` вместо Vite плагина
  
### Добавлено
- Next.js 15 с React 19 и App Router
- `app/layout.tsx` - Root layout с metadata
- `app/page.tsx` - Home page entry point
- `app/globals.css` - Global styles с Tailwind CSS v4
- `app/api/health/route.ts` - Health check API endpoint
- `next.config.ts` - Next.js конфигурация
- `.gitignore` для Next.js
- Директива `'use client'` для интерактивных компонентов

### Удалено
- Vite и связанные зависимости
- `vite.config.ts`
- `index.html`
- `src/main.tsx`
- `nginx.conf` и Nginx из Docker
- `@vitejs/plugin-react-swc`

### Улучшено
- Оптимизация изображений (AVIF, WebP) через Next.js
- Standalone output для минимального Docker образа
- Автоматическое удаление console.log в продакшене
- Улучшенная производительность благодаря Next.js
- Server-side rendering возможности

### Исправлено
- 404 ошибка из-за конфликта директорий `app/` и `src/pages/`
- Hydration mismatch warning (добавлен `suppressHydrationWarning`)
- Viewport metadata warning (перенесен в отдельный экспорт)
- PostCSS ES module error (переименован в `.mjs`)
- ESLint warnings (установлен пакет `globals`)

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

