import { useRef, useEffect, useCallback } from 'react';
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
  
  // Create duplicated items for infinite scroll effect
  const infiniteItems = variant === 'scroll' 
    ? [...featuredItems, ...featuredItems, ...featuredItems] 
    : featuredItems;
  
  if (featuredItems.length === 0) return null;

  // Initialize scroll position to middle set for infinite loop
  useEffect(() => {
    if (scrollRef.current && variant === 'scroll') {
      const itemWidth = 280; // approximate card width + gap
      scrollRef.current.scrollLeft = featuredItems.length * itemWidth;
    }
  }, [featuredItems.length, variant]);

  // Auto-scroll effect for continuous scrolling
  useEffect(() => {
    if (variant !== 'scroll' || !scrollRef.current) return;
    
    const container = scrollRef.current;
    const itemWidth = 280;
    const singleSetWidth = featuredItems.length * itemWidth;
    let animationId: number;
    let isPaused = false;
    
    const autoScroll = () => {
      if (!isPaused && container) {
        container.scrollLeft += 1;
        
        // Reset to middle when we've scrolled through one set
        if (container.scrollLeft >= singleSetWidth * 2) {
          container.scrollLeft = singleSetWidth;
        }
      }
      animationId = requestAnimationFrame(autoScroll);
    };
    
    animationId = requestAnimationFrame(autoScroll);
    
    const handleMouseEnter = () => { isPaused = true; };
    const handleMouseLeave = () => { isPaused = false; };
    
    container.addEventListener('mouseenter', handleMouseEnter);
    container.addEventListener('mouseleave', handleMouseLeave);
    container.addEventListener('touchstart', handleMouseEnter);
    container.addEventListener('touchend', handleMouseLeave);
    
    return () => {
      cancelAnimationFrame(animationId);
      container.removeEventListener('mouseenter', handleMouseEnter);
      container.removeEventListener('mouseleave', handleMouseLeave);
      container.removeEventListener('touchstart', handleMouseEnter);
      container.removeEventListener('touchend', handleMouseLeave);
    };
  }, [variant, featuredItems.length]);

  const scroll = useCallback((direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      const container = scrollRef.current;
      const itemWidth = 280;
      const singleSetWidth = featuredItems.length * itemWidth;
      
      container.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });

      // Handle infinite loop - check after scroll completes
      setTimeout(() => {
        if (container.scrollLeft <= itemWidth) {
          container.scrollLeft = singleSetWidth + container.scrollLeft;
        } else if (container.scrollLeft >= singleSetWidth * 2) {
          container.scrollLeft = container.scrollLeft - singleSetWidth;
        }
      }, 350);
    }
  }, [featuredItems.length]);

  // Scrolling variant (compact cards)
  if (variant === 'scroll') {
    return <section className="py-8 md:py-10 bg-background relative overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <Reveal>
            <div className="flex items-end justify-between mb-6">
              <div>
                <h2 className="font-serif text-xl md:text-2xl text-foreground leading-tight">
                  {title}
                </h2>
              </div>
              {onViewAll && <button onClick={onViewAll} className="group flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-primary transition-colors">
                  View All
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </button>}
            </div>
          </Reveal>

          {/* Horizontal scrolling container with side buttons */}
          <div className="relative">
            {/* Left scroll button - Futuristic */}
            <button 
              onClick={() => scroll('left')} 
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 backdrop-blur-md border border-primary/30 shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)] hover:shadow-[0_0_30px_rgba(var(--primary-rgb),0.5)] hover:bg-primary hover:border-primary text-primary hover:text-primary-foreground transition-all duration-300 -ml-4 md:ml-0 group flex items-center justify-center" 
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
              <span className="absolute inset-0 rounded-full bg-primary/10 animate-ping opacity-0 group-hover:opacity-75" />
            </button>
            
            {/* Right scroll button - Futuristic */}
            <button 
              onClick={() => scroll('right')} 
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 backdrop-blur-md border border-primary/30 shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)] hover:shadow-[0_0_30px_rgba(var(--primary-rgb),0.5)] hover:bg-primary hover:border-primary text-primary hover:text-primary-foreground transition-all duration-300 -mr-4 md:mr-0 group flex items-center justify-center" 
              aria-label="Scroll right"
            >
              <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
              <span className="absolute inset-0 rounded-full bg-primary/10 animate-ping opacity-0 group-hover:opacity-75" />
            </button>

            <div ref={scrollRef} className="overflow-x-auto pb-4 px-8 scrollbar-hide scroll-smooth">
              <div className="flex gap-4" style={{ minWidth: 'max-content' }}>
                {infiniteItems.map((item, index) => <Reveal key={`${item.id}-${index}`} delay={(index % featuredItems.length) * 0.1}>
                    <article className="group cursor-pointer w-64 md:w-72 flex-shrink-0" onClick={() => onItemClick?.(item)}>
                      <div className="relative mb-3 overflow-hidden rounded-lg">
                        <div className="aspect-[4/3] overflow-hidden bg-muted rounded-lg">
                          <img src={item.image} alt={item.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                          <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </div>
                        <div className="absolute bottom-0 left-0 w-12 h-0.5 bg-primary transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300 rounded-full" />
                      </div>

                      <div className="space-y-1">
                        <span className="text-[10px] font-medium tracking-widest text-primary uppercase">
                          {item.type || 'Project'}
                        </span>
                        <h3 className="font-serif text-sm md:text-base text-foreground group-hover:text-primary transition-colors duration-200 line-clamp-1">
                          {item.title}
                        </h3>
                        {item.location && <p className="text-xs text-muted-foreground line-clamp-1">
                            {item.location}
                          </p>}
                      </div>
                    </article>
                  </Reveal>)}
              </div>
            </div>
          </div>
        </div>
      </section>;
  }

  // Grid variant (original large cards for construction)
  return <section className="py-10 md:py-12 bg-background relative overflow-hidden">
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-accent/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
      
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <Reveal>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-6 md:mb-8">
            <div>
              
              <h2 className="font-serif text-2xl md:text-3xl lg:text-4xl text-foreground leading-tight">
                {title}
              </h2>
            </div>
            {onViewAll && <button onClick={onViewAll} className="mt-4 md:mt-0 group flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                View All Projects
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>}
          </div>
        </Reveal>

        <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
          {featuredItems.map((item, index) => <Reveal key={item.id} delay={index * 0.15}>
              <article 
                className="group cursor-pointer outline-none focus:outline-none focus-visible:outline-none" 
                onClick={() => onItemClick?.(item)}
                tabIndex={-1}
              >
                <div className="relative mb-5 overflow-hidden rounded-xl">
                  <div className="aspect-[4/3] overflow-hidden bg-muted rounded-xl">
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </div>
                  <div className="absolute bottom-0 left-0 w-16 h-1 bg-primary transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500 rounded-full" />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-medium tracking-widest text-primary uppercase">
                      {item.type || 'Construction'}
                    </span>
                    {item.location && <>
                        <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                        <span className="text-xs text-muted-foreground">
                          {item.location}
                        </span>
                      </>}
                  </div>
                  
                  <h3 className="font-serif text-lg md:text-xl text-foreground group-hover:text-primary transition-colors duration-300">
                    {item.title}
                  </h3>

                  <div className="flex items-center gap-2 text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                    <span>View Project</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </article>
            </Reveal>)}
        </div>
      </div>
    </section>;
};
export default FeaturedProjects;