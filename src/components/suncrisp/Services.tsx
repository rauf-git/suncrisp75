import { ArrowRight } from 'lucide-react';
import { Service } from '@/types';
import Reveal from './Reveal';

interface ServicesProps {
  title: string;
  items: Service[];
  onItemClick: (item: Service) => void;
}

const Services = ({ title, items, onItemClick }: ServicesProps) => {
  return (
    <section className="section-padding bg-background">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <Reveal>
          <div className="text-center mb-16">
            <p className="text-primary font-sans text-sm uppercase tracking-[0.3em] mb-4">
              What We Do
            </p>
            <h2 className="section-title mb-4">{title}</h2>
            <div className="w-24 h-1 bg-primary mx-auto mb-6 rounded-full" />
            <p className="section-subtitle mx-auto">
              Expert craftsmanship and comprehensive solutions for every project
            </p>
          </div>
        </Reveal>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {items.map((service, index) => {
            const Icon = service.icon;
            return (
              <Reveal key={service.id} delay={index * 100}>
                <div
                  className="group p-8 bg-card border border-border rounded-2xl cursor-pointer transition-all duration-500 hover:shadow-elevated hover:border-primary/30 hover:-translate-y-1"
                  onClick={() => onItemClick(service)}
                >
                  <div className="flex items-start gap-6">
                    {/* Icon */}
                    <div className="flex-shrink-0 w-16 h-16 bg-primary-light rounded-2xl flex items-center justify-center transition-colors group-hover:bg-primary">
                      {Icon && <Icon className="w-8 h-8 text-primary group-hover:text-primary-foreground transition-colors" />}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1">
                      <h3 className="font-serif text-xl font-semibold text-foreground mb-3 group-hover:text-primary transition-colors">
                        {service.title}
                      </h3>
                      <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                        {service.description}
                      </p>
                      <span className="inline-flex items-center gap-2 text-primary text-sm font-semibold uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
                        Learn More
                        <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
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
