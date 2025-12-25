import { useRef, useCallback, useEffect } from 'react';
import { Property } from '@/types';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import Reveal from './Reveal';

interface FeaturedProjectsProps {
  items: Property[];
  onItemClick?: (item: Property) => void;
  onViewAll?: () => void;
  title?: string;
  variant?: 'scroll' | 'grid';
}

const FeaturedProjects = ({
  items,
  onItemClick,
  onViewAll,
  title = "Our Projects",
  variant = "scroll"
}: FeaturedProjectsProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const featuredItems = variant === 'scroll' ? items.slice(0, 6) : items.slice(0, 2);
  
  // Triple items for seamless infinite loop
  const loopedItems = variant === 'scroll' 
    ? [...featuredItems, ...featuredItems, ...featuredItems] 
    : featuredItems;
  
  if (featuredItems.length === 0) return null;

  // Initialize scroll to middle set
  useEffect(() => {
    if (scrollRef.current && variant === 'scroll' && featuredItems.length > 0) {
      const container = scrollRef.current;
      const itemWidth = container.scrollWidth / 3;
      container.scrollLeft = itemWidth;
    }
  }, [featuredItems.length, variant]);

  // Handle seamless loop on scroll
  const handleScroll = useCallback(() => {
    if (!scrollRef.current || variant !== 'scroll') return;
    
    const container = scrollRef.current;
    const scrollWidth = container.scrollWidth;
    const singleSetWidth = scrollWidth / 3;
    
    // Jump to middle set when reaching edges
    if (container.scrollLeft <= 10) {
      container.scrollLeft = singleSetWidth + container.scrollLeft;
    } else if (container.scrollLeft >= singleSetWidth * 2 - 10) {
      container.scrollLeft = container.scrollLeft - singleSetWidth;
    }
  }, [variant]);

  const scroll = useCallback((direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 280;
      const container = scrollRef.current;
      
      container.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  }, []);

  // Scrolling variant (compact cards)
  if (variant === 'scroll') {
    return (
      <section className="py-6 sm:py-8 md:py-10 bg-background relative overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <Reveal>
            <div className="flex items-end justify-between mb-4 sm:mb-6">
              <div>
                <h2 className="font-serif text-lg sm:text-xl md:text-2xl text-foreground leading-tight">
                  {title}
                </h2>
              </div>
              {onViewAll && (
                <button 
                  onClick={onViewAll} 
                  className="group flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-primary transition-colors min-h-[44px] px-2"
                >
                  View All
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </button>
              )}
            </div>
          </Reveal>

          {/* Horizontal scrolling container with side buttons */}
          <div className="relative">
            {/* Left scroll button */}
            <button 
              onClick={() => scroll('left')} 
              className="absolute left-0 top-1/3 -translate-y-1/2 z-10 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 backdrop-blur-md border border-primary/30 shadow-lg hover:bg-primary hover:border-primary text-primary hover:text-primary-foreground transition-all duration-300 -ml-2 sm:ml-0 group flex items-center justify-center min-w-[44px] min-h-[44px]" 
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
            </button>
            
            {/* Right scroll button */}
            <button 
              onClick={() => scroll('right')} 
              className="absolute right-0 top-1/3 -translate-y-1/2 z-10 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 backdrop-blur-md border border-primary/30 shadow-lg hover:bg-primary hover:border-primary text-primary hover:text-primary-foreground transition-all duration-300 -mr-2 sm:mr-0 group flex items-center justify-center min-w-[44px] min-h-[44px]" 
              aria-label="Scroll right"
            >
              <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
            </button>

            <div 
              ref={scrollRef} 
              onScroll={handleScroll} 
              className="overflow-x-auto pb-4 px-6 sm:px-8 scrollbar-hide scroll-smooth -mx-4 sm:mx-0"
            >
              <div className="flex gap-3 sm:gap-4" style={{ minWidth: 'max-content' }}>
                {loopedItems.map((item, index) => (
                  <Reveal key={`${item.id}-${index}`} delay={(index % featuredItems.length) * 0.1}>
                    <article 
                      className="group cursor-pointer w-56 sm:w-64 md:w-72 flex-shrink-0" 
                      onClick={() => onItemClick?.(item)}
                    >
                      <div className="relative mb-2 sm:mb-3 overflow-hidden rounded-lg">
                        <div className="aspect-[4/3] overflow-hidden bg-muted rounded-lg">
                          <img 
                            src={item.image} 
                            alt={item.title} 
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </div>
                        <div className="absolute bottom-0 left-0 w-12 h-0.5 bg-primary transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300 rounded-full" />
                      </div>

                      <div className="space-y-0.5 sm:space-y-1">
                        <span className="text-[9px] sm:text-[10px] font-medium tracking-widest text-primary uppercase">
                          {item.type || 'Project'}
                        </span>
                        <h3 className="font-serif text-sm sm:text-base text-foreground group-hover:text-primary transition-colors duration-200 line-clamp-1">
                          {item.title}
                        </h3>
                        {item.location && (
                          <p className="text-[10px] sm:text-xs text-muted-foreground line-clamp-1">
                            {item.location}
                          </p>
                        )}
                      </div>
                    </article>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Grid variant (original large cards for construction)
  return (
    <section className="py-8 sm:py-10 md:py-12 bg-background relative overflow-hidden">
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-accent/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
      
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <Reveal>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-6 md:mb-8">
            <div>
              <h2 className="font-serif text-xl sm:text-2xl md:text-3xl lg:text-4xl text-foreground leading-tight">
                {title}
              </h2>
            </div>
            {onViewAll && (
              <button 
                onClick={onViewAll} 
                className="mt-3 sm:mt-0 group flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors min-h-[44px]"
              >
                View All Projects
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            )}
          </div>
        </Reveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
          {featuredItems.map((item, index) => (
            <Reveal key={item.id} delay={index * 0.15}>
              <article 
                className="group cursor-pointer focus:outline-none" 
                onClick={() => onItemClick?.(item)}
                onTouchEnd={(e) => {
                  (e.currentTarget as HTMLElement).blur();
                }}
                tabIndex={0}
              >
                <div className="relative mb-3 sm:mb-5 overflow-hidden rounded-xl">
                  <div className="aspect-[4/3] overflow-hidden bg-muted rounded-xl">
                    <img 
                      src={item.image} 
                      alt={item.title} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </div>
                  <div className="absolute bottom-0 left-0 w-16 h-1 bg-primary transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500 rounded-full" />
                </div>

                <div className="space-y-1 sm:space-y-2">
                  <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                    <span className="text-[10px] sm:text-xs font-medium tracking-widest text-primary uppercase">
                      {item.type || 'Construction'}
                    </span>
                    {item.location && (
                      <>
                        <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                        <span className="text-[10px] sm:text-xs text-muted-foreground">
                          {item.location}
                        </span>
                      </>
                    )}
                  </div>
                  
                  <h3 className="font-serif text-base sm:text-lg md:text-xl text-foreground group-hover:text-primary transition-colors duration-300">
                    {item.title}
                  </h3>

                  <div className="flex items-center gap-2 text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                    <span>View Project</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProjects;
