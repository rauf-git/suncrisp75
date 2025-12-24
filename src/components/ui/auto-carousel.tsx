import * as React from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface AutoCarouselProps {
  images: string[];
  alt?: string;
  className?: string;
  autoplayInterval?: number;
  showArrows?: boolean;
  showDots?: boolean;
  showCounter?: boolean;
  pauseOnHover?: boolean;
}

const AutoCarousel = ({
  images,
  alt = "Image",
  className,
  autoplayInterval = 4000,
  showArrows = true,
  showDots = true,
  showCounter = true,
  pauseOnHover = true,
}: AutoCarouselProps) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [isPaused, setIsPaused] = React.useState(false);

  const scrollPrev = React.useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    emblaApi?.scrollPrev();
  }, [emblaApi]);

  const scrollNext = React.useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    emblaApi?.scrollNext();
  }, [emblaApi]);

  const scrollTo = React.useCallback((index: number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    emblaApi?.scrollTo(index);
  }, [emblaApi]);

  const onSelect = React.useCallback(() => {
    if (!emblaApi) return;
    setCurrentIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  React.useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  // Auto-play effect
  React.useEffect(() => {
    if (!emblaApi || images.length <= 1 || isPaused) return;

    const interval = setInterval(() => {
      emblaApi.scrollNext();
    }, autoplayInterval);

    return () => clearInterval(interval);
  }, [emblaApi, images.length, autoplayInterval, isPaused]);

  if (images.length === 0) {
    return (
      <div className={cn("w-full h-full flex items-center justify-center bg-muted rounded-lg", className)}>
        <span className="text-muted-foreground text-sm">No images</span>
      </div>
    );
  }

  if (images.length === 1) {
    return (
      <div className={cn("w-full h-full overflow-hidden", className)}>
        <img
          src={images[0]}
          alt={alt}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  return (
    <div
      className={cn("relative w-full h-full group", className)}
      onMouseEnter={() => pauseOnHover && setIsPaused(true)}
      onMouseLeave={() => pauseOnHover && setIsPaused(false)}
    >
      <div ref={emblaRef} className="overflow-hidden w-full h-full">
        <div className="flex w-full h-full">
          {images.map((image, index) => (
            <div key={index} className="flex-none w-full h-full">
              <img
                src={image}
                alt={`${alt} ${index + 1}`}
                className="w-full h-full object-cover transition-transform duration-700"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Arrows */}
      {showArrows && (
        <>
          <button
            onClick={scrollPrev}
            className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-background/80 hover:bg-background flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
            aria-label="Previous image"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={scrollNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-background/80 hover:bg-background flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
            aria-label="Next image"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </>
      )}

      {/* Dot Indicators */}
      {showDots && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={(e) => scrollTo(index, e)}
              className={cn(
                "w-2 h-2 rounded-full transition-all duration-300",
                currentIndex === index
                  ? "bg-primary w-4"
                  : "bg-background/60 hover:bg-background/80"
              )}
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Counter */}
      {showCounter && (
        <div className="absolute top-3 right-3 bg-background/80 text-foreground text-xs font-medium px-2 py-1 rounded-md">
          {currentIndex + 1} / {images.length}
        </div>
      )}
    </div>
  );
};

export { AutoCarousel };
