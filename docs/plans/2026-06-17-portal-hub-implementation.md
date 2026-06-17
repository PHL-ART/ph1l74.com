# Portal Hub Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rewrite ph1l74.com as a Three.js WebGL portal router with three zones (ART/DEV/MUSIC), RU/EN URL-based i18n, adaptive 4K shader optimization, and OpenGraph metadata.

**Architecture:** Full-screen Three.js canvas (single ShaderMaterial quad) behind three navigation zones. State lives in PortalPage (`hover`/`active`); imperative `setFocus()` ref drives the shader lerp targets without triggering re-renders. next-intl handles locale routing chained after the existing security middleware. All user-facing text is translation-keyed; section names (ART/DEV/MUSIC), URLs, and accents live in `portal.config.ts`.

**Tech Stack:** Next.js 15 (App Router), Three.js ^0.170, next-intl ^3.25, Tailwind CSS v4, TypeScript 5.9, `next/font/google` for Space Grotesk + Space Mono.

---

## File Map

| Action | Path | Responsibility |
|---|---|---|
| Create | `src/shared/config/portal.config.ts` | Section definitions, accents, URLs, global params |
| Create | `src/shared/lib/hex-to-vec3.ts` | hex → `[r,g,b]` float triple |
| Modify | `src/shared/lib/index.ts` | Export `hexToVec3` |
| Create | `src/shared/i18n/routing.ts` | next-intl routing config + navigation helpers |
| Create | `src/shared/i18n/request.ts` | `getRequestConfig` for server components |
| Create | `src/shared/i18n/messages/ru.json` | Russian translations |
| Create | `src/shared/i18n/messages/en.json` | English translations |
| Modify | `next.config.ts` | Wrap with `withNextIntl` plugin |
| Modify | `src/middleware.ts` | Chain next-intl after security checks |
| Modify | `src/app/globals.css` | New design tokens, remove old font-faces + animations |
| Create | `src/app/layout.tsx` | Root pass-through layout |
| Create | `src/app/[locale]/layout.tsx` | Locale html/body, fonts, metadata, `NextIntlClientProvider` |
| Create | `src/app/[locale]/page.tsx` | Thin shell → `PortalPage` |
| Create | `src/app/[locale]/opengraph-image.tsx` | `ImageResponse` 1200×630 |
| Create | `src/widgets/portal-canvas/use-portal-shader.ts` | Three.js init/tick/cleanup, adaptive DPR, GLSL shaders |
| Create | `src/widgets/portal-canvas/index.tsx` | Canvas element + `forwardRef` imperative handle |
| Create | `src/widgets/portal-header/index.tsx` | Fixed top bar, lang switcher |
| Create | `src/widgets/portal-footer/index.tsx` | Fixed bottom bar, dynamic destination label |
| Create | `src/widgets/desktop-zones/zone-item.tsx` | Single desktop zone `<a>` with hover states |
| Create | `src/widgets/desktop-zones/index.tsx` | 3-column flex container |
| Create | `src/widgets/mobile-stack/mobile-block.tsx` | Single tap-to-tune block |
| Create | `src/widgets/mobile-stack/index.tsx` | Bottom-anchored mobile layout |
| Create | `src/page-layer/portal-page.tsx` | `hover`/`active` state, wires all widgets |
| Modify | `src/page-layer/index.ts` | Export `PortalPage` |
| Delete | `src/widgets/art-block.tsx` | Replaced |
| Delete | `src/widgets/dev-block.tsx` | Replaced |
| Delete | `src/widgets/index.ts` | Will recreate |
| Delete | `src/shared/ui/background-gradient-animation.tsx` | Replaced by shader |
| Delete | `src/shared/ui/background-dotted-glow.tsx` | Replaced by shader |
| Delete | `src/shared/ui/background-ripple-effect.tsx` | Unused |
| Delete | `src/shared/ui/glass-ellipse.tsx` | Not in new design |
| Delete | `src/shared/ui/index.ts` | Will recreate empty or remove |
| Delete | `src/shared/config/constants.ts` | Merged into portal.config.ts |
| Delete | `src/page-layer/home-page.tsx` | Replaced by portal-page.tsx |
| Modify | `CLAUDE.md` | Update architecture section |

---

## Task 1: Install dependencies

**Files:** `package.json`

- [ ] **Install Three.js and next-intl**

```bash
cd f:/Programming/ph1l74.com
npm install three next-intl
npm install --save-dev @types/three
```

- [ ] **Verify Three.js loads**

```bash
node -e "const THREE = require('three'); console.log('three', THREE.REVISION)"
```

Expected output: `three 170` (or similar revision number)

- [ ] **Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add three.js and next-intl dependencies"
```

---

## Task 2: Config + utility

**Files:**
- Create: `src/shared/config/portal.config.ts`
- Create: `src/shared/lib/hex-to-vec3.ts`
- Modify: `src/shared/lib/index.ts`

- [ ] **Create `portal.config.ts`**

```ts
// src/shared/config/portal.config.ts
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
  intensity: 0.4,
  neutralColor: '#9098b0',
  sections: [
    { id: 'art'   as const, url: 'https://art.ph1l74.com',   accent: '#e8454c' },
    { id: 'dev'   as const, url: 'https://dev.ph1l74.com',   accent: '#4ea2f2' },
    { id: 'music' as const, url: 'https://music.ph1l74.com', accent: '#d94ec6' },
  ] satisfies PortalSection[],
} as const;
```

- [ ] **Create `hex-to-vec3.ts`**

```ts
// src/shared/lib/hex-to-vec3.ts
export function hexToVec3(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  return [
    parseInt(clean.slice(0, 2), 16) / 255,
    parseInt(clean.slice(2, 4), 16) / 255,
    parseInt(clean.slice(4, 6), 16) / 255,
  ];
}
```

- [ ] **Update `src/shared/lib/index.ts`**

```ts
export { cn } from './utils';
export { hexToVec3 } from './hex-to-vec3';
```

- [ ] **Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Commit**

```bash
git add src/shared/config/portal.config.ts src/shared/lib/hex-to-vec3.ts src/shared/lib/index.ts
git commit -m "feat: add portal config and hex-to-vec3 utility"
```

---

## Task 3: i18n routing + messages

**Files:**
- Create: `src/shared/i18n/routing.ts`
- Create: `src/shared/i18n/request.ts`
- Create: `src/shared/i18n/messages/ru.json`
- Create: `src/shared/i18n/messages/en.json`

- [ ] **Create `routing.ts`**

```ts
// src/shared/i18n/routing.ts
import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';

export const routing = defineRouting({
  locales: ['ru', 'en'] as const,
  defaultLocale: 'ru',
  localePrefix: 'as-needed',
});

export const { Link, redirect, usePathname, useRouter } = createNavigation(routing);
```

- [ ] **Create `request.ts`**

```ts
// src/shared/i18n/request.ts
import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;
  if (!locale || !(routing.locales as readonly string[]).includes(locale)) {
    locale = routing.defaultLocale;
  }
  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default,
  };
});
```

- [ ] **Create `ru.json`**

```json
{
  "meta": {
    "title": "ph1l74 — интерактивный портал",
    "description": "Выбери направление: арт-журнал, разработка или музыка."
  },
  "hint": {
    "desktop": "НАВЕДИ НА ЗОНУ ДЛЯ ПРЕДПРОСМОТРА",
    "mobile": "НАЖМИ, ЧТОБЫ НАСТРОИТЬ ПОРТАЛ"
  },
  "footer": {
    "idle": "ВЫБЕРИ НАПРАВЛЕНИЕ",
    "interactive": "Interactive Portal — three.js"
  },
  "header": {
    "status": "ONLINE"
  },
  "sections": {
    "art": {
      "alias": "PHL-ART · ЖУРНАЛ",
      "description": "Музыка, фотография, эссе и рецензии на фильмы.",
      "enter": "ВОЙТИ",
      "enterFull": "ВОЙТИ В PHL-ART →"
    },
    "dev": {
      "alias": "PH1L74 · РАЗРАБОТЧИК",
      "description": "Проекты, инструменты и эксперименты под псевдонимом ph1l74.",
      "enter": "ВОЙТИ",
      "enterFull": "ВОЙТИ В DEV →"
    },
    "music": {
      "alias": "МНОГО ПСЕВДОНИМОВ · ОДНО МЕСТО",
      "description": "filatique · phlegmatix project · jimmy hydroponic и другие.",
      "enter": "ВОЙТИ",
      "enterFull": "ВОЙТИ В MUSIC →"
    }
  }
}
```

- [ ] **Create `en.json`**

```json
{
  "meta": {
    "title": "ph1l74 — interactive portal",
    "description": "Choose a destination: art zine, development, or music."
  },
  "hint": {
    "desktop": "HOVER A ZONE TO PREVIEW",
    "mobile": "TAP TO TUNE THE PORTAL"
  },
  "footer": {
    "idle": "SELECT A DESTINATION",
    "interactive": "Interactive Portal — three.js"
  },
  "header": {
    "status": "ONLINE"
  },
  "sections": {
    "art": {
      "alias": "PHL-ART · ZINE",
      "description": "Music, photography, essays & film reviews — my zine.",
      "enter": "ENTER",
      "enterFull": "ENTER PHL-ART →"
    },
    "dev": {
      "alias": "PH1L74 · DEVELOPER",
      "description": "Developer. Projects, tools & experiments under ph1l74.",
      "enter": "ENTER",
      "enterFull": "ENTER DEV →"
    },
    "music": {
      "alias": "MANY ALIASES · ONE PLACE",
      "description": "filatique · phlegmatix project · jimmy hydroponic & more.",
      "enter": "ENTER",
      "enterFull": "ENTER MUSIC →"
    }
  }
}
```

- [ ] **Commit**

```bash
git add src/shared/i18n/
git commit -m "feat: add next-intl routing config and RU/EN messages"
```

---

## Task 4: Update next.config.ts

**Files:** Modify `next.config.ts`

- [ ] **Replace `next.config.ts` content**

```ts
// next.config.ts
import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/shared/i18n/request.ts');

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: 'standalone',

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },

  images: {
    formats: ['image/avif', 'image/webp'],
    domains: [],
    dangerouslyAllowSVG: false,
  },

  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  poweredByHeader: false,
};

export default withNextIntl(nextConfig);
```

- [ ] **Verify build compiles**

```bash
npm run build
```

Expected: build succeeds (may warn about missing [locale] pages — that's fine at this stage).

- [ ] **Commit**

```bash
git add next.config.ts
git commit -m "feat: integrate next-intl plugin into next.config.ts"
```

---

## Task 5: Update middleware.ts

**Files:** Modify `src/middleware.ts`

- [ ] **Replace `src/middleware.ts` content**

```ts
// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import createIntlMiddleware from 'next-intl/middleware';
import { routing } from '@/shared/i18n/routing';

const intlMiddleware = createIntlMiddleware(routing);

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 100;

const SUSPICIOUS_PATTERNS = [
  /powershell/i, /cmd\.exe/i, /bash/i, /wget/i, /curl/i, /base64/i,
  /eval\(/i, /exec\(/i, /__proto__/i, /constructor/i, /\.\.\/\.\.\//,
  /<script/i, /javascript:/i, /xmrig/i, /miner/i, /bot/i, /aria2c/i,
];

const BOT_PATTERNS = [
  /masscan/i, /nmap/i, /nikto/i, /sqlmap/i, /acunetix/i,
  /burp/i, /metasploit/i, /havij/i,
];

const ALLOW_PATHS = ['/api/health'];

function isIPAddress(host: string): boolean {
  return /^\d+\.\d+\.\d+\.\d+$/.test(host);
}

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);
  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }
  if (record.count >= RATE_LIMIT_MAX_REQUESTS) return false;
  record.count++;
  return true;
}

function addSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data: https:; connect-src 'self';"
  );
  response.headers.set(
    'Permissions-Policy',
    'accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()'
  );
  return response;
}

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // Health probe: bypass all checks
  if (ALLOW_PATHS.includes(pathname)) {
    return NextResponse.next();
  }

  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    request.headers.get('x-real-ip') ||
    'unknown';
  const userAgent = request.headers.get('user-agent') || '';
  const host = request.headers.get('host') || '';

  if (isIPAddress(host)) {
    console.warn(`[SECURITY] Blocked direct IP access from ${ip}`);
    return new NextResponse('Forbidden', { status: 403 });
  }

  if (!checkRateLimit(ip)) {
    console.warn(`[SECURITY] Rate limit exceeded for ${ip}`);
    return new NextResponse('Too Many Requests', { status: 429 });
  }

  const fullUrl = request.url;
  for (const pattern of SUSPICIOUS_PATTERNS) {
    if (pattern.test(fullUrl) || pattern.test(pathname)) {
      console.warn(`[SECURITY] Blocked suspicious URL from ${ip}: ${pathname}`);
      return new NextResponse('Forbidden', { status: 403 });
    }
  }

  for (const [key, value] of searchParams.entries()) {
    for (const pattern of SUSPICIOUS_PATTERNS) {
      if (pattern.test(key) || pattern.test(value)) {
        console.warn(`[SECURITY] Blocked suspicious query from ${ip}: ${key}=${value}`);
        return new NextResponse('Forbidden', { status: 403 });
      }
    }
  }

  for (const pattern of BOT_PATTERNS) {
    if (pattern.test(userAgent)) {
      console.warn(`[SECURITY] Blocked bot UA from ${ip}: ${userAgent}`);
      return new NextResponse('Forbidden', { status: 403 });
    }
  }

  if (!userAgent) {
    console.warn(`[SECURITY] Blocked no-UA request from ${ip}`);
    return new NextResponse('Forbidden', { status: 403 });
  }

  // API routes: security headers only, skip i18n locale routing
  if (pathname.startsWith('/api/')) {
    return addSecurityHeaders(NextResponse.next());
  }

  // Page routes: i18n locale detection/redirect + security headers
  const response = intlMiddleware(request) as NextResponse;
  return addSecurityHeaders(response);
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ttf|woff|woff2)$).*)',
  ],
};
```

- [ ] **Verify dev server starts**

```bash
npm run dev
```

Open `http://localhost:3000` — should not 500. Press Ctrl+C.

