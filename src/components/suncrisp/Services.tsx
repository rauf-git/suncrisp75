import { Service } from '@/types';
import Reveal from './Reveal';

interface ServicesProps {
  title: string;
  items: Service[];
  onItemClick?: (item: Service) => void;
}

const Services = ({ title, items, onItemClick }: ServicesProps) => {
  return (
    <section className="py-10 md:py-14 px-4 bg-secondary relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-border/50 to-transparent opacity-50 pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <Reveal>
          <div className="flex items-center gap-4 mb-10">
            <div className="w-2 h-12 bg-primary rounded-full" />
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl text-foreground">
              {title}
            </h2>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {items.map((service, index) => {
            const Icon = service.icon;
            return (
              <Reveal key={service.id} delay={index * 100}>
                <div 
                  className="group relative p-10 bg-card rounded-2xl border border-border hover:border-primary/50 transition-all duration-300 shadow-soft hover:shadow-elevated overflow-hidden cursor-pointer"
                  onClick={() => onItemClick && onItemClick(service)}
                >
                  {/* Large background icon */}
                  {Icon && (
                    <Icon className="absolute -right-6 -bottom-6 w-40 h-40 text-secondary transform group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500 ease-in-out" />
                  )}
                  
                  <div className="relative z-10">
                    <div className="w-14 h-14 rounded-xl bg-primary-light flex items-center justify-center mb-6 group-hover:bg-primary transition-colors duration-300">
                      {Icon && <Icon size={24} className="text-primary group-hover:text-primary-foreground transition-colors duration-300" />}
                    </div>
                    
                    <h3 className="text-2xl font-serif text-foreground mb-4 group-hover:text-primary transition-colors">
                      {service.title}
                    </h3>
                    
                    <p className="text-muted-foreground font-sans leading-relaxed max-w-sm">
                      {service.description}
                    </p>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Services;
