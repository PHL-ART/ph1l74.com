// src/app/[locale]/opengraph-image.tsx
import { ImageResponse } from 'next/og';
import { getTranslations } from 'next-intl/server';
import { PORTAL_CONFIG } from '@/shared/config/portal.config';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });

  // Fetch Space Grotesk Bold for the OG image
  let fontData: ArrayBuffer | null = null;
  try {
    const css = await fetch(
      'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@700&display=swap',
      { headers: { 'User-Agent': 'Mozilla/5.0' } },
    ).then((r) => r.text());
    const matches = [...css.matchAll(/src: url\((.+?)\)/g)];
    const url = matches[matches.length - 1]?.[1];
    if (url) fontData = await fetch(url).then((r) => r.arrayBuffer());
  } catch {
    // font load failure is non-fatal
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
        ? [{ name: 'Space Grotesk', data: fontData, weight: 700, style: 'normal' as const }]
        : [],
    },
  );
}
