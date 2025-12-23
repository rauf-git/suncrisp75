import { Property } from '@/types';
import { ArrowRight } from 'lucide-react';
import Reveal from './Reveal';

interface FeaturedProjectsProps {
  items: Property[];
  onItemClick?: (item: Property) => void;
  onViewAll?: () => void;
}

const FeaturedProjects = ({ items, onItemClick, onViewAll }: FeaturedProjectsProps) => {
  // Get only the first 2 items
  const featuredItems = items.slice(0, 2);

  if (featuredItems.length === 0) return null;

  return (
    <section className="py-20 md:py-28 bg-background relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-accent/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <Reveal>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12 md:mb-16">
            <div>
              <span className="text-xs font-medium tracking-[0.3em] text-primary uppercase mb-3 block">
                Latest Works
              </span>
              <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl text-foreground leading-tight">
                Featured Construction
              </h2>
            </div>
            {onViewAll && (
              <button 
                onClick={onViewAll}
                className="mt-6 md:mt-0 group flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                View All Projects
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            )}
          </div>
        </Reveal>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {featuredItems.map((item, index) => (
            <Reveal key={item.id} delay={index * 0.15}>
              <article 
                className="group cursor-pointer"
                onClick={() => onItemClick?.(item)}
              >
                {/* Image Container with classy shape */}
                <div className="relative mb-6 overflow-hidden">
                  {/* Main image with elegant clip path */}
                  <div 
                    className="aspect-[4/3] overflow-hidden bg-muted"
                    style={{
                      clipPath: index === 0 
                        ? 'polygon(0 0, 100% 0, 100% 85%, 85% 100%, 0 100%)' 
                        : 'polygon(0 0, 100% 0, 100% 100%, 15% 100%, 0 85%)'
                    }}
                  >
                    <img 
                      src={item.image} 
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    {/* Elegant overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </div>
                  
                  {/* Floating accent line */}
                  <div className="absolute bottom-0 left-0 w-16 h-1 bg-primary transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
                </div>

                {/* Content */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-medium tracking-widest text-primary uppercase">
                      {item.type || 'Construction'}
                    </span>
                    {item.location && (
                      <>
                        <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                        <span className="text-xs text-muted-foreground">
                          {item.location}
                        </span>
                      </>
                    )}
                  </div>
                  
                  <h3 className="font-serif text-xl md:text-2xl text-foreground group-hover:text-primary transition-colors duration-300">
                    {item.title}
                  </h3>
                  
                  {item.description && (
                    <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2">
                      {item.description}
                    </p>
                  )}

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
