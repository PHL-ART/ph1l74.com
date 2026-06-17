// src/widgets/mobile-stack/mobile-block.tsx
import type { PortalSection, SectionId } from '@/shared/config/portal.config';

interface MobileBlockTranslation {
  alias: string;
  description: string;
  enterFull: string;
}

interface MobileBlockProps {
  section: PortalSection;
  isActive: boolean;
  translation: MobileBlockTranslation;
  onSelect: (id: SectionId) => void;
}

const GROTESK: React.CSSProperties = { fontFamily: 'var(--font-space-grotesk), sans-serif' };
const MONO: React.CSSProperties = { fontFamily: 'var(--font-space-mono), monospace' };

export function MobileBlock({ section, isActive, translation, onSelect }: MobileBlockProps) {
  const { id, url, accent } = section;

  return (
    <div
      onClick={() => onSelect(id)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        padding: '20px 22px',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        cursor: 'pointer',
        background: isActive ? 'rgba(255,255,255,0.025)' : 'transparent',
        transition: 'background .3s',
      }}
    >
      {/* Title */}
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
          fontFamily: 'var(--font-montserrat), sans-serif',
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
