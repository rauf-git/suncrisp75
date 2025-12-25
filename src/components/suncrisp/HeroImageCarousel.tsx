import { useState, useEffect, useCallback } from "react";
interface HeroImageCarouselProps {
  images: string[];
  interval?: number;
}
const HeroImageCarousel = ({
  images,
  interval = 4000
}: HeroImageCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const nextSlide = useCallback(() => {
    setCurrentIndex(prev => (prev + 1) % images.length);
  }, [images.length]);
  useEffect(() => {
    if (images.length <= 1 || isPaused) return;
    const timer = setInterval(nextSlide, interval);
    return () => clearInterval(timer);
  }, [images.length, interval, nextSlide]);

  // Log warning if no images
  if (!images || images.length === 0) {
    console.warn("[HeroImageCarousel] No images provided. heroImages[] is empty.");
    return (
      <div className="relative w-full">
        <div className="absolute -inset-2 bg-gradient-to-br from-primary/20 via-transparent to-primary/10 rounded-3xl blur-sm" />
        <div className="relative aspect-[3/4] sm:aspect-[4/5] md:aspect-[5/7] lg:aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl shadow-black/20 bg-muted/50 backdrop-blur-sm border border-primary/20 flex items-center justify-center">
          <span className="text-muted-foreground text-sm">No images uploaded</span>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="relative w-full" 
      onMouseEnter={() => setIsPaused(true)} 
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Decorative frame */}
      <div className="absolute -inset-2 bg-gradient-to-br from-primary/20 via-transparent to-primary/10 rounded-3xl blur-sm" />

      <div className="relative aspect-[3/4] sm:aspect-[4/5] md:aspect-[5/7] lg:aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl shadow-black/20 bg-muted/50 backdrop-blur-sm border border-primary/20">
        {images.map((image, index) => (
          <div 
            key={index} 
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentIndex ? "opacity-100" : "opacity-0"
            }`}
          >
            <img 
              src={image} 
              alt={`Hero image ${index + 1}`} 
              className="absolute inset-0 w-full h-full object-cover" 
              loading={index === 0 ? "eager" : "lazy"} 
            />
          </div>
        ))}

        {/* Image indicators */}
        {images.length > 1 && (
          <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 flex gap-2 sm:gap-3">
            {images.map((_, index) => (
              <button 
                key={index} 
                onClick={() => setCurrentIndex(index)} 
                className={`h-2 sm:h-2.5 rounded-full transition-all duration-300 ${
                  index === currentIndex 
                    ? "bg-primary w-6 sm:w-8" 
                    : "w-2 sm:w-2.5 bg-background/50 hover:bg-background/80"
                }`} 
                aria-label={`Go to image ${index + 1}`} 
              />
            ))}
          </div>
        )}
      </div>

      {/* Responsive glow effect */}
      <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-[80%] max-w-[400px] h-6 sm:h-8 bg-primary/20 blur-xl rounded-full" />
    </div>
  );
};

export default HeroImageCarousel;