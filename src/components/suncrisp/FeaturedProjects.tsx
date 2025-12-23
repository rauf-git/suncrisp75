import { Property } from '@/types';
import { ArrowRight } from 'lucide-react';
import Reveal from './Reveal';

interface FeaturedProjectsProps {
  items: Property[];
  onItemClick?: (item: Property) => void;
  onViewAll?: () => void;
  title?: string;
}

const FeaturedProjects = ({ items, onItemClick, onViewAll, title = "Featured Projects" }: FeaturedProjectsProps) => {
  // Show up to 6 items for scrolling
  const featuredItems = items.slice(0, 6);

  if (featuredItems.length === 0) return null;

  return (
    <section className="py-10 md:py-14 bg-background relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <Reveal>
          <div className="flex items-end justify-between mb-6">
            <div>
              <span className="text-[10px] font-medium tracking-[0.3em] text-primary uppercase mb-1 block">
                Featured Works
              </span>
              <h2 className="font-serif text-xl md:text-2xl text-foreground leading-tight">
                {title}
              </h2>
            </div>
            {onViewAll && (
              <button 
                onClick={onViewAll}
                className="group flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                View All
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            )}
          </div>
        </Reveal>

        {/* Horizontal scrolling container */}
        <div className="overflow-x-auto pb-4 -mx-6 px-6 scrollbar-hide">
          <div className="flex gap-4" style={{ minWidth: 'max-content' }}>
            {featuredItems.map((item, index) => (
              <Reveal key={item.id} delay={index * 0.1}>
                <article 
                  className="group cursor-pointer w-64 md:w-72 flex-shrink-0"
                  onClick={() => onItemClick?.(item)}
                >
                  {/* Compact Image Container */}
                  <div className="relative mb-3 overflow-hidden rounded-lg">
                    <div className="aspect-[4/3] overflow-hidden bg-muted rounded-lg">
                      <img 
                        src={item.image} 
                        alt={item.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      {/* Subtle overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                    
                    {/* Accent line */}
                    <div className="absolute bottom-0 left-0 w-12 h-0.5 bg-primary transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300 rounded-full" />
                  </div>

                  {/* Compact Content */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-medium tracking-widest text-primary uppercase">
                      {item.type || 'Project'}
                    </span>
                    
                    <h3 className="font-serif text-sm md:text-base text-foreground group-hover:text-primary transition-colors duration-200 line-clamp-1">
                      {item.title}
                    </h3>

                    {item.location && (
                      <p className="text-xs text-muted-foreground line-clamp-1">
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
    </section>
  );
};

export default FeaturedProjects;
