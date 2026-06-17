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
