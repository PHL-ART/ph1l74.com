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

      {/* Gradient scrim + blocks, padded so content clears the fixed footer */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          background: 'linear-gradient(to top, rgba(10,10,11,0.95) 60%, rgba(10,10,11,0))',
          paddingBottom: 52, // clears fixed footer (~40px) + gap
        }}
      >
        {sections.map((section) => (
          <MobileBlock
            key={section.id}
            section={section}
            isActive={active === section.id}
            translation={translations[section.id]}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  );
}
