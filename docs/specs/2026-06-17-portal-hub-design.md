# Portal Hub — Design Spec
**Date:** 2026-06-17  
**Project:** ph1l74.com  
**Status:** Approved

---

## Overview

Full rewrite of `ph1l74.com` as a three-destination interactive portal router. Preserves FSD structure, security middleware, and Docker deployment. Replaces the two-section split-screen with a Three.js WebGL full-screen shader and three navigation zones: ART / DEV / MUSIC.

---

## Architecture

### Approach
Direct Three.js in a React hook (`usePortalShader`). No @react-three/fiber — overkill for a single full-screen quad. Canvas component is `'use client'`, imported via `next/dynamic({ ssr: false })`.

### FSD Layer Structure

```
src/
  app/
    [locale]/
      layout.tsx            ← locale metadata + fonts
      page.tsx              ← thin shell → PortalPage
      opengraph-image.tsx   ← next/og ImageResponse 1200×630
    api/
      health/route.ts       ← unchanged
    globals.css             ← Space Grotesk + Space Mono, remove old animations
    not-found.tsx           ← unchanged

  page-layer/
    portal-page.tsx         ← hover/active state, wires all widgets

  widgets/
    portal-canvas/
      index.tsx             ← 'use client', canvas element
      use-portal-shader.ts  ← Three.js init/tick/cleanup hook
    desktop-zones/
      index.tsx             ← 3-column flex layout (≥860px)
      zone-item.tsx         ← single zone <a> with all hover states
    mobile-stack/
      index.tsx             ← bottom-anchored column (<860px)
      mobile-block.tsx      ← single tap-to-tune block
    portal-header/
      index.tsx             ← fixed top bar, lang switcher
    portal-footer/
      index.tsx             ← fixed bottom bar, dynamic label

  shared/
    config/
      portal.config.ts      ← sections, accents, intensity, name, handle
    i18n/
      routing.ts            ← next-intl locales + localePrefix config
      request.ts            ← getRequestConfig for server components
      messages/
        ru.json
        en.json
    lib/
      utils.ts              ← cn() (unchanged)
      hex-to-vec3.ts        ← hex → THREE.Color helper
```

**Removed:** `GlassEllipse`, `BackgroundGradientAnimation`, `DottedGlowBackground`, `BackgroundRippleEffect`, `background-ripple-effect.tsx`, `background-dotted-glow.tsx`, `background-gradient-animation.tsx`. Old fonts (Lato, BBH Sans Bartle, Montserrat) removed from globals.css. `constants.ts` merged into `portal.config.ts`.

---

## State Management

State lives in `PortalPage`. Imperative Three.js state lives in refs inside `usePortalShader`.

| State | Type | Location | Purpose |
|---|---|---|---|
| `hover` | `SectionId \| null` | `PortalPage` useState | Desktop hover → CSS + shader focus |
| `active` | `SectionId \| null` | `PortalPage` useState | Mobile selection → CSS + shader focus |
| `focusId` | `SectionId \| null` | ref in `usePortalShader` | Drives lerp targets in RAF loop |
| `mouse` / `mouseTarget` | `{x,y}` | refs in `usePortalShader` | Smoothed cursor NDC for `uMouse` |
| `curColor` | `THREE.Color` | ref in `usePortalShader` | Lerping color for `uColor` uniform |

`PortalCanvas` exposes an imperative handle via `useImperativeHandle`:
```ts
interface PortalCanvasHandle {
  setFocus(id: SectionId | null): void;
}
```

`PortalPage` calls `canvasRef.current.setFocus(id)` on hover/active changes — no re-render triggered in canvas component.

---

## Config (`shared/config/portal.config.ts`)

```ts
export type SectionId = 'art' | 'dev' | 'music';

export interface PortalSection {
  id: SectionId;
  url: string;
  accent: string; // hex color
}

export const PORTAL_CONFIG = {
  name: 'FILAT ASTAKHOV',
  handle: 'ph1l74',
  year: '2026',
  intensity: 0.4,           // shader warp amount (0.1–0.9)
  neutralColor: '#9098b0',  // idle bloom color
  sections: [
    { id: 'art',   url: 'https://art.ph1l74.com',   accent: '#e8454c' },
    { id: 'dev',   url: 'https://dev.ph1l74.com',   accent: '#4ea2f2' },
    { id: 'music', url: 'https://music.ph1l74.com', accent: '#d94ec6' },
  ] as const satisfies PortalSection[],
} as const;
```

