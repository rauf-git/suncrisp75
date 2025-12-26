import { useState, useEffect, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";

interface HeroImageCarouselProps {
  images: string[];
  interval?: number;
}

const HeroImageCarousel = ({
  images,
  interval = 4000
}: HeroImageCarouselProps) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, dragFree: false });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isInteracting, setIsInteracting] = useState(false);

  const scrollTo = useCallback((index: number) => {
    if (emblaApi) emblaApi.scrollTo(index);
  }, [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  // Handle pointer events to pause auto-scroll during interaction
  const onPointerDown = useCallback(() => {
    setIsInteracting(true);
  }, []);

  const onPointerUp = useCallback(() => {
    setIsInteracting(false);
  }, []);

  useEffect(() => {
    if (!emblaApi) return;
    
    emblaApi.on("select", onSelect);
    emblaApi.on("pointerDown", onPointerDown);
    emblaApi.on("pointerUp", onPointerUp);
    onSelect();

    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("pointerDown", onPointerDown);
      emblaApi.off("pointerUp", onPointerUp);
    };
  }, [emblaApi, onSelect, onPointerDown, onPointerUp]);

  // Auto-scroll logic
  useEffect(() => {
    if (!emblaApi || images.length <= 1 || isInteracting) return;

    const autoScroll = setInterval(() => {
      emblaApi.scrollNext();
    }, interval);

    return () => clearInterval(autoScroll);
  }, [emblaApi, images.length, interval, isInteracting]);

  // Log warning if no images
  if (!images || images.length === 0) {
    console.warn("[HeroImageCarousel] No images provided. heroImages[] is empty.");
    return (
      <div className="relative w-full h-full">
        <div className="absolute -inset-2 bg-gradient-to-br from-primary/20 via-transparent to-primary/10 rounded-2xl blur-sm" />
        <div className="relative aspect-[4/3] sm:aspect-[4/3] rounded-xl overflow-hidden shadow-2xl shadow-black/20 bg-muted/50 backdrop-blur-sm border border-primary/20 flex items-center justify-center">
          <span className="text-muted-foreground text-xs sm:text-sm">No images uploaded</span>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="relative w-full h-full" 
      onMouseEnter={() => setIsInteracting(true)} 
      onMouseLeave={() => setIsInteracting(false)}
    >
      {/* Decorative frame */}
      <div className="absolute -inset-2 bg-gradient-to-br from-primary/20 via-transparent to-primary/10 rounded-2xl blur-sm" />

      <div className="relative aspect-[3/4] w-full sm:aspect-[4/3] md:aspect-[4/3] rounded-xl overflow-hidden shadow-2xl shadow-black/20 bg-muted/50 backdrop-blur-sm border border-primary/20">
        <div className="overflow-hidden h-full" ref={emblaRef}>
          <div className="flex h-full touch-pan-y">
            {images.map((image, index) => (
              <div 
                key={index} 
                className="flex-[0_0_100%] min-w-0 h-full"
              >
                <img 
                  src={image} 
                  alt={`Hero image ${index + 1}`} 
                  className="w-full h-full object-cover" 
                  loading={index === 0 ? "eager" : "lazy"} 
                  draggable={false}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Image indicators */}
        {images.length > 1 && (
          <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 sm:gap-2">
            {images.map((_, index) => (
              <button 
                key={index} 
                onClick={() => scrollTo(index)} 
                className={`w-2 h-2 sm:w-2 sm:h-2 rounded-full transition-all duration-300 min-w-[8px] min-h-[8px] ${
                  index === selectedIndex 
                    ? "bg-primary w-4 sm:w-6" 
                    : "bg-background/50 hover:bg-background/80"
                }`} 
                aria-label={`Go to image ${index + 1}`} 
              />
            ))}
          </div>
        )}
      </div>

      {/* Subtle glow effect */}
      <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-3/4 h-4 bg-primary/20 blur-xl rounded-full" />
    </div>
  );
};

export default HeroImageCarousel;