- [ ] **Commit**

```bash
git add src/middleware.ts
git commit -m "feat: chain next-intl middleware after security checks"
```

---

## Task 6: Update globals.css

**Files:** Modify `src/app/globals.css`

- [ ] **Replace `globals.css` content** (removes old font-faces, old keyframes, old theme tokens; keeps only minimal reset and new design tokens)

```css
/* src/app/globals.css */
@import "tailwindcss";

::selection {
  background: #e8454c;
  color: #0a0a0b;
}

*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html,
body {
  height: 100%;
  overflow: hidden;
  background: #0a0a0b;
  color: #ededf0;
}

@supports (-webkit-touch-callout: none) {
  html,
  body {
    height: -webkit-fill-available;
  }
}
```

- [ ] **Commit**

```bash
git add src/app/globals.css
git commit -m "feat: replace globals.css with portal design tokens"
```

---

## Task 7: App [locale] structure

**Files:**
- Modify: `src/app/layout.tsx`
- Create: `src/app/[locale]/layout.tsx`
- Create: `src/app/[locale]/page.tsx`

- [ ] **Replace root `src/app/layout.tsx`** (pass-through; `[locale]/layout.tsx` provides `<html>/<body>`)

```tsx
// src/app/layout.tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
```

- [ ] **Create `src/app/[locale]/layout.tsx`**

```tsx
// src/app/[locale]/layout.tsx
import { Space_Grotesk, Space_Mono } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/shared/i18n/routing';
import '../globals.css';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-space-grotesk',
  display: 'swap',
});

const spaceMono = Space_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-space-mono',
  display: 'swap',
});

export async function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  return {
    title: t('title'),
    description: t('description'),
    openGraph: {
      type: 'website' as const,
      url: 'https://ph1l74.com',
      images: [{ url: '/opengraph-image', width: 1200, height: 630 }],
    },
    twitter: { card: 'summary_large_image' as const },
    alternates: {
      canonical: 'https://ph1l74.com',
      languages: {
        ru: 'https://ph1l74.com',
        en: 'https://ph1l74.com/en',
      },
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!(routing.locales as readonly string[]).includes(locale)) {
    notFound();
  }
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={`${spaceGrotesk.variable} ${spaceMono.variable}`}
    >
      <body suppressHydrationWarning>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
```

- [ ] **Create `src/app/[locale]/page.tsx`**

```tsx
// src/app/[locale]/page.tsx
import { PortalPage } from '@/page-layer';

export default function Page() {
  return <PortalPage />;
}
```

- [ ] **Verify dev server starts without error**

```bash
npm run dev
```

