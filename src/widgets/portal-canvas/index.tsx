// src/widgets/portal-canvas/index.tsx
'use client';

import { forwardRef, useImperativeHandle, useRef } from 'react';
import { usePortalShader } from './use-portal-shader';
import { PORTAL_CONFIG } from '@/shared/config/portal.config';
import type { SectionId } from '@/shared/config/portal.config';

export interface PortalCanvasHandle {
  setFocus: (id: SectionId | null) => void;
}

const PortalCanvas = forwardRef<PortalCanvasHandle>(function PortalCanvas(_props, ref) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const { setFocus } = usePortalShader(canvasRef, {
    sections: PORTAL_CONFIG.sections,
    intensity: PORTAL_CONFIG.intensity,
    neutralColor: PORTAL_CONFIG.neutralColor,
  });

  useImperativeHandle(ref, () => ({ setFocus }), [setFocus]);

  return (
    <>
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          display: 'block',
          zIndex: 1,
          pointerEvents: 'none',
        }}
      />
      {/* Radial vignette overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 2,
          background:
            'radial-gradient(120% 95% at 50% 44%, transparent 42%, rgba(10,10,11,0.55) 100%)',
        }}
      />
    </>
  );
});

export default PortalCanvas;
