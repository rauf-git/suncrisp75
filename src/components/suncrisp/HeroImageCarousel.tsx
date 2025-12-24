import { useState, useEffect } from 'react';

interface HeroImageCarouselProps {
  images: string[];
  interval?: number;
}

const HeroImageCarousel = ({ images, interval = 4000 }: HeroImageCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, interval);

    return () => clearInterval(timer);
  }, [images.length, interval]);

  if (!images || images.length === 0) {
    return (
      <div className="relative w-full">
        <div className="relative h-[50vh] md:h-[60vh] lg:h-[70vh] overflow-hidden bg-muted/30 flex items-center justify-center">
          <span className="text-muted-foreground text-sm">No images</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full">
      <div className="relative h-[50vh] md:h-[60vh] lg:h-[70vh] overflow-hidden shadow-xl">
        {images.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentIndex ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img
              src={image}
              alt={`Hero image ${index + 1}`}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
        
        {/* Image indicators */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex 
                    ? 'bg-primary w-6' 
                    : 'bg-background/50 hover:bg-background/80'
                }`}
                aria-label={`Go to image ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HeroImageCarousel;
