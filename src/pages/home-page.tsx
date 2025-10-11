import React from "react";
import { ArtBlock, DevBlock } from "@/widgets";
import { EXTERNAL_LINKS } from "@/shared/config/constants";

export const HomePage: React.FC = () => {
  const handleArtClick = () => {
    window.location.href = EXTERNAL_LINKS.ART;
  };

  const handleDevClick = () => {
    window.location.href = EXTERNAL_LINKS.DEV;
  };

  return (
    <div className="h-screen w-screen overflow-hidden">
      <ArtBlock onClick={handleArtClick} />
      <DevBlock onClick={handleDevClick} />
    </div>
  );
};

