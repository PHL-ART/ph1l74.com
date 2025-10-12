import { DottedGlowBackground } from "@/shared/ui";
import { cn } from "@/shared/lib";

interface DevBlockProps {
  onClick: () => void;
  className?: string;
}

export const DevBlock = ({ onClick, className }: DevBlockProps) => {
  return (
    <div
      className={cn(
        "relative h-1/2 w-full cursor-pointer overflow-hidden bg-black transition-all hover:brightness-110",
        className
      )}
      onClick={onClick}
    >
      <DottedGlowBackground
        className="absolute inset-0 z-0"
        containerClassName="h-full w-full"
        opacity={0.8}
        gap={20}
        radius={1.5}
        colorLightVar="--color-neutral-500"
        glowColorLightVar="--color-neutral-600"
        colorDarkVar="--color-neutral-500"
        glowColorDarkVar="--color-sky-800"
        backgroundOpacity={0}
        speedMin={0.3}
        speedMax={1.6}
        speedScale={1}
      >
        <h1 className="text-[12rem] font-bold text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.5)] transition-all hover:scale-110 select-none">
          DEV
        </h1>
      </DottedGlowBackground>
    </div>
  );
};

