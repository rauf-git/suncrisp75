import { Property } from '@/types';
import { MapPin, Maximize2, ArrowRight } from 'lucide-react';
import Reveal from './Reveal';

interface PropertiesProps {
  title: string;
  subtitle: string;
  items: Property[];
  onItemClick?: (item: Property) => void;
}

const Properties = ({ title, subtitle, items, onItemClick }: PropertiesProps) => {
  if (items.length === 0) {
    return (
      <section className="py-8 md:py-12 px-4 bg-secondary relative">
        <div className="max-w-7xl mx-auto">
          <Reveal>
            <div className="flex flex-col md:flex-row justify-between items-end mb-12 border-b border-border pb-6">
              <div>
                <h2 className="font-serif text-3xl md:text-4xl text-foreground mb-2">{title}</h2>
                <p className="text-muted-foreground font-sans text-base">{subtitle}</p>
              </div>
            </div>
          </Reveal>
          <div className="text-center py-20">
            <p className="text-muted-foreground">No items available yet. Check back soon!</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-8 md:py-12 px-4 bg-secondary relative">
      <div className="max-w-7xl mx-auto">
        <Reveal>
          <div className="flex flex-col md:flex-row justify-between items-end mb-8 border-b border-border pb-4">
            <div>
              <h2 className="font-serif text-3xl md:text-4xl text-foreground mb-2">{title}</h2>
              <p className="text-muted-foreground font-sans text-base">{subtitle}</p>
            </div>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {items.map((property, index) => (
            <Reveal key={property.id} delay={index * 100}>
              <div 
                className="group bg-card rounded-xl overflow-hidden shadow-soft hover:shadow-elevated transition-all duration-300 cursor-pointer border border-border hover:border-primary/30"
                onClick={() => onItemClick && onItemClick(property)}
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img 
                    src={property.image} 
                    alt={property.title} 
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-card/90 backdrop-blur text-foreground text-xs font-bold px-3 py-1.5 rounded-md uppercase tracking-wider shadow-sm">
                      {property.type}
                    </span>
                  </div>
                  
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-primary/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <div className="text-primary-foreground flex items-center gap-2 font-bold uppercase tracking-widest">
                      <Maximize2 size={18} /> View Details
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  <h3 className="font-serif text-xl text-foreground mb-2 group-hover:text-primary transition-colors">
                    {property.title}
                  </h3>
                  {property.location && (
                    <div className="flex items-center gap-2 text-muted-foreground text-sm mb-4">
                      <MapPin className="w-4 h-4 text-primary" />
                      {property.location}
                    </div>
                  )}
                  <div className="pt-4 border-t border-border flex justify-end items-center">
                    <ArrowRight className="w-4 h-4 text-primary transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Properties;