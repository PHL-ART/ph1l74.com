# Handoff: ph1l74 — Portal Hub (site router)

## Overview
A single full-screen **router / hub** landing page for **Filat Astakhov (ph1l74)**. Its only job is to send a visitor to one of three destinations depending on their intent:

- **ART** → `PHL-ART` zine (music, photography, essays & film reviews)
- **DEV** → developer site & projects (alias `ph1l74`)
- **MUSIC** → all music projects/aliases in one place (filatique, ph1l74, phlegmatix project, jimmy hydroponic, Astakhov Filat, …)

The page is an interactive three.js piece: a full-screen **grainy mesh-gradient** background (the PHL-ART visual signature) that reacts to the cursor, with three navigation zones layered on top.

## About the Design Files
The files in this bundle are a **design reference created in HTML** — a working prototype showing the intended look, motion and behavior. They are **not meant to be shipped as-is**. The task is to **recreate this design in the target codebase** using its established stack and patterns (React, Vue, Svelte, Astro, plain Vite, etc.). If no codebase exists yet, pick an appropriate modern setup (e.g. Vite + React + `three` / `@react-three/fiber`, or vanilla `three`) and implement it there.

The prototype is authored as a "Design Component" (`.dc.html`) that depends on a runtime (`support.js`). **Do not port the `.dc.html`/`support.js` runtime.** Port the *design*: the WebGL shader, the layout, the interactions. The GLSL shader and all the layout/interaction logic below are framework-agnostic and copy directly.

## Fidelity
**High-fidelity.** Final colors, typography, spacing, shader, and interactions are all defined. Recreate pixel-perfectly. The only intentionally-open parts are the three destination URLs (currently `#art` / `#dev` / `#music` placeholders).

---

## Screens / Views
There is **one view** with two responsive layouts that share the same WebGL background.

### Background (both layouts)
- Full-viewport `<canvas>`, `position: fixed; inset: 0`, `z-index: 1`, `pointer-events: none`.
- Renders a single full-screen quad with a custom GLSL shader (see **WebGL background** section). Dark grainy mesh-gradient, animated, cursor-reactive.
- An overlay `<div>` on top of the canvas (`z-index: 2`, `pointer-events:none`) adds a radial vignette:
  `background: radial-gradient(120% 95% at 50% 44%, transparent 42%, rgba(10,10,11,0.55) 100%)`.

### Header (both layouts)
Fixed top bar, `z-index: 6`, `pointer-events:none`, `padding: 20px 30px`, `border-bottom: 1px solid #15151a`. `display:flex; justify-content:space-between; align-items:center`. Font `"Space Mono"`, `11px`, `letter-spacing:2px`, `text-transform:uppercase`, color `#6a6a72`.
- **Left:** brand lockup — a `9×9px` solid `#ededf0` square + the name. `display:flex; align-items:center; gap:9px; color:#cfcfd6`. Name text: `FILAT ASTAKHOV` (the square echoes the `P▪HL` logo mark).
- **Center:** `● ONLINE` — a `6×6px` green dot (`#3ad17a`, `box-shadow: 0 0 8px #3ad17a`, `border-radius:50%`) + the word `ONLINE`. `display:flex; gap:8px; align-items:center`.
- **Right:** `ph1l74 / 2026`.

### Footer (both layouts)
Fixed bottom bar, `z-index: 6`, `pointer-events:none`, `padding: 15px 30px`, `border-top: 1px solid #15151a`. `display:flex; justify-content:space-between`. Font `"Space Mono"`, `10px`, `letter-spacing:1.5px`, `text-transform:uppercase`, color `#55555f`.
- **Left:** status text. Idle: `SELECT A DESTINATION` (color `#55555f`). When a zone is hovered/active: `> PHL-ART` / `> DEV / ph1l74` / `> MUSIC`, colored in that zone's accent (`transition: color .4s`).
- **Right:** `Interactive Portal — three.js`.

### Center hint (both layouts)
Centered helper text, `"Space Mono"` `11px`, `letter-spacing:4px`, uppercase, color `#5a5a64`, `opacity:0.7`, `pointer-events:none`. Fades to `opacity:0` (`transition: opacity .5s`) as soon as any zone is hovered/active.
- Desktop: positioned `top:112px`, text `HOVER A ZONE TO PREVIEW`.
- Mobile: positioned `bottom:236px`, text `TAP TO TUNE THE PORTAL`.

---

### Layout A — Desktop (viewport width ≥ 860px)
Three equal-width vertical zones filling the screen (`position:absolute; inset:0; display:flex; z-index:4`). Each zone is an `<a>` (the whole column is the click target).

