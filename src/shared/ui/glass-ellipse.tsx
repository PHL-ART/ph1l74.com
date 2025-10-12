'use client';

import { cn } from "@/shared/lib";

interface GlassEllipseProps {
  className?: string;
}

export const GlassEllipse = ({ className }: GlassEllipseProps) => {
  return (
    <div
      className={cn(
        "absolute left-1/2 top-1/2 z-50 flex h-16 w-80 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full",
        "bg-white/10 backdrop-blur-md border-1 border-white",
        "shadow-2xl shadow-black/20",
        className
      )}
    >
      <span className="font-montserrat text-lg font-medium text-white/90 drop-shadow-lg">
        ph1l74.com
      </span>
    </div>
  );
};
