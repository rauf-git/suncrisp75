import { MapPin, ArrowRight } from 'lucide-react';
import { Property } from '@/types';
import Reveal from './Reveal';

interface PropertiesProps {
  title: string;
  subtitle: string;
  items: Property[];
  onItemClick: (item: Property) => void;
}

const Properties = ({ title, subtitle, items, onItemClick }: PropertiesProps) => {
  return (
    <section className="section-padding bg-background">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <Reveal>
          <div className="text-center mb-16">
            <h2 className="section-title mb-4">{title}</h2>
            <div className="w-24 h-1 bg-primary mx-auto mb-6 rounded-full" />
            <p className="section-subtitle mx-auto">{subtitle}</p>
          </div>
        </Reveal>

        {/* Properties Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {items.map((property, index) => (
            <Reveal key={property.id} delay={index * 100}>
              <div
                className="luxury-card group cursor-pointer"
                onClick={() => onItemClick(property)}
              >
                {/* Image */}
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={property.image}
                    alt={property.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  {/* Badge */}
                  <div className="absolute top-4 left-4 bg-primary text-primary-foreground text-xs font-sans font-semibold uppercase tracking-wider px-3 py-1 rounded">
                    {property.type}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="font-serif text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                    {property.title}
                  </h3>
                  
                  <div className="flex items-center gap-2 text-muted-foreground text-sm mb-3">
                    <MapPin className="w-4 h-4" />
                    {property.location}
                  </div>
                  
                  <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
                    {property.description}
                  </p>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <span className="text-primary font-semibold">{property.price}</span>
                    <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
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