Navigate to `http://localhost:3000` and `http://localhost:3000/en`. Both should render (blank page is fine — `PortalPage` doesn't exist yet). Press Ctrl+C.

- [ ] **Commit**

```bash
git add src/app/layout.tsx src/app/[locale]/
git commit -m "feat: add locale app structure with next-intl and Space fonts"
```

---

## Task 8: usePortalShader hook

**Files:**
- Create: `src/widgets/portal-canvas/use-portal-shader.ts`

This is the Three.js core — GLSL copied verbatim from `docs/design/Portal.dc.html`, adaptive DPR optimization added.

- [ ] **Create `src/widgets/portal-canvas/use-portal-shader.ts`**

```ts
// src/widgets/portal-canvas/use-portal-shader.ts
'use client';

import { RefObject, useCallback, useEffect, useRef } from 'react';
import * as THREE from 'three';
import type { SectionId, PortalSection } from '@/shared/config/portal.config';

interface ShaderConfig {
  sections: readonly PortalSection[];
  intensity: number;
  neutralColor: string;
}

// Caps internal shader resolution to ~2MP regardless of screen size.
// At 4K (3840×2160) this keeps fragment work ~10× lower than native DPR 2.
function getAdaptiveDpr(canvas: HTMLCanvasElement): number {
  const screenPixels = Math.max(canvas.clientWidth * canvas.clientHeight, 1);
  const adaptiveDpr = Math.sqrt(2_000_000 / screenPixels);
  return Math.min(window.devicePixelRatio || 1, adaptiveDpr, 1.5);
}

const VERTEX_SHADER = /* glsl */ `
  void main() {
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

// Ashima 3D Simplex Noise — verbatim from docs/design/Portal.dc.html
const SNOISE_GLSL = /* glsl */ `
  vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x,289.0);}
  vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
  float snoise(vec3 v){
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i  = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + 1.0 * C.xxx;
    vec3 x2 = x0 - i2 + 2.0 * C.xxx;
    vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;
    i = mod(i, 289.0);
    vec4 p = permute( permute( permute(
              i.z + vec4(0.0, i1.z, i2.z, 1.0))
            + i.y + vec4(0.0, i1.y, i2.y, 1.0))
            + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    float n_ = 1.0/7.0;
    vec3 ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }
`;

const FRAGMENT_SHADER = /* glsl */ `
  precision highp float;
  uniform float uTime;
  uniform vec2 uResolution;
  uniform vec2 uMouse;
  uniform vec3 uColor;
  uniform float uActivate;
  uniform float uIntensity;
  uniform vec3 uColA;
  uniform vec3 uColB;
  uniform vec3 uColC;
  ${SNOISE_GLSL}
  void main(){
    vec2 uv = gl_FragCoord.xy / uResolution;
    float aspect = uResolution.x / uResolution.y;
    vec2 p = uv; p.x *= aspect;
    float t = uTime * 0.06;

    float warpAmt = 0.10 + uIntensity * 0.28;
    vec2 warp = vec2(
      snoise(vec3(p * 1.1, t)),
      snoise(vec3(p * 1.1 + 31.4, t))
    ) * warpAmt;
    vec2 q = p + warp;

    vec2 m = uMouse * 0.5 + 0.5; m.x *= aspect;
    float dm = distance(q, m);
    float wave = sin(dm * 20.0 - uTime * 2.2) * exp(-dm * 3.0);

    float n1 = snoise(vec3(q * 0.85, t));
    float n2 = snoise(vec3(q * 1.7 + 7.0, t * 1.2));
    vec3 base = vec3(0.020, 0.020, 0.026);
    base = mix(base, vec3(0.072, 0.074, 0.090), smoothstep(-0.5, 0.7, n1));
    base = mix(base, vec3(0.012, 0.012, 0.017), smoothstep(0.1, 0.95, n2));

    vec3 wash = mix(uColA, uColC, smoothstep(-0.55, 0.6, n1));
    wash = mix(wash, uColB, smoothstep(0.05, 0.9, n2));
    base += wash * 0.06;
    base += wave * 0.02;

    float bloom = exp(-dm * dm * 1.5);
    float band  = smoothstep(0.34, 0.0, abs(n1 * 0.5 - (uv.y - 0.5)));
    float acc = bloom * (0.34 + uActivate * 0.85) + wave * 0.55 * bloom + band * 0.09 * (0.3 + uActivate);
    vec3 col = base + uColor * acc;

    float vig = smoothstep(1.3, 0.3, distance(uv, vec2(0.5)));
    col *= 0.5 + 0.5 * vig;

    float g = fract(sin(dot(gl_FragCoord.xy + floor(uTime * 24.0), vec2(12.9898, 78.233))) * 43758.5453) - 0.5;
    col += g * 0.05;

    gl_FragColor = vec4(col, 1.0);
  }
`;

export function usePortalShader(
  canvasRef: RefObject<HTMLCanvasElement | null>,
  config: ShaderConfig,
): { setFocus: (id: SectionId | null) => void } {
  const focusIdRef = useRef<SectionId | null>(null);

  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const matRef = useRef<THREE.ShaderMaterial | null>(null);
  const clockRef = useRef<THREE.Clock | null>(null);
  const colorsRef = useRef<Record<string, THREE.Color>>({});
  const curColorRef = useRef<THREE.Color>(new THREE.Color());
  const mouseRef = useRef({ x: 0, y: 0 });
  const mouseTargetRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number>(0);
  const resizeFnRef = useRef<(() => void) | null>(null);

  const setFocus = useCallback((id: SectionId | null) => {
    focusIdRef.current = id;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Build color map from config
    const neutral = new THREE.Color(config.neutralColor);
    const colors: Record<string, THREE.Color> = { neutral };
    for (const s of config.sections) {
      colors[s.id] = new THREE.Color(s.accent);
    }
    colorsRef.current = colors;
    curColorRef.current = neutral.clone();

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false });
    renderer.setPixelRatio(getAdaptiveDpr(canvas));
    rendererRef.current = renderer;

    const scene = new THREE.Scene();
    const camera = new THREE.Camera();

    const [artSection, devSection, musicSection] = config.sections;

    const mat = new THREE.ShaderMaterial({
      uniforms: {
        uTime:       { value: 0 },
        uResolution: { value: new THREE.Vector2(1, 1) },
        uMouse:      { value: new THREE.Vector2() },
        uColor:      { value: curColorRef.current.clone() },
        uActivate:   { value: 0 },
        uIntensity:  { value: config.intensity },
        uColA:       { value: new THREE.Color(artSection.accent) },
        uColB:       { value: new THREE.Color(devSection.accent) },
        uColC:       { value: new THREE.Color(musicSection.accent) },
      },
      vertexShader: VERTEX_SHADER,
      fragmentShader: FRAGMENT_SHADER,
      depthTest: false,
      depthWrite: false,
    });
    matRef.current = mat;
    scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat));

    const resize = () => {
      const w = canvas.clientWidth || window.innerWidth;
      const h = canvas.clientHeight || window.innerHeight;
      renderer.setPixelRatio(getAdaptiveDpr(canvas));
      renderer.setSize(w, h, false);
      const dpr = renderer.getPixelRatio();
      mat.uniforms.uResolution.value.set(w * dpr, h * dpr);
    };
    resizeFnRef.current = resize;
    resize();

    const onMouseMove = (e: MouseEvent) => {
      mouseTargetRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseTargetRef.current.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    const onResize = () => resize();
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('resize', onResize);

    const clock = new THREE.Clock();
    clockRef.current = clock;

    const tick = () => {
      const focusId = focusIdRef.current;
      const target = focusId ? colors[focusId] : colors.neutral;
      curColorRef.current.lerp(target, 0.06);
      mat.uniforms.uColor.value.copy(curColorRef.current);

      const actTarget = focusId ? 1 : 0;
      mat.uniforms.uActivate.value += (actTarget - mat.uniforms.uActivate.value) * 0.06;

      const m = mouseRef.current;
      const mt = mouseTargetRef.current;
      m.x += (mt.x - m.x) * 0.07;
      m.y += (mt.y - m.y) * 0.07;
      mat.uniforms.uMouse.value.set(m.x, m.y);
      mat.uniforms.uTime.value = clock.getElapsedTime();

      renderer.render(scene, camera);
      rafRef.current = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      rendererRef.current = null;
      matRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally empty — Three.js objects are fully imperative

  return { setFocus };
}
```

- [ ] **Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Commit**

```bash
git add src/widgets/portal-canvas/use-portal-shader.ts
git commit -m "feat: add usePortalShader hook with adaptive 4K DPR optimization"
```

---

## Task 9: PortalCanvas widget

**Files:**
- Create: `src/widgets/portal-canvas/index.tsx`

- [ ] **Create `src/widgets/portal-canvas/index.tsx`**

```tsx
// src/widgets/portal-canvas/index.tsx
'use client';

import { forwardRef, useImperativeHandle, useRef } from 'react';
import { usePortalShader } from './use-portal-shader';
import { PORTAL_CONFIG } from '@/shared/config/portal.config';
import type { SectionId } from '@/shared/config/portal.config';

export interface PortalCanvasHandle {
  setFocus: (id: SectionId | null) => void;
}

const PortalCanvas = forwardRef<PortalCanvasHandle>(function PortalCanvas(_props, ref) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const { setFocus } = usePortalShader(canvasRef, {
    sections: PORTAL_CONFIG.sections,
    intensity: PORTAL_CONFIG.intensity,
    neutralColor: PORTAL_CONFIG.neutralColor,
  });

  useImperativeHandle(ref, () => ({ setFocus }), [setFocus]);

  return (
    <>
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          display: 'block',
          zIndex: 1,
          pointerEvents: 'none',
        }}
      />
      {/* Radial vignette overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 2,
          background:
            'radial-gradient(120% 95% at 50% 44%, transparent 42%, rgba(10,10,11,0.55) 100%)',
        }}
      />
    </>
  );
});

export default PortalCanvas;
```

- [ ] **Type-check**

```bash
npx tsc --noEmit
```

- [ ] **Commit**

```bash
git add src/widgets/portal-canvas/index.tsx
git commit -m "feat: add PortalCanvas with imperative setFocus handle"
```

---

## Task 10: PortalHeader widget

**Files:**
- Create: `src/widgets/portal-header/index.tsx`

- [ ] **Create `src/widgets/portal-header/index.tsx`**

```tsx
// src/widgets/portal-header/index.tsx
'use client';

import { useLocale } from 'next-intl';
import { Link } from '@/shared/i18n/routing';

interface PortalHeaderProps {
  name: string;
  handle: string;
  year: string;
  statusLabel: string;
}

const MONO: React.CSSProperties = {
  fontFamily: 'var(--font-space-mono), monospace',
};

export function PortalHeader({ name, handle, year, statusLabel }: PortalHeaderProps) {
  const locale = useLocale();

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '20px 30px',
        ...MONO,
        fontSize: 11,
        letterSpacing: '2px',
        textTransform: 'uppercase',
        color: '#6a6a72',
        zIndex: 6,
        borderBottom: '1px solid #15151a',
        pointerEvents: 'none',
      }}
    >
      {/* Left: brand */}
      <span style={{ display: 'flex', alignItems: 'center', gap: 9, color: '#cfcfd6' }}>
        <span
          style={{ width: 9, height: 9, background: '#ededf0', display: 'inline-block', flexShrink: 0 }}
        />
        {name}
      </span>

      {/* Center: status */}
      <span style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: '#3ad17a',
            display: 'inline-block',
            boxShadow: '0 0 8px #3ad17a',
            flexShrink: 0,
          }}
        />
        {statusLabel}
      </span>

      {/* Right: handle + lang switcher */}
      <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span>
          {handle} / {year}
        </span>
        <span style={{ color: '#1a1a20' }}>|</span>
        <span style={{ pointerEvents: 'auto', display: 'flex', gap: 4, alignItems: 'center' }}>
          <Link
            href="/"
            locale="ru"
            style={{
              color: locale === 'ru' ? '#ededf0' : '#50505a',
              textDecoration: 'none',
              transition: 'color .3s',
            }}
          >
            RU
          </Link>
          <span style={{ color: '#30303a' }}>/</span>
          <Link
            href="/"
            locale="en"
            style={{
              color: locale === 'en' ? '#ededf0' : '#50505a',
              textDecoration: 'none',
              transition: 'color .3s',
            }}
          >
            EN
          </Link>
        </span>
      </span>
    </div>
  );
}
```

- [ ] **Commit**

```bash
git add src/widgets/portal-header/index.tsx
git commit -m "feat: add PortalHeader with language switcher"
```

---

## Task 11: PortalFooter widget

**Files:**
- Create: `src/widgets/portal-footer/index.tsx`

- [ ] **Create `src/widgets/portal-footer/index.tsx`**

```tsx
// src/widgets/portal-footer/index.tsx
import type { SectionId, PortalSection } from '@/shared/config/portal.config';