**Zone (`<a>`):** `flex:1; position:relative; display:flex; flex-direction:column; justify-content:flex-end; padding:0 0 42px 0; overflow:hidden; cursor:pointer; text-decoration:none`. Right border `1px solid #1a1a20` (none on the last zone). When **another** zone is hovered, this one drops to `opacity:0.3` (`transition: opacity .55s cubic-bezier(.2,.7,.2,1)`).

Within each zone, bottom-aligned:
- **Index number** — absolutely positioned `top:88px; left:34px`. `"Space Mono"` `12px`, `letter-spacing:3px`. Color `#50505a`, → zone accent on hover (`transition: color .4s`). Values `01` / `02` / `03`.
- **Inner block** — `padding:0 34px`. On hover: `transform: translateY(-6px)` (`transition .55s cubic-bezier(.2,.7,.2,1)`), idle `translateY(0)`.
  - **Title** `<h2>` — `"Space Grotesk"` `700`, `font-size: clamp(44px,4.6vw,86px)`, `line-height:0.9`, `letter-spacing:-0.03em`. Color `#ededf0`, → zone accent on hover. Text: `ART` / `DEV` / `MUSIC`.
  - **Alias** — `"Space Mono"` `12px`, `letter-spacing:2px`, uppercase, color `#85858d`, `margin-top:16px`. Text: `PHL-ART · ZINE` / `PH1L74 · DEVELOPER` / `MANY ALIASES · ONE PLACE`.
  - **Description** — `"Space Grotesk"` `14px`, `line-height:1.5`, color `#a6a6ae`, `max-width:28ch`. **Reveals only on hover**: animate `max-height 0→90px`, `opacity 0→1`, `margin-top 0→16px` (`transition: all .55s cubic-bezier(.2,.7,.2,1)`; `overflow:hidden`). Text:
    - ART: `Music, photography, essays & film reviews — my zine.`
    - DEV: `Developer. Projects, tools & experiments under ph1l74.`
    - MUSIC: `filatique · phlegmatix project · jimmy hydroponic & more.`
  - **Enter affordance** — `"Space Mono"` `12px`, `letter-spacing:3px`, `display:inline-flex; align-items:center`, `margin-top:24px`. Idle color `#65656d` + `gap:8px`; hover color = zone accent + `gap:16px` (`transition: color .4s, gap .4s`). Text `ENTER →`.
- **Accent bar** — absolutely positioned bottom edge, `height:3px`, `background:` zone accent. Width animates `0%→100%` on hover (`transition: width .6s cubic-bezier(.2,.7,.2,1)`); on hover add `box-shadow: 0 0 16px <accent>`.

**Hover drives the 3D:** hovering a zone sets that zone as the WebGL "focus" → the shader lerps its cursor bloom toward the zone accent and ramps `uActivate` 0→1. On mouse-leave it reverts to the active selection (or neutral).

### Layout B — Mobile (viewport width < 860px)
Background object stays full-screen behind. Content is a bottom-anchored stack (`position:absolute; inset:0; display:flex; flex-direction:column; z-index:4; padding-top:60px`; a `flex:1` spacer pushes content down). The stack sits on a scrim: `background: linear-gradient(to top, rgba(10,10,11,0.92), rgba(10,10,11,0))`.

Three blocks, each a tappable `<div>` (`padding:20px 22px; border-top:1px solid #18181d; cursor:pointer`). Tapping **selects/tunes** the block (does not navigate): selected block gets `background: rgba(255,255,255,0.025)` (`transition: background .3s`) and recolors the 3D to its accent.
- Row: title `<h2>` (`"Space Grotesk"` `700`, `34px`, `line-height:1`, `letter-spacing:-0.02em`; color `#ededf0` → accent when selected) + index (`"Space Mono"` `11px`, `letter-spacing:2px`, color `#50505a` → accent), `display:flex; justify-content:space-between; align-items:baseline`.
- Alias — `"Space Mono"` `11px`, `letter-spacing:1px`, uppercase, `#85858d`, `margin-top:6px`.
- Description — `"Space Grotesk"` `13px`, `line-height:1.5`, `#a6a6ae`. Reveals on select: `max-height 0→60px`, `opacity 0→1`, `margin-top 0→10px` (`transition: all .4s`).
- Enter link `<a>` — shown only when selected (`display:none`→`inline-flex`), `"Space Mono"` `11px`, `letter-spacing:2px`, color = accent, `margin-top:12px`. Text `ENTER PHL-ART →` / `ENTER DEV →` / `ENTER MUSIC →`. **This is the actual navigation** on mobile (two-step: tap to tune, then tap ENTER).

