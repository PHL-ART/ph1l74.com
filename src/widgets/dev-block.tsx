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
        "relative h-[50vh] w-full cursor-square overflow-hidden bg-black transition-all hover:brightness-110",
        "grayscale hover:grayscale-0 transition-all duration-500",
        "border-t border-white/20",
        "flex items-center justify-center",
        className
      )}
      onClick={onClick}
    >
      <DottedGlowBackground
        className="absolute inset-0 z-0"
        containerClassName="h-full w-full group"
        opacity={0.8}
        gap={20}
        radius={5}
        colorLightVar="--color-neutral-500"
        glowColorLightVar="--color-neutral-600"
        colorDarkVar="--color-neutral-500"
        glowColorDarkVar="--color-sky-800"
        backgroundOpacity={0}
        speedMin={0.3}
        speedMax={1.6}
        speedScale={1}
      >
        <h1 className="text-[4rem] sm:text-[6rem] md:text-[8rem] lg:text-[10rem] xl:text-[12rem] font-bbh-sans-bartle font-normal text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.5)] transition-all group-hover:scale-110 select-none px-4 sm:px-6 md:px-8 lg:px-10 xl:px-0">
          DEV
        </h1>
      </DottedGlowBackground>
    </div>
  );
};