// Footer labels for the active destination (not translated — section names stay fixed)
const FOOTER_LABELS: Record<SectionId, string> = {
  art: 'PHL-ART',
  dev: 'DEV / ph1l74',
  music: 'MUSIC',
};

interface PortalFooterProps {
  hover: SectionId | null;
  active: SectionId | null;
  sections: readonly PortalSection[];
  idleLabel: string;
  interactiveLabel: string;
}

const MONO: React.CSSProperties = {
  fontFamily: 'var(--font-space-mono), monospace',
};

export function PortalFooter({
  hover,
  active,
  sections,
  idleLabel,
  interactiveLabel,
}: PortalFooterProps) {
  const cur = hover ?? active;
  const accent = cur ? sections.find((s) => s.id === cur)?.accent : undefined;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '15px 30px',
        ...MONO,
        fontSize: 10,
        letterSpacing: '1.5px',
        textTransform: 'uppercase',
        color: '#55555f',
        zIndex: 6,
        borderTop: '1px solid #15151a',
        pointerEvents: 'none',
      }}
    >
      <span
        style={{
          color: accent ?? '#55555f',
          transition: 'color .4s',
        }}
      >
        {cur ? `> ${FOOTER_LABELS[cur]}` : idleLabel}
      </span>
      <span>{interactiveLabel}</span>
    </div>
  );
}
```

- [ ] **Commit**

```bash
git add src/widgets/portal-footer/index.tsx
git commit -m "feat: add PortalFooter with dynamic destination label"
```

---

## Task 12: Desktop zones

**Files:**
- Create: `src/widgets/desktop-zones/zone-item.tsx`
- Create: `src/widgets/desktop-zones/index.tsx`

- [ ] **Create `src/widgets/desktop-zones/zone-item.tsx`**

```tsx
// src/widgets/desktop-zones/zone-item.tsx
import type { PortalSection, SectionId } from '@/shared/config/portal.config';

interface ZoneTranslation {
  alias: string;
  description: string;
  enter: string;
}

interface ZoneItemProps {
  section: PortalSection;
  index: number;
  isLast: boolean;
  isHovered: boolean;
  otherHovered: boolean;
  translation: ZoneTranslation;
  onMouseEnter: (id: SectionId) => void;
  onMouseLeave: () => void;
}

const GROTESK: React.CSSProperties = { fontFamily: 'var(--font-space-grotesk), sans-serif' };
const MONO: React.CSSProperties = { fontFamily: 'var(--font-space-mono), monospace' };
const EASE = 'cubic-bezier(.2,.7,.2,1)';