---

## WebGL Background (the core of the design)
A single full-screen quad (`PlaneGeometry(2,2)`) rendered with a `ShaderMaterial`. No camera projection — the vertex shader writes clip space directly. Renderer: `WebGLRenderer({ antialias:false, alpha:false })`, `setPixelRatio(Math.min(devicePixelRatio, 1.5))` (perf cap — important; the earlier point-cloud version lagged, this single fragment pass does not).

**Vertex shader:**
```glsl
void main(){ gl_Position = vec4(position.xy, 0.0, 1.0); }
```

**Uniforms:**
- `uTime` (float, seconds) — animation clock.
- `uResolution` (vec2) — canvas size in device pixels (`w*dpr, h*dpr`).
- `uMouse` (vec2) — pointer in NDC (-1..1), **smoothed** each frame (lerp factor ~0.07).
- `uColor` (vec3) — current focus color; lerps (factor 0.06) toward the focused zone's accent, or toward neutral `#9098b0` when nothing is focused.
- `uActivate` (float 0..1) — ramps toward 1 when a zone is focused, else 0 (lerp factor 0.06). Boosts bloom + distortion.
- `uIntensity` (float, default 0.4) — distortion/warp amount (exposed as a tweak).
- `uColA`, `uColB`, `uColC` (vec3) — the three zone accents (art, dev, music) used for the always-on ambient color "wash".

**Fragment shader** — uses a standard `snoise` (Ashima 3D simplex noise; included verbatim in the prototype). Pseudocode of the body:
```glsl
vec2 uv = gl_FragCoord.xy / uResolution;
float aspect = uResolution.x / uResolution.y;
vec2 p = uv; p.x *= aspect;
float t = uTime * 0.06;

// organic flow warp
float warpAmt = 0.10 + uIntensity * 0.28;
vec2 warp = vec2(snoise(vec3(p*1.1, t)), snoise(vec3(p*1.1 + 31.4, t))) * warpAmt;
vec2 q = p + warp;

vec2 m = uMouse*0.5 + 0.5; m.x *= aspect;
float dm = distance(q, m);
float wave = sin(dm*20.0 - uTime*2.2) * exp(-dm*3.0);   // cursor ripple

float n1 = snoise(vec3(q*0.85, t));
float n2 = snoise(vec3(q*1.7 + 7.0, t*1.2));
vec3 base = vec3(0.020,0.020,0.026);
base = mix(base, vec3(0.072,0.074,0.090), smoothstep(-0.5,0.7,n1));
base = mix(base, vec3(0.012,0.012,0.017), smoothstep(0.1,0.95,n2));

// always-on faint multicolor "wash" (PHL-ART signature)
vec3 wash = mix(uColA, uColC, smoothstep(-0.55,0.6,n1));
wash = mix(wash, uColB, smoothstep(0.05,0.9,n2));
base += wash * 0.06;
base += wave * 0.02;

// cursor-following accent bloom
float bloom = exp(-dm*dm*1.5);
float band  = smoothstep(0.34,0.0, abs(n1*0.5 - (uv.y-0.5)));
float acc = bloom*(0.34 + uActivate*0.85) + wave*0.55*bloom + band*0.09*(0.3+uActivate);
vec3 col = base + uColor * acc;

// vignette
float vig = smoothstep(1.3, 0.3, distance(uv, vec2(0.5)));
col *= 0.5 + 0.5*vig;

// animated film grain (the signature texture)
float g = fract(sin(dot(gl_FragCoord.xy + floor(uTime*24.0), vec2(12.9898,78.233))) * 43758.5453) - 0.5;
col += g * 0.05;

gl_FragColor = vec4(col, 1.0);
```
`depthTest:false, depthWrite:false`. The full `snoise` GLSL is in `Portal.dc.html` — copy it verbatim.

## Interactions & Behavior
- **Pointer tracking:** a global `mousemove` listener maps cursor to NDC into a `mouseTarget`; the render loop lerps `mouse → mouseTarget` (~0.07) for smooth trailing. Feed smoothed value to `uMouse`.
- **Focus model:** one `focusId ∈ {null,'art','dev','music'}`.
  - Desktop: `mouseenter` zone → `focusId = id` (+ React `hover` state for CSS); `mouseleave` → `focusId = active ?? null`.
  - Mobile: tap block → `active = id` and `focusId = id` (persists).