All user-facing text (aliases, descriptions, enter labels) lives in i18n messages keyed by section `id`. Accents and URLs live only in this config.

---

## WebGL Shader

### Source
Verbatim from `docs/design/Portal.dc.html` — simplex noise (Ashima 3D) + warp + cursor ripple + film grain. Do not modify the GLSL logic.

### Uniforms
| Uniform | Type | Description |
|---|---|---|
| `uTime` | float | Elapsed seconds from THREE.Clock |
| `uResolution` | vec2 | Canvas size × DPR |
| `uMouse` | vec2 | Smoothed cursor NDC (-1..1) |
| `uColor` | vec3 | Current focus color, lerps toward zone accent or neutral |
| `uActivate` | float 0..1 | Lerps toward 1 on focus, 0 on idle |
| `uIntensity` | float | Warp amount, from PORTAL_CONFIG.intensity |
| `uColA/B/C` | vec3 | art/dev/music accents for ambient wash |

### Render loop lerp factors
- Mouse: 0.07
- Color (`uColor`): 0.06
- Activate (`uActivate`): 0.06

### 4K Performance Optimization

Adaptive pixel ratio capped to ~2MP internal resolution regardless of screen size:

```ts
function getAdaptiveDpr(canvas: HTMLCanvasElement): number {
  const screenPixels = canvas.clientWidth * canvas.clientHeight;
  const maxPixels = 2_000_000;
  const adaptiveDpr = Math.sqrt(maxPixels / screenPixels);
  return Math.min(window.devicePixelRatio, adaptiveDpr, 1.5);
}
```

| Screen | Native DPR | Old internal pixels | New internal pixels |
|---|---|---|---|
| 1080p | 1.0 | ~2M | ~2M (unchanged) |
| 1440p | 1.5 | ~8M | ~2M |
| 4K | 2.0 | ~33M | ~2M |

DPR is recomputed on every resize. Visually transparent — soft gradients and grain do not require native resolution.

---

## i18n

### Routing
- Library: `next-intl`
- Locales: `['ru', 'en']`, default `ru`
- `localePrefix: 'as-needed'` — `ph1l74.com` → RU, `ph1l74.com/en` → EN
- App structure: `src/app/[locale]/`

### Middleware integration
next-intl middleware chained after security checks in the existing `middleware.ts`:
```ts
// after all security checks pass:
return intlMiddleware(request); // instead of NextResponse.next()
```
`/api/health` path is still bypassed before security and i18n both.

### Translation keys structure
```json
{
  "meta": { "title": "...", "description": "..." },
  "hint": { "desktop": "...", "mobile": "..." },
  "footer": { "idle": "...", "interactive": "Interactive Portal — three.js" },
  "header": { "status": "ONLINE", "lang": { "ru": "RU", "en": "EN" } },
  "sections": {
    "art":   { "alias": "...", "description": "...", "enter": "...", "enterFull": "ENTER PHL-ART →" },
    "dev":   { "alias": "...", "description": "...", "enter": "...", "enterFull": "ENTER DEV →" },
    "music": { "alias": "...", "description": "...", "enter": "...", "enterFull": "ENTER MUSIC →" }
  }
}
```
Section names (ART / DEV / MUSIC) are not translated.

### Language switcher
Small `RU / EN` toggle in the header right area, rendered as `<Link>` to the alternate locale URL. Only this element has `pointer-events: auto`; the rest of the header stays `pointer-events: none`.

---

## Layout

### Breakpoint: 860px
- `≥ 860px` → Desktop: three equal vertical column zones
- `< 860px` → Mobile: bottom-anchored tap-to-tune stack

### Desktop Zone (per zone)
- Full-height `<a>` column, `flex: 1`
- Right border `1px solid #1a1a20` (last zone: none)
- On hover: inner block `translateY(-6px)`, description reveals (`max-height: 90px`, `opacity: 1`), accent bar sweeps `0%→100%` width from bottom
- On other-hover: `opacity: 0.3`
- Index number: top-left `88px`, accent-colored on hover
- Title: Space Grotesk 700, `clamp(44px, 4.6vw, 86px)`, `line-height: 0.9`
- Easing: `cubic-bezier(.2,.7,.2,1)`, durations 0.4s–0.6s

