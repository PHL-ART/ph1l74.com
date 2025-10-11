# Changelog

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

