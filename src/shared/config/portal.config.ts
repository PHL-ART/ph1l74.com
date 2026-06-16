export type SectionId = 'art' | 'dev' | 'music';

export interface PortalSection {
  id: SectionId;
  url: string;
  accent: string; // hex color
}

export const PORTAL_CONFIG = {
  name: 'FILAT ASTAKHOV',
  handle: 'ph1l74',
  year: '2026',
  intensity: 0.4,
  neutralColor: '#9098b0',
  sections: [
    { id: 'art' as const, url: 'https://art.ph1l74.com', accent: '#e8454c' },
    { id: 'dev' as const, url: 'https://dev.ph1l74.com', accent: '#4ea2f2' },
    { id: 'music' as const, url: 'https://music.ph1l74.com', accent: '#d94ec6' },
  ] satisfies PortalSection[],
} as const;
