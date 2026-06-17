// src/widgets/desktop-zones/zone-item.tsx
import type { PortalSection, SectionId } from '@/shared/config/portal.config';

interface ZoneTranslation {
  alias: string;
  description: string;
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
        borderRight: isLast ? 'none' : '1px solid rgba(255,255,255,0.08)',
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
            fontFamily: 'var(--font-montserrat), sans-serif',
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
          {url.replace(/^https?:\/\//, '')} →
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
