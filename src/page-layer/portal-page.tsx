// src/page-layer/portal-page.tsx
'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';
import { PORTAL_CONFIG } from '@/shared/config/portal.config';
import type { SectionId } from '@/shared/config/portal.config';
import { PortalHeader } from '@/widgets/portal-header';
import { PortalFooter } from '@/widgets/portal-footer';
import { DesktopZones } from '@/widgets/desktop-zones';
import { MobileStack } from '@/widgets/mobile-stack';
import type { PortalCanvasHandle } from '@/widgets/portal-canvas';

const PortalCanvas = dynamic(() => import('@/widgets/portal-canvas'), { ssr: false });

const BREAKPOINT = 860;

export function PortalPage() {
  const t = useTranslations();

  const [hover, setHover] = useState<SectionId | null>(null);
  const [active, setActive] = useState<SectionId | null>(null);
  const [isDesktop, setIsDesktop] = useState(
    typeof window !== 'undefined' ? window.innerWidth >= BREAKPOINT : true,
  );

  const canvasRef = useRef<PortalCanvasHandle>(null);

  const onHover = useCallback((id: SectionId) => {
    setHover(id);
    canvasRef.current?.setFocus(id);
  }, []);

  const onLeave = useCallback(() => {
    setHover(null);
    canvasRef.current?.setFocus(active);
  }, [active]);

  const onSelect = useCallback((id: SectionId) => {
    setActive(id);
    canvasRef.current?.setFocus(id);
  }, []);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= BREAKPOINT);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const sectionTranslations = {
    art:   { alias: t('sections.art.alias'),   description: t('sections.art.description'),   enter: t('sections.art.enter'),   enterFull: t('sections.art.enterFull') },
    dev:   { alias: t('sections.dev.alias'),   description: t('sections.dev.description'),   enter: t('sections.dev.enter'),   enterFull: t('sections.dev.enterFull') },
    music: { alias: t('sections.music.alias'), description: t('sections.music.description'), enter: t('sections.music.enter'), enterFull: t('sections.music.enterFull') },
  } as const;

  const cur = hover ?? active;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        overflow: 'hidden',
        background: '#0a0a0b',
        fontFamily: 'var(--font-space-grotesk), sans-serif',
        color: '#ededf0',
      }}
    >
      <PortalCanvas ref={canvasRef as React.Ref<PortalCanvasHandle>} />

      <PortalHeader
        name={PORTAL_CONFIG.name}
        handle={PORTAL_CONFIG.handle}
        year={PORTAL_CONFIG.year}
        statusLabel={t('header.status')}
      />

      {/* Hint text — fades when anything is focused */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: isDesktop ? 112 : 'auto',
          bottom: isDesktop ? 'auto' : 236,
          textAlign: 'center',
          fontFamily: 'var(--font-space-mono), monospace',
          fontSize: 11,
          letterSpacing: '4px',
          color: '#5a5a64',
          textTransform: 'uppercase',
          opacity: cur ? 0 : 0.7,
          transition: 'opacity .5s',
          pointerEvents: 'none',
          zIndex: 5,
        }}
      >
        {isDesktop ? t('hint.desktop') : t('hint.mobile')}
      </div>

      {isDesktop ? (
        <DesktopZones
          sections={PORTAL_CONFIG.sections}
          hover={hover}
          translations={sectionTranslations}
          onHover={onHover}
          onLeave={onLeave}
        />
      ) : (
        <MobileStack
          sections={PORTAL_CONFIG.sections}
          active={active}
          translations={sectionTranslations}
          onSelect={onSelect}
        />
      )}

      <PortalFooter
        hover={hover}
        active={active}
        sections={PORTAL_CONFIG.sections}
        idleLabel={t('footer.idle')}
        interactiveLabel={t('footer.interactive')}
      />
    </div>
  );
}