export function ZoneItem({
  section,
  index,
  isLast,
  isHovered,
  otherHovered,
  translation,
  onMouseEnter,
  onMouseLeave,
}: ZoneItemProps) {
  const { id, url, accent } = section;
  const num = String(index + 1).padStart(2, '0');

  return (
    <a
      href={url}
      style={{
        flex: 1,
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        padding: '0 0 42px 0',
        textDecoration: 'none',
        color: 'inherit',
        cursor: 'pointer',
        borderRight: isLast ? 'none' : '1px solid #1a1a20',
        overflow: 'hidden',
        opacity: otherHovered ? 0.3 : 1,
        transition: `opacity .55s ${EASE}`,
      }}
      onMouseEnter={() => onMouseEnter(id)}
      onMouseLeave={onMouseLeave}
    >
      {/* Index number */}
      <span
        style={{
          position: 'absolute',
          top: 88,
          left: 34,
          ...MONO,
          fontSize: 12,
          letterSpacing: '3px',
          color: isHovered ? accent : '#50505a',
          transition: 'color .4s',
          zIndex: 2,
        }}
      >
        {num}
      </span>

      {/* Inner block — lifts on hover */}
      <div
        style={{
          padding: '0 34px',
          position: 'relative',
          zIndex: 2,
          transform: isHovered ? 'translateY(-6px)' : 'translateY(0)',
          transition: `transform .55s ${EASE}`,
        }}
      >
        {/* Title */}
        <h2
          style={{
            ...GROTESK,
            fontWeight: 700,
            fontSize: 'clamp(44px, 4.6vw, 86px)',
            lineHeight: 0.9,
            letterSpacing: '-0.03em',
            color: isHovered ? accent : '#ededf0',
            transition: 'color .4s',
            margin: 0,
          }}
        >
          {id.toUpperCase()}
        </h2>

        {/* Alias */}
        <div
          style={{
            ...MONO,
            fontSize: 12,
            letterSpacing: '2px',
            color: '#85858d',
            marginTop: 16,
            textTransform: 'uppercase',
          }}
        >
          {translation.alias}
        </div>

        {/* Description — reveals on hover */}
        <div
          style={{
            ...GROTESK,
            fontSize: 14,
            lineHeight: 1.5,
            color: '#a6a6ae',
            maxWidth: '28ch',
            overflow: 'hidden',
            maxHeight: isHovered ? 90 : 0,
            opacity: isHovered ? 1 : 0,
            marginTop: isHovered ? 16 : 0,
            transition: `all .55s ${EASE}`,
          }}
        >
          {translation.description}
        </div>

        {/* Enter affordance */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: isHovered ? 16 : 8,
            ...MONO,
            fontSize: 12,
            letterSpacing: '3px',
            color: isHovered ? accent : '#65656d',
            marginTop: 24,
            transition: 'color .4s, gap .4s',
          }}
        >
          {translation.enter} →
        </div>
      </div>

      {/* Accent bar — sweeps across bottom on hover */}
      <span
        style={{
          position: 'absolute',
          left: 0,
          bottom: 0,
          height: 3,
          width: isHovered ? '100%' : '0%',
          background: accent,
          transition: `width .6s ${EASE}`,
          zIndex: 2,
          boxShadow: isHovered ? `0 0 16px ${accent}` : 'none',
        }}
      />
    </a>
  );
}
```

- [ ] **Create `src/widgets/desktop-zones/index.tsx`**

```tsx
// src/widgets/desktop-zones/index.tsx
import type { SectionId, PortalSection } from '@/shared/config/portal.config';
import { ZoneItem } from './zone-item';

interface ZoneTranslation {
  alias: string;
  description: string;
  enter: string;
}

interface DesktopZonesProps {
  sections: readonly PortalSection[];
  hover: SectionId | null;
  translations: Record<SectionId, ZoneTranslation>;
  onHover: (id: SectionId) => void;
  onLeave: () => void;
}

export function DesktopZones({ sections, hover, translations, onHover, onLeave }: DesktopZonesProps) {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        zIndex: 4,
      }}
    >
      {sections.map((section, i) => (
        <ZoneItem
          key={section.id}
          section={section}
          index={i}
          isLast={i === sections.length - 1}
          isHovered={hover === section.id}
          otherHovered={hover !== null && hover !== section.id}
          translation={translations[section.id]}
          onMouseEnter={onHover}
          onMouseLeave={onLeave}
        />
      ))}
    </div>
  );
}
```

- [ ] **Commit**

```bash
git add src/widgets/desktop-zones/
git commit -m "feat: add DesktopZones with hover interactions"
```

---

## Task 13: Mobile stack

**Files:**
- Create: `src/widgets/mobile-stack/mobile-block.tsx`
- Create: `src/widgets/mobile-stack/index.tsx`

- [ ] **Create `src/widgets/mobile-stack/mobile-block.tsx`**

```tsx
// src/widgets/mobile-stack/mobile-block.tsx
import type { PortalSection, SectionId } from '@/shared/config/portal.config';

interface MobileBlockTranslation {
  alias: string;
  description: string;
  enterFull: string;
}

interface MobileBlockProps {
  section: PortalSection;
  index: number;
  isActive: boolean;
  translation: MobileBlockTranslation;
  onSelect: (id: SectionId) => void;
}

const GROTESK: React.CSSProperties = { fontFamily: 'var(--font-space-grotesk), sans-serif' };
const MONO: React.CSSProperties = { fontFamily: 'var(--font-space-mono), monospace' };

export function MobileBlock({ section, index, isActive, translation, onSelect }: MobileBlockProps) {
  const { id, url, accent } = section;
  const num = String(index + 1).padStart(2, '0');

  return (
    <div
      onClick={() => onSelect(id)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        padding: '20px 22px',
        borderTop: '1px solid #18181d',
        cursor: 'pointer',
        background: isActive ? 'rgba(255,255,255,0.025)' : 'transparent',
        transition: 'background .3s',
      }}
    >
      {/* Title row */}
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <h2
          style={{
            ...GROTESK,
            fontWeight: 700,
            fontSize: 34,
            lineHeight: 1,
            letterSpacing: '-0.02em',
            color: isActive ? accent : '#ededf0',
            margin: 0,
            transition: 'color .3s',
          }}
        >
          {id.toUpperCase()}
        </h2>
        <span
          style={{
            ...MONO,
            fontSize: 11,
            letterSpacing: '2px',
            color: isActive ? accent : '#50505a',
            transition: 'color .3s',
          }}
        >
          {num}
        </span>
      </div>

      {/* Alias */}
      <div
        style={{
          ...MONO,
          fontSize: 11,
          letterSpacing: '1px',
          color: '#85858d',
          textTransform: 'uppercase',
          marginTop: 6,
        }}
      >
        {translation.alias}
      </div>

      {/* Description — reveals on select */}
      <div
        style={{
          ...GROTESK,
          fontSize: 13,
          lineHeight: 1.5,
          color: '#a6a6ae',
          overflow: 'hidden',
          maxHeight: isActive ? 60 : 0,
          opacity: isActive ? 1 : 0,
          marginTop: isActive ? 10 : 0,
          transition: 'all .4s',
        }}
      >
        {translation.description}
      </div>

      {/* Enter link — visible only when active */}
      {isActive && (
        <a
          href={url}
          onClick={(e) => e.stopPropagation()}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            ...MONO,
            fontSize: 11,
            letterSpacing: '2px',
            color: accent,
            marginTop: 12,
            textDecoration: 'none',
          }}
        >
          {translation.enterFull}
        </a>
      )}
    </div>
  );
}
```

- [ ] **Create `src/widgets/mobile-stack/index.tsx`**

```tsx
// src/widgets/mobile-stack/index.tsx
import type { SectionId, PortalSection } from '@/shared/config/portal.config';
import { MobileBlock } from './mobile-block';

