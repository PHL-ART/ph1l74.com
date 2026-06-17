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

// Caps internal shader resolution to ~1.2MP regardless of screen size.
// At 4K (3840×2160) native DPR 2 → 33M fragments; this cap → ~1.2M (~28× less).
function getAdaptiveDpr(canvas: HTMLCanvasElement): number {
  const screenPixels = Math.max(canvas.clientWidth * canvas.clientHeight, 1);
  const adaptiveDpr = Math.sqrt(1_200_000 / screenPixels);
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

    // 3 snoise calls instead of 4: n1+n2 sampled at p, reused for both warp and color.
    // n3 gives one high-quality sample at the warped position for the main gradient.
    float n1 = snoise(vec3(p * 1.1, t));
    float n2 = snoise(vec3(p * 1.7 + 7.0, t * 1.1));
    float warpAmt = 0.10 + uIntensity * 0.28;
    vec2 q = p + vec2(n1, n2 * 0.7) * warpAmt;

    vec2 m = uMouse * 0.5 + 0.5; m.x *= aspect;
    float dm = distance(q, m);
    float wave = sin(dm * 20.0 - uTime * 2.2) * exp(-dm * 3.0);

    float n3 = snoise(vec3(q * 0.85, t));
    vec3 base = vec3(0.020, 0.020, 0.026);
    base = mix(base, vec3(0.072, 0.074, 0.090), smoothstep(-0.5, 0.7, n3));
    base = mix(base, vec3(0.012, 0.012, 0.017), smoothstep(0.1, 0.95, n2));

    vec3 wash = mix(uColA, uColC, smoothstep(-0.55, 0.6, n3));
    wash = mix(wash, uColB, smoothstep(0.05, 0.9, n2));
    base += wash * 0.06;
    base += wave * 0.02;

    float bloom = exp(-dm * dm * 1.5);
    float band  = smoothstep(0.34, 0.0, abs(n3 * 0.5 - (uv.y - 0.5)));
    float acc = bloom * (0.34 + uActivate * 0.85) + wave * 0.55 * bloom + band * 0.09 * (0.3 + uActivate);
    vec3 col = base + uColor * acc;

    float vig = smoothstep(1.3, 0.3, distance(uv, vec2(0.5)));
    col *= 0.5 + 0.5 * vig;

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
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const artSection = config.sections[0];
    const devSection = config.sections[1];
    const musicSection = config.sections[2];

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
    const geo = new THREE.PlaneGeometry(2, 2);
    scene.add(new THREE.Mesh(geo, mat));

    const resize = () => {
      const w = canvas.clientWidth || window.innerWidth;
      const h = canvas.clientHeight || window.innerHeight;
      renderer.setPixelRatio(getAdaptiveDpr(canvas));
      renderer.setSize(w, h, false);
      const dpr = renderer.getPixelRatio();
      mat.uniforms.uResolution.value.set(w * dpr, h * dpr);
    };
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

    // 30fps cap: lerp factors doubled vs 60fps so perceived speed stays identical.
    const FRAME_MS = 1000 / 30;
    let lastFrameTime = 0;

    const tick = (now: number) => {
      rafRef.current = requestAnimationFrame(tick);
      if (now - lastFrameTime < FRAME_MS) return;
      lastFrameTime = now;

      const focusId = focusIdRef.current;
      const target = focusId ? colors[focusId] : colors.neutral;
      curColorRef.current.lerp(target, 0.12);
      mat.uniforms.uColor.value.copy(curColorRef.current);

      const actTarget = focusId ? 1 : 0;
      mat.uniforms.uActivate.value += (actTarget - mat.uniforms.uActivate.value) * 0.12;

      const m = mouseRef.current;
      const mt = mouseTargetRef.current;
      m.x += (mt.x - m.x) * 0.14;
      m.y += (mt.y - m.y) * 0.14;
      mat.uniforms.uMouse.value.set(m.x, m.y);
      mat.uniforms.uTime.value = clock.getElapsedTime();

      renderer.render(scene, camera);
    };
    rafRef.current = requestAnimationFrame(tick);

    const onVisibilityChange = () => {
      if (document.hidden) {
        cancelAnimationFrame(rafRef.current);
      } else {
        lastFrameTime = 0;
        rafRef.current = requestAnimationFrame(tick);
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      mat.dispose();
      geo.dispose();
      renderer.dispose();
      rendererRef.current = null;
      matRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally empty — Three.js objects are fully imperative

  return { setFocus };
}
