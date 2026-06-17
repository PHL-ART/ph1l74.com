// src/widgets/desktop-zones/index.tsx
import type { SectionId, PortalSection } from '@/shared/config/portal.config';
import { ZoneItem } from './zone-item';

interface ZoneTranslation {
  alias: string;
  description: string;
}

interface DesktopZonesProps {
  sections: readonly PortalSection[];
  hover: SectionId | null;
  translations: Record<SectionId, ZoneTranslation>;
  onHover: (id: SectionId) => void;
  onLeave: () => void;
}

export function DesktopZones({ sections, hover, translations, onHover, onLeave }: DesktopZonesProps) {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        zIndex: 4,
      }}
    >
      {sections.map((section, i) => (
        <ZoneItem
          key={section.id}
          section={section}
          index={i}
          isLast={i === sections.length - 1}
          isHovered={hover === section.id}
          otherHovered={hover !== null && hover !== section.id}
          translation={translations[section.id]}
          onMouseEnter={onHover}
          onMouseLeave={onLeave}
        />
      ))}
    </div>
  );
}
