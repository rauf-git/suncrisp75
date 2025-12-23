import { ArrowRight } from 'lucide-react';
import { Experience } from '@/types';

interface ExperiencesProps {
  items: Experience[];
  onItemClick: (item: Experience) => void;
}

const Experiences = ({ items, onItemClick }: ExperiencesProps) => {
  return (
    <section className="section-padding bg-secondary">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in">
          <p className="text-primary font-sans text-sm uppercase tracking-[0.3em] mb-4">
            Curated Stays
          </p>
          <h2 className="section-title mb-4">Hospitality Experiences</h2>
          <p className="section-subtitle mx-auto">
            Discover our collection of world-class retreats and destinations
          </p>
        </div>

        {/* Experiences Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {items.map((experience, index) => {
            const Icon = experience.icon;
            return (
              <div
                key={experience.id}
                className="group cursor-pointer animate-fade-in"
                style={{ animationDelay: `${index * 0.15}s` }}
                onClick={() => onItemClick(experience)}
              >
                {/* Image Card */}
                <div className="relative h-96 rounded-lg overflow-hidden mb-6">
                  <img
                    src={experience.image}
                    alt={experience.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />
                  
                  {/* Icon Badge */}
                  <div className="absolute top-6 left-6 w-12 h-12 bg-primary/90 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <Icon className="w-6 h-6 text-primary-foreground" />
                  </div>
                  
                  {/* Content Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h3 className="font-serif text-2xl font-semibold text-primary-foreground mb-2">
                      {experience.title}
                    </h3>
                    <p className="text-primary-foreground/80 text-sm line-clamp-2 mb-4">
                      {experience.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-primary font-semibold text-sm">
                        {experience.priceStart}
                      </span>
                      <span className="flex items-center gap-2 text-primary-foreground text-sm font-semibold uppercase tracking-wider group-hover:text-primary transition-colors">
                        Explore
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Experiences;
