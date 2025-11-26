'use client';

import { ArtBlock, DevBlock } from "@/widgets";
import { GlassEllipse } from "@/shared/ui";
import { EXTERNAL_LINKS } from "@/shared/config/constants";

export const HomePage = () => {
  const handleArtClick = () => {
    window.location.href = EXTERNAL_LINKS.ART;
  };

  const handleDevClick = () => {
    window.location.href = EXTERNAL_LINKS.DEV;
  };

  return (
    <div className="h-screen w-screen overflow-hidden relative flex flex-col">
      <ArtBlock onClick={handleArtClick} />
      <DevBlock onClick={handleDevClick} />
      <GlassEllipse />
    </div>
  );
};

