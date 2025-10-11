import React from "react";
import { BackgroundRippleEffect } from "@/shared/ui";
import { cn } from "@/shared/lib";

interface DevBlockProps {
  onClick: () => void;
  className?: string;
}

export const DevBlock: React.FC<DevBlockProps> = ({ onClick, className }) => {
  return (
    <div
      className={cn(
        "relative h-1/2 w-full cursor-pointer overflow-hidden bg-black transition-all hover:brightness-110",
        className
      )}
      onClick={onClick}
    >
      <BackgroundRippleEffect
        rows={10}
        cols={50}
        cellSize={40}
        className="h-full w-full"
      >
        <div className="flex items-center justify-center h-full">
          <h1 className="text-[12rem] font-bold text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.5)] transition-all hover:scale-110 select-none">
            DEV
          </h1>
        </div>
      </BackgroundRippleEffect>
    </div>
  );
};

