# ph1l74.com

Одностраничное приложение на React TypeScript с использованием Aceternity UI компонентов.

## Описание

Приложение разделено на два интерактивных блока:
- **ART** (верхний блок) - с анимированным градиентным фоном, шрифт Lato Thin, перенаправляет на art.ph1l74.com
- **DEV** (нижний блок) - с эффектом dotted glow, шрифт BBH Sans Bartle Regular, перенаправляет на dev.ph1l74.com
- **Glass Ellipse** - статичный элемент по центру с glass-эффектом и надписью "ph1l74.com"

## 📱 Адаптивный дизайн

Приложение полностью адаптировано для всех устройств:
- **Mobile** (< 640px): размер шрифта 4rem, отступы 16px, блоки ровно 50% экрана
- **Tablet** (640px+): размер шрифта 6-8rem, отступы 24-32px, блоки ровно 50% экрана
- **Desktop** (1024px+): размер шрифта 10-12rem, без отступов, блоки ровно 50% экрана
- **Без скролла**: контент точно помещается на экран на всех устройствах
- **Мобильная оптимизация**: исправлена высота блоков на iPhone 13 mini
- **Центрирование**: текст и эллипс точно по центру

## 🎨 Типографика

- **ART блок**: Lato Thin (100) - элегантный, минималистичный
- **DEV блок**: BBH Sans Bartle Regular (400) - современный, технический
- **Glass Ellipse**: Montserrat Regular (400) - статичный элемент с glass-эффектом
- **Hover эффект**: увеличение при наведении на весь блок
- **Grayscale эффект**: блоки черно-белые, становятся цветными при hover
- **Кастомные курсоры**: круглый для ART, квадратный для DEV (работают на десктопе)
- **Границы**: разделение блоков тонкими линиями
- **Локальные шрифты**: загружаются из `/assets/fonts/` для лучшей производительности

## Технологии

- **Next.js 15** - React framework с App Router
- **React 19** - библиотека для создания пользовательских интерфейсов
- **TypeScript** - типизированный JavaScript
- **Tailwind CSS v4** - utility-first CSS фреймворк (с @tailwindcss/postcss)
- **Aceternity UI** - компоненты для фоновых эффектов
- **FSD** (Feature-Sliced Design) - архитектура приложения

## Структура проекта (FSD + Next.js App Router)

```
app/                    # Next.js App Router
├── api/               # API routes
│   └── health/        # Health check endpoint
│       └── route.ts
├── layout.tsx         # Root layout
├── page.tsx           # Home page
└── globals.css        # Global styles с Tailwind CSS v4

src/
├── shared/            # Переиспользуемые модули
│   ├── ui/           # UI компоненты
│   │   ├── background-gradient-animation.tsx
│   │   ├── background-ripple-effect.tsx
│   │   └── index.ts
│   ├── lib/          # Утилиты
│   │   ├── utils.ts
│   │   └── index.ts
│   └── config/       # Конфигурация и константы
│       └── constants.ts
├── widgets/          # Композитные блоки
│   ├── art-block.tsx
│   └── dev-block.tsx
└── pages/            # Страницы (FSD слой)
    └── home-page.tsx
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

Приложение будет доступно по адресу http://localhost:3000/

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

Настройки анимаций находятся в `app/globals.css`:
- В блоке `@theme inline` определены CSS переменные для анимаций
- В `@keyframes` блоках описаны сами анимации

Tailwind CSS v4 использует новый подход с `@import "tailwindcss"` и `@theme inline` вместо традиционных директив `@tailwind`.

### Next.js конфигурация

Файл `next.config.ts` настроен для:
- Standalone output для Docker
- Оптимизации изображений (AVIF, WebP)
- Удаления console.log в продакшене

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
1. **Stage 1 (deps)**: Установка зависимостей
2. **Stage 2 (builder)**: Сборка Next.js приложения
3. **Stage 3 (runner)**: Production сервер

**Особенности:**
- Next.js standalone output для минимального размера
- Non-root пользователь (nextjs:nodejs)
- Работает на порту 3000
- Health check через API route `/api/health`
- Оптимизированный размер образа (~150MB)

## Troubleshooting

Если возникли проблемы при разработке или деплое, см. [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)

Основные решения:
- **404 на localhost:3000** - удалить конфликтующие директории `app/` и `src/pages/`
- **Hydration mismatch** - добавить `suppressHydrationWarning` в layout
- **Viewport warning** - использовать отдельный экспорт `viewport`
- **Can't resolve 'tw-animate-css'** - удалить несуществующие пакеты из `globals.css`

## Адаптивный дизайн

См. [RESPONSIVE_DESIGN.md](./RESPONSIVE_DESIGN.md) для детальной информации об адаптивности.

Основные breakpoints:
- **Mobile**: `text-[4rem] px-4` (< 640px)
- **Small**: `text-[6rem] px-6` (640px+)
- **Medium**: `text-[8rem] px-8` (768px+)
- **Large**: `text-[10rem] px-10` (1024px+)
- **XL**: `text-[12rem] px-0` (1280px+)

## Лицензия

MIT
