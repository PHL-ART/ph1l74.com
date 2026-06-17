# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**ph1l74.com** is a visual router — a single full-screen landing page that routes the user to one of two subdomains:

- **Top half (ART)** → `art.ph1l74.com` — interactive gradient animation background, circle cursor
- **Bottom half (DEV)** → `dev.ph1l74.com` — canvas-based animated dotted grid background, square cursor
- **Center divider** — a frosted-glass pill (`GlassEllipse`) with the branding label "ph1l74.com"

Both halves start grayscale on desktop and transition to color on hover (`md:grayscale md:hover:grayscale-0`).

## Commands

```bash
npm run dev          # Start dev server (localhost:3000)
npm run build        # Production build
npm run lint         # ESLint check

# Docker
npm run docker:local      # Build & run with docker-compose.local.yml
npm run docker:local:down # Stop local Docker
npm run docker:prod       # Run production Docker (detached)
npm run docker:logs       # Tail container logs
```

## Architecture

### Layer structure (FSD-lite)

```
src/
  app/
    layout.tsx              # Root pass-through (locale layout provides html/body)
    globals.css             # Reset + ::selection token
    not-found.tsx           # 404 page
    [locale]/               # next-intl locale routing (ru default, en at /en)
      layout.tsx            # html/body, Space Grotesk + Space Mono fonts, metadata
      page.tsx              # thin shell → PortalPage
      opengraph-image.tsx   # next/og ImageResponse 1200×630
    api/health/route.ts     # health probe (unchanged)

  page-layer/
    portal-page.tsx         # 'use client' — hover/active state, wires all widgets

  widgets/
    portal-canvas/          # Three.js WebGL (dynamically imported, ssr:false)
      index.tsx             # forwardRef canvas + vignette overlay
      use-portal-shader.ts  # init, RAF loop, adaptive DPR, GLSL shaders
    desktop-zones/          # 3-column layout (≥860px)
      index.tsx
      zone-item.tsx
    mobile-stack/           # Bottom-anchored tap-to-tune (<860px)
      index.tsx
      mobile-block.tsx
    portal-header/          # Fixed top bar + RU/EN lang switcher
    portal-footer/          # Fixed bottom bar, dynamic label

  shared/
    config/
      portal.config.ts      # Sections (id/url/accent), name, handle, intensity
    i18n/
      routing.ts            # next-intl locales, localePrefix, navigation helpers
      request.ts            # getRequestConfig for server components
      messages/ru.json      # Russian translations
      messages/en.json      # English translations
    lib/
      utils.ts              # cn()
      hex-to-vec3.ts        # hex → [r,g,b] float triple
```

### Key design decisions

- **`PortalPage`** is `'use client'` — owns `hover`/`active` state. Calls `canvasRef.current.setFocus()` imperatively so the shader lerp changes without triggering React re-renders.
- **`PortalCanvas`** is dynamically imported with `ssr: false`. Exposes `setFocus(id)` via `useImperativeHandle`.
- **`usePortalShader`** holds all Three.js objects in refs. The RAF loop reads `focusIdRef.current` each frame to determine lerp target color.
- **Adaptive DPR** in `usePortalShader`: caps internal resolution to ~2MP regardless of screen size — keeps 4K perf acceptable without visible quality loss on soft gradient + grain shader.
- **Section names (ART/DEV/MUSIC) are not translated.** Only aliases, descriptions, enter labels, hints, meta live in `i18n/messages/`.
- **i18n routing**: `localePrefix: 'as-needed'` — `ph1l74.com` → RU, `ph1l74.com/en` → EN. next-intl middleware is chained after security checks in `middleware.ts`.
- **Fonts**: `next/font/google` auto-downloads Space Grotesk + Space Mono at build time and self-hosts them. CSS variables `--font-space-grotesk` / `--font-space-mono` are used in inline styles.
- **Security** (three layers — unchanged): Traefik (network edge), `next.config.ts` (static headers), `middleware.ts` (dynamic: rate limit, IP block, bot UA, suspicious patterns).
- **Docker** (unchanged): 3-stage Alpine build, `output: 'standalone'`, non-root `nextjs` user, healthcheck spoofs `Host: ph1l74.com` header.

### To add or change a destination

Edit `src/shared/config/portal.config.ts` — add a new entry to `sections[]` with `id`, `url`, and `accent`. Then add matching keys to `ru.json` and `en.json` under `sections.<id>`.