interface MobileBlockTranslation {
  alias: string;
  description: string;
  enterFull: string;
}

interface MobileStackProps {
  sections: readonly PortalSection[];
  active: SectionId | null;
  translations: Record<SectionId, MobileBlockTranslation>;
  onSelect: (id: SectionId) => void;
}

export function MobileStack({ sections, active, translations, onSelect }: MobileStackProps) {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        zIndex: 4,
        paddingTop: 60,
      }}
    >
      {/* Flex spacer pushes blocks to bottom */}
      <div style={{ flex: 1 }} />

      {/* Gradient scrim + blocks */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          background: 'linear-gradient(to top, rgba(10,10,11,0.92), rgba(10,10,11,0))',
        }}
      >
        {sections.map((section, i) => (
          <MobileBlock
            key={section.id}
            section={section}
            index={i}
            isActive={active === section.id}
            translation={translations[section.id]}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Commit**

```bash
git add src/widgets/mobile-stack/
git commit -m "feat: add MobileStack with tap-to-tune interaction"
```

---

## Task 14: PortalPage

**Files:**
- Create: `src/page-layer/portal-page.tsx`
- Modify: `src/page-layer/index.ts`

- [ ] **Create `src/page-layer/portal-page.tsx`**

```tsx
// src/page-layer/portal-page.tsx
'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';
import { PORTAL_CONFIG } from '@/shared/config/portal.config';
import type { SectionId } from '@/shared/config/portal.config';
import { PortalHeader } from '@/widgets/portal-header';
import { PortalFooter } from '@/widgets/portal-footer';
import { DesktopZones } from '@/widgets/desktop-zones';
import { MobileStack } from '@/widgets/mobile-stack';
import type { PortalCanvasHandle } from '@/widgets/portal-canvas';

// Load Three.js canvas only client-side — avoids SSR import of three.js
const PortalCanvas = dynamic(() => import('@/widgets/portal-canvas'), { ssr: false });

const BREAKPOINT = 860;

export function PortalPage() {
  const t = useTranslations();

  const [hover, setHover] = useState<SectionId | null>(null);
  const [active, setActive] = useState<SectionId | null>(null);
  const [isDesktop, setIsDesktop] = useState(
    typeof window !== 'undefined' ? window.innerWidth >= BREAKPOINT : true,
  );

  const canvasRef = useRef<PortalCanvasHandle>(null);

  // Sync focusId with the Three.js render loop imperatively (no re-render)
  const syncFocus = useCallback((hover: SectionId | null, active: SectionId | null) => {
    canvasRef.current?.setFocus(hover ?? active);
  }, []);

  const onHover = useCallback((id: SectionId) => {
    setHover(id);
    canvasRef.current?.setFocus(id);
  }, []);

  const onLeave = useCallback(() => {
    setHover(null);
    canvasRef.current?.setFocus(active);
  }, [active]);

  const onSelect = useCallback((id: SectionId) => {
    setActive(id);
    canvasRef.current?.setFocus(id);
  }, []);

  // Recompute focus when active changes (e.g. after mobile select while not hovering)
  useEffect(() => {
    syncFocus(hover, active);
  }, [active, hover, syncFocus]);

  // Track breakpoint
  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= BREAKPOINT);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Build translation maps for children (avoid passing `t` itself)
  const sectionTranslations = {
    art:   { alias: t('sections.art.alias'),   description: t('sections.art.description'),   enter: t('sections.art.enter'),   enterFull: t('sections.art.enterFull') },
    dev:   { alias: t('sections.dev.alias'),   description: t('sections.dev.description'),   enter: t('sections.dev.enter'),   enterFull: t('sections.dev.enterFull') },
    music: { alias: t('sections.music.alias'), description: t('sections.music.description'), enter: t('sections.music.enter'), enterFull: t('sections.music.enterFull') },
  } as const;

  const cur = hover ?? active;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        overflow: 'hidden',
        background: '#0a0a0b',
        fontFamily: 'var(--font-space-grotesk), sans-serif',
        color: '#ededf0',
      }}
    >
      {/* WebGL background */}
      <PortalCanvas ref={canvasRef} />

      {/* Header */}
      <PortalHeader
        name={PORTAL_CONFIG.name}
        handle={PORTAL_CONFIG.handle}
        year={PORTAL_CONFIG.year}
        statusLabel={t('header.status')}
      />

      {/* Hint text — fades when anything is focused */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: isDesktop ? 112 : 'auto',
          bottom: isDesktop ? 'auto' : 236,
          textAlign: 'center',
          fontFamily: 'var(--font-space-mono), monospace',
          fontSize: 11,
          letterSpacing: '4px',
          color: '#5a5a64',
          textTransform: 'uppercase',
          opacity: cur ? 0 : 0.7,
          transition: 'opacity .5s',
          pointerEvents: 'none',
          zIndex: 5,
        }}
      >
        {isDesktop ? t('hint.desktop') : t('hint.mobile')}
      </div>

      {/* Navigation zones */}
      {isDesktop ? (
        <DesktopZones
          sections={PORTAL_CONFIG.sections}
          hover={hover}
          translations={sectionTranslations}
          onHover={onHover}
          onLeave={onLeave}
        />
      ) : (
        <MobileStack
          sections={PORTAL_CONFIG.sections}
          active={active}
          translations={sectionTranslations}
          onSelect={onSelect}
        />
      )}

      {/* Footer */}
      <PortalFooter
        hover={hover}
        active={active}
        sections={PORTAL_CONFIG.sections}
        idleLabel={t('footer.idle')}
        interactiveLabel={t('footer.interactive')}
      />
    </div>
  );
}
```

- [ ] **Update `src/page-layer/index.ts`**

```ts
export { PortalPage } from './portal-page';
```

- [ ] **Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Verify page renders**

```bash
npm run dev
```

Open `http://localhost:3000` — should see the dark portal with Three.js shader animating and three zones. Open `http://localhost:3000/en` — should show English text. Press Ctrl+C.

- [ ] **Commit**

```bash
git add src/page-layer/portal-page.tsx src/page-layer/index.ts
git commit -m "feat: add PortalPage orchestrating all widgets with hover/active state"
```

---

## Task 15: OpenGraph image

**Files:**
- Create: `src/app/[locale]/opengraph-image.tsx`

- [ ] **Create `src/app/[locale]/opengraph-image.tsx`**

```tsx
// src/app/[locale]/opengraph-image.tsx
import { ImageResponse } from 'next/og';
import { getTranslations } from 'next-intl/server';
import { PORTAL_CONFIG } from '@/shared/config/portal.config';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });

  // Fetch Space Grotesk Bold from Google Fonts for the OG image
  let fontData: ArrayBuffer | null = null;
  try {
    const css = await fetch(
      'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@700&display=swap',
      { headers: { 'User-Agent': 'Mozilla/5.0' } },
    ).then((r) => r.text());
    const url = css.match(/src: url\((.+?)\)/)?.[1];
    if (url) fontData = await fetch(url).then((r) => r.arrayBuffer());
  } catch {
    // font load failure is non-fatal; OG image renders with fallback
  }

  const { sections } = PORTAL_CONFIG;

  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          background: '#0a0a0b',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Three zone columns */}
        <div style={{ display: 'flex', flex: 1 }}>
          {sections.map((s, i) => (
            <div
              key={s.id}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                padding: '0 0 48px 48px',
                borderRight: i < sections.length - 1 ? '1px solid #1a1a20' : 'none',
                position: 'relative',
              }}
            >
              <div
                style={{
                  fontSize: 96,
                  fontWeight: 700,
                  color: s.accent,
                  lineHeight: 0.9,
                  letterSpacing: '-3px',
                  fontFamily: fontData ? 'Space Grotesk' : 'sans-serif',
                }}
              >
                {s.id.toUpperCase()}
              </div>
              {/* Accent bar */}
              <div
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: 3,
                  background: s.accent,
                }}
              />
            </div>
          ))}
        </div>

        {/* Center overlay */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 12,
            background: 'rgba(10,10,11,0.75)',
            padding: '24px 40px',
            borderRadius: 4,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              color: '#ededf0',
              fontSize: 22,
              letterSpacing: '3px',
              fontFamily: fontData ? 'Space Grotesk' : 'sans-serif',
            }}
          >
            <div style={{ width: 10, height: 10, background: '#ededf0' }} />
            {PORTAL_CONFIG.name}
          </div>
          <div
            style={{
              color: '#50505a',
              fontSize: 13,
              letterSpacing: '2px',
              fontFamily: 'monospace',
            }}
          >
            {t('description')}
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: fontData
        ? [{ name: 'Space Grotesk', data: fontData, weight: 700, style: 'normal' }]
        : [],
    },
  );
}
```

- [ ] **Verify OG image generates**

```bash
npm run dev
```

Open `http://localhost:3000/opengraph-image` — should render a PNG with ART/DEV/MUSIC columns. Press Ctrl+C.

- [ ] **Commit**

```bash
git add src/app/[locale]/opengraph-image.tsx
git commit -m "feat: add locale-aware OpenGraph image via next/og"
```

---

## Task 16: Delete old files + update widget exports

**Files:** Multiple deletions + new widget index

- [ ] **Delete old widgets and shared UI**

```bash
# Run from repo root
rm src/widgets/art-block.tsx
rm src/widgets/dev-block.tsx
rm src/widgets/index.ts
rm src/shared/ui/background-gradient-animation.tsx
rm src/shared/ui/background-dotted-glow.tsx
rm src/shared/ui/background-ripple-effect.tsx
rm src/shared/ui/glass-ellipse.tsx
rm src/shared/ui/index.ts
rm src/shared/config/constants.ts
rm src/page-layer/home-page.tsx
```

- [ ] **Create new `src/widgets/index.ts`**

```ts
// src/widgets/index.ts
export { PortalHeader } from './portal-header';
export { PortalFooter } from './portal-footer';
export { DesktopZones } from './desktop-zones';
export { MobileStack } from './mobile-stack';
export type { PortalCanvasHandle } from './portal-canvas';
```

- [ ] **Type-check — verify no dangling imports**

```bash
npx tsc --noEmit
```

Expected: no errors. If there are import errors from the deleted files, search for any remaining references:

```bash
grep -r "home-page\|art-block\|dev-block\|background-gradient\|background-dotted\|background-ripple\|glass-ellipse\|constants" src/ --include="*.ts" --include="*.tsx"
```

Expected: no results (other than comments).

- [ ] **Full build**

```bash
npm run build
```

Expected: successful build with no TypeScript errors.

- [ ] **Commit**

```bash
git add -A
git commit -m "chore: delete old widget/ui files replaced by portal redesign"
```

---

## Task 17: Update CLAUDE.md

**Files:** Modify `CLAUDE.md`

- [ ] **Update the Architecture section in `CLAUDE.md`** to reflect the new structure. Replace the entire "Architecture" section with:

```markdown
## Architecture

### Layer structure (FSD-lite)

\`\`\`
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
\`\`\`

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
```

- [ ] **Run lint**

```bash
npm run lint
```

Expected: no errors.

- [ ] **Final build check**

```bash
npm run build
```

Expected: successful. Note the standalone output in `.next/standalone/`.

- [ ] **Commit**

```bash
git add CLAUDE.md
git commit -m "docs: update CLAUDE.md for portal hub architecture"
```

---

## Self-Review Checklist

- [x] **Spec coverage:** Three zones ART/DEV/MUSIC ✓ | Three.js shader verbatim ✓ | Adaptive DPR 4K optimization ✓ | next-intl RU/EN ✓ | URL-based routing (`localePrefix: as-needed`) ✓ | Config in `portal.config.ts` ✓ | OpenGraph per-locale ✓ | Metadata with `generateMetadata` ✓ | Security middleware unchanged ✓ | Docker unchanged ✓ | Desktop 860px breakpoint ✓ | Mobile tap-to-tune ✓ | Header with lang switcher ✓ | Footer dynamic label ✓ | Hint fade ✓
- [x] **Type consistency:** `SectionId`, `PortalSection` used consistently across all tasks. `PortalCanvasHandle.setFocus` defined in Task 9 and consumed in Task 14. `ZoneTranslation` shape matches between `zone-item.tsx` and `desktop-zones/index.tsx`. `MobileBlockTranslation` matches between `mobile-block.tsx` and `mobile-stack/index.tsx`.
- [x] **No placeholders:** All steps contain actual code.