### Mobile Block (per block)
- Tap → select (tune). Second tap on ENTER → navigate.
- Selected: `background: rgba(255,255,255,0.025)`, description reveals, ENTER link appears
- Bottom gradient scrim: `linear-gradient(to top, rgba(10,10,11,0.92), transparent)`
- Title: Space Grotesk 700, 34px

### Header
Fixed top bar, `z-index: 6`, `pointer-events: none`.
- Left: `■ FILAT ASTAKHOV` (9×9px white square + name)
- Center: `● ONLINE` (6×6px green dot `#3ad17a` with `box-shadow: 0 0 8px #3ad17a`)
- Right: `ph1l74 / 2026` + language switcher `RU / EN`

### Footer
Fixed bottom bar, `z-index: 6`, `pointer-events: none`.
- Left: idle `SELECT A DESTINATION` / hover `> PHL-ART` etc. (color = zone accent)
- Right: `Interactive Portal — three.js`

### Hint text
Centered, fades out on any hover/active.
- Desktop: `top: 112px`, text from `hint.desktop`
- Mobile: `bottom: 236px`, text from `hint.mobile`

---

## Design Tokens

### Colors
| Token | Value |
|---|---|
| Background | `#0a0a0b` |
| Text primary | `#ededf0` |
| Text secondary | `#cfcfd6` |
| Text muted | `#a6a6ae` |
| Text dim | `#85858d` |
| Text faint | `#65656d` / `#55555f` / `#50505a` |
| Border hairline | `#15151a` / `#18181d` / `#1a1a20` |
| Status green | `#3ad17a` |
| Idle bloom | `#9098b0` |
| ART accent | `#e8454c` |
| DEV accent | `#4ea2f2` |
| MUSIC accent | `#d94ec6` |
| Selection bg | `#e8454c` |

### Typography
- Titles / UI: **Space Grotesk** 400/500/700 — via `next/font/google`
- Mono / meta: **Space Mono** 400/700 — via `next/font/google`

### Motion
- Primary easing: `cubic-bezier(.2,.7,.2,1)`
- Durations: 0.3s–0.6s
- Render loop lerps: mouse 0.07, color 0.06, activate 0.06

---

## OpenGraph Image

Route: `src/app/[locale]/opengraph-image.tsx` → `ImageResponse` (next/og)  
Size: 1200×630

Design:
- Background `#0a0a0b`
- Three equal vertical columns, each with a 3px accent bar at the bottom
- Section name (ART / DEV / MUSIC) in Space Grotesk 700, white
- Center overlay: `■ FILAT ASTAKHOV` + `ph1l74.com`
- Font loaded via fetch from Google Fonts at generation time (standard next/og pattern)

One static OG image per locale (description text differs, layout is the same).

---

## Metadata

In `src/app/[locale]/layout.tsx`:
```ts
export async function generateMetadata({ params }) {
  const t = await getTranslations({ locale: params.locale, namespace: 'meta' });
  return {
    title: t('title'),
    description: t('description'),
    openGraph: {
      type: 'website',
      url: 'https://ph1l74.com',
      images: [{ url: '/opengraph-image', width: 1200, height: 630 }],
    },
    twitter: { card: 'summary_large_image' },
    alternates: {
      canonical: 'https://ph1l74.com',
      languages: {
        'ru': 'https://ph1l74.com',
        'en': 'https://ph1l74.com/en',
      },
    },
  };
}
```

---

## Security & Deployment

### Security (unchanged)
- `middleware.ts`: rate limiting, IP block, suspicious patterns, bot UA, security headers
- `next.config.ts`: HSTS, X-Frame-Options, nosniff, Referrer-Policy
- `next-intl` middleware chained at the end of the existing middleware function

### Docker (unchanged)
- 3-stage build: `deps` → `builder` → `runner` (node:22-alpine)
- `output: 'standalone'` → `CMD ["node", "server.js"]`
- Non-root user `nextjs:nodejs`
- Healthcheck spoofs `Host: ph1l74.com` + `X-Forwarded-Proto: https`
- `docker-compose.yml`: production, external `ph1l74-network`, Traefik labels

### New dependencies
```json
"three": "^0.170.0",
"next-intl": "^3.25.0",
"@types/three": "^0.170.0"
```

---

## Out of Scope
- CMS or dynamic section management
- Analytics / tracking
- Any content beyond the router page itself
- `BackgroundRippleEffect` (unused in current code, deleted)