- **Color/activation easing** happens in the render loop (lerp factors above) — never snap; the smooth color drift is essential to the feel.
- **Navigation:** desktop = click anywhere in a zone `<a href>`. Mobile = tap to tune, then tap the revealed `ENTER` link. Replace the placeholder `#art` / `#dev` / `#music` hrefs with real destination URLs.
- **Resize:** on window resize, re-set renderer size and update `uResolution`; also recompute the `< 860px` layout breakpoint.
- **Cleanup:** cancel the RAF loop, remove listeners, dispose renderer on unmount.
- **Reduced motion (recommended addition):** honor `prefers-reduced-motion` by freezing `uTime` advance / lowering grain if you want; the prototype does not yet.

## State Management
- `hover: 'art'|'dev'|'music'|null` — desktop hover (drives CSS reveal + 3D focus).
- `active: 'art'|'dev'|'music'|null` — mobile selection (persistent 3D focus + ENTER reveal).
- `w: number` — viewport width, for the 860px breakpoint.
- Imperative (outside framework state, in the render loop): `mouse`, `mouseTarget`, `focusId`, three.js `renderer/scene/material/clock`, RAF handle. Keep these in refs/instance fields, **not** reactive state.

## Design Tokens
**Colors**
- Background base `#0a0a0b`; gradient darks `#05050a`-ish via shader (`vec3(0.012–0.020,…)`).
- Text: primary `#ededf0`, secondary `#cfcfd6`, muted `#a6a6ae`, dim `#85858d`, faint `#65656d` / `#55555f` / `#50505a`.
- Hairlines/borders: `#15151a`, `#18181d`, `#1a1a20`.
- Status green (ONLINE dot): `#3ad17a`.
- Neutral 3D color (idle bloom): `#9098b0`.
- **Zone accents (brand-aligned, also the Tweaks defaults):**
  - ART `#e8454c` (crimson red — from the 4K wallpaper)
  - DEV `#4ea2f2` (azure blue — Discord banner)
  - MUSIC `#d94ec6` (magenta — Telegram set)
- `::selection` background `#e8454c`, text `#0a0a0b`.

**Typography**
- Display/UI: **Space Grotesk** (400/500/700) — titles `700`.
- Mono/meta: **Space Mono** (400/700).
- Loaded from Google Fonts in the prototype; swap to the codebase's font pipeline (self-host preferred).
- Title size `clamp(44px,4.6vw,86px)` desktop / `34px` mobile. Meta `10–12px` with wide tracking (`letter-spacing 1.5–4px`), uppercase.

**Spacing** — header/footer padding `20px 30px` / `15px 30px`; zone inner padding `34px`; mobile block padding `20px 22px`.

**Motion** — primary easing `cubic-bezier(.2,.7,.2,1)`; durations `.3s–.6s`. Render-loop lerp factors: mouse `.07`, color `.06`, activate `.06`.

**Breakpoint** — `860px` (≥ desktop 3-zone, < mobile tap-to-tune).

## Tweakable parameters (expose as props/config)
`name` (default `FILAT ASTAKHOV`), `handle` (`ph1l74`), `artAccent` `#e8454c`, `devAccent` `#4ea2f2`, `musicAccent` `#d94ec6`, `intensity` (float 0.1–0.9, default 0.4).

## Assets
- **No bitmap assets required** — the background is fully procedural (GLSL). The reference brand images provided by the client (`4K-BACKGROUNDS.png`, `Discord Banner.png`, `Telegram Avatar Spring.png`, `Telegram Banner Spring.png`) are the *visual target* for the grainy mesh-gradient look and the accent palette; they are not used as textures.
- **three.js** r128 in the prototype (CDN). In production use the `three` npm package (current version) — the shader is version-agnostic; only `WebGLRenderer`/`ShaderMaterial`/`PlaneGeometry`/`IcosahedronGeometry` APIs are used. Consider `@react-three/fiber` if the codebase is React.
- **Fonts:** Space Grotesk, Space Mono.
- **Logo mark:** the `P▪HL` square is represented as a `9×9px` solid square in the header (no SVG needed). If the real PHL-ART wordmark SVG exists, drop it in there.

## Files
- `Portal.dc.html` — the full working prototype (template markup + logic class with the complete three.js setup and GLSL shaders). **Read the shader and interaction code directly from here** — it is the source of truth. Ignore the `.dc.html` wrapper conventions; port the design.
- `support.js` — the prototype runtime. **Reference only — do not port.**
