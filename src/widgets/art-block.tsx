import { BackgroundGradientAnimation } from "@/shared/ui";
import { cn } from "@/shared/lib";

interface ArtBlockProps {
  onClick: () => void;
  className?: string;
}

export const ArtBlock = ({ onClick, className }: ArtBlockProps) => {
  return (
    <div
      className={cn(
        "relative h-[50vh] w-full cursor-circle overflow-hidden transition-all hover:brightness-110",
        "grayscale hover:grayscale-0 transition-all duration-500",
        "border-b border-white/20",
        "flex items-center justify-center",
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
        containerClassName="h-full w-full group"
        className="flex items-center justify-center h-full"
        blendingValue="soft-light"
        pointerColor="140, 100, 255"
        size="150%"
      >
        <h1 className="relative z-20 text-[4rem] sm:text-[6rem] md:text-[8rem] lg:text-[10rem] xl:text-[12rem] font-lato font-thin text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.5)] transition-all group-hover:scale-110 select-none px-4 sm:px-6 md:px-8 lg:px-10 xl:px-0">
          ART
        </h1>
      </BackgroundGradientAnimation>
    </div>
  );
};

