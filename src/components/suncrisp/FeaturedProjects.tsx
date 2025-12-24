import { useRef } from 'react';
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
  if (featuredItems.length === 0) return null;
  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  // Scrolling variant (compact cards)
  if (variant === 'scroll') {
    return <section className="py-10 md:py-14 bg-background relative overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <Reveal>
            <div className="flex items-end justify-between mb-6">
              <div>
                
                <h2 className="font-serif text-xl md:text-2xl text-foreground leading-tight">
                  {title}
                </h2>
              </div>
              <div className="flex items-center gap-2">
                {/* Scroll buttons */}
                <button onClick={() => scroll('left')} className="p-2 rounded-full bg-muted hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors" aria-label="Scroll left">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button onClick={() => scroll('right')} className="p-2 rounded-full bg-muted hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors" aria-label="Scroll right">
                  <ChevronRight className="w-4 h-4" />
                </button>
                {onViewAll && <button onClick={onViewAll} className="ml-2 group flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-primary transition-colors">
                    View All
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </button>}
              </div>
            </div>
          </Reveal>

          {/* Horizontal scrolling container */}
          <div ref={scrollRef} className="overflow-x-auto pb-4 -mx-6 px-6 scrollbar-hide scroll-smooth">
            <div className="flex gap-4" style={{
            minWidth: 'max-content'
          }}>
              {featuredItems.map((item, index) => <Reveal key={item.id} delay={index * 0.1}>
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
      </section>;
  }

  // Grid variant (original large cards for construction)
  return <section className="py-16 md:py-20 bg-background relative overflow-hidden">
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-accent/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <Reveal>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-10 md:mb-12">
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
              <article className="group cursor-pointer" onClick={() => onItemClick?.(item)}>
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