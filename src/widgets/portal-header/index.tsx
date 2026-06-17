// src/widgets/portal-header/index.tsx
'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import { Link } from '@/shared/i18n/routing';

interface PortalHeaderProps {
  name: string;
}

const MONO: React.CSSProperties = {
  fontFamily: 'var(--font-space-mono), monospace',
};

function FaLogo({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 500 500"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block', flexShrink: 0 }}
    >
      <rect width="500" height="500" fill="#262626" />
      <path d="M20 332H480V387H20V332Z" fill="#D73F1E" />
      <path
        d="M73.75 360V132.5H229.219V195.625H154.688V222.344H219.062V279.062H154.688V360H73.75ZM207.656 360L280.156 132.5H367.812L437.5 360H358.906L325.156 233.75C324.01 229.479 323.073 225.781 322.344 222.656C321.719 219.427 321.25 217.24 320.938 216.094H320.625C320.312 217.24 319.74 219.375 318.906 222.5C318.177 225.625 317.344 229.323 316.406 233.594L285.625 360H207.656ZM256.875 328.594L266.094 277.656H376.562L386.875 328.594H256.875Z"
        fill="white"
      />
    </svg>
  );
}

export function PortalHeader({ name }: PortalHeaderProps) {
  const locale = useLocale();
  const [logoHovered, setLogoHovered] = useState(false);

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
      {/* Left: brand with FA logo */}
      <span
        onMouseEnter={() => setLogoHovered(true)}
        onMouseLeave={() => setLogoHovered(false)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 9,
          color: '#cfcfd6',
          pointerEvents: 'auto',
          cursor: 'default',
        }}
      >
        <span
          style={{
            display: 'inline-block',
            filter: logoHovered ? 'none' : 'grayscale(1) brightness(1.4)',
            transition: 'filter .35s',
          }}
        >
          <FaLogo size={20} />
        </span>
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
