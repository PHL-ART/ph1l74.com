// src/widgets/portal-header/index.tsx
'use client';

import { useLocale } from 'next-intl';
import { Link } from '@/shared/i18n/routing';

interface PortalHeaderProps {
  name: string;
}

const MONO: React.CSSProperties = {
  fontFamily: 'var(--font-space-mono), monospace',
};

export function PortalHeader({ name }: PortalHeaderProps) {
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
        borderBottom: '1px solid rgba(255,255,255,0.08)',
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

      {/* Right: lang switcher */}
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
    </div>
  );
}
