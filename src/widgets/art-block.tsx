import React from "react";
import { BackgroundGradientAnimation } from "@/shared/ui";
import { cn } from "@/shared/lib";

interface ArtBlockProps {
  onClick: () => void;
  className?: string;
}

export const ArtBlock: React.FC<ArtBlockProps> = ({ onClick, className }) => {
  return (
    <div
      className={cn(
        "relative h-1/2 w-full cursor-pointer overflow-hidden transition-all hover:brightness-110",
        className
      )}
      onClick={onClick}
    >
      <BackgroundGradientAnimation
        gradientBackgroundStart="rgb(108, 0, 162)"
        gradientBackgroundEnd="rgb(0, 17, 82)"
        firstColor="18, 113, 255"
        secondColor="221, 74, 255"
        thirdColor="100, 220, 255"
        fourthColor="200, 50, 50"
        fifthColor="180, 180, 50"
        interactive={true}
        containerClassName="h-full w-full"
        className="flex items-center justify-center h-full"
      >
        <h1 className="relative z-20 text-[12rem] font-bold text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.5)] transition-all hover:scale-110 select-none">
          ART
        </h1>
      </BackgroundGradientAnimation>
    </div>
  );
};

