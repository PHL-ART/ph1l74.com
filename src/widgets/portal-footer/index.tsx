// src/widgets/portal-footer/index.tsx
import type { SectionId, PortalSection } from '@/shared/config/portal.config';

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
