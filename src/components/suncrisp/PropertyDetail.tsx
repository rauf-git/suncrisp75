import { ArrowLeft, MapPin, Check } from 'lucide-react';
import { Property } from '@/types';

interface PropertyDetailProps {
  item: Property;
  onBack: () => void;
}

const PropertyDetail = ({ item, onBack }: PropertyDetailProps) => {
  return (
    <section className="min-h-screen bg-background">
      {/* Hero Image */}
      <div className="relative h-[60vh] overflow-hidden">
        <img
          src={item.image}
          alt={item.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
        
        {/* Back Button */}
        <button
          onClick={onBack}
          className="absolute top-24 left-6 md:left-12 flex items-center gap-2 text-primary-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-sans text-sm uppercase tracking-wider">Back</span>
        </button>
        
        {/* Title Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12">
          <div className="max-w-7xl mx-auto">
            <span className="inline-block bg-primary text-primary-foreground text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded mb-4">
              {item.type}
            </span>
            <h1 className="font-serif text-3xl md:text-5xl font-bold text-primary-foreground mb-4">
              {item.title}
            </h1>
            <div className="flex items-center gap-2 text-primary-foreground/80">
              <MapPin className="w-5 h-5" />
              <span>{item.location}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="section-padding">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <h2 className="font-serif text-2xl font-semibold mb-6">About This Property</h2>
              <p className="text-muted-foreground leading-relaxed mb-8">
                {item.description}
              </p>
              <p className="text-muted-foreground leading-relaxed">
                This exceptional property exemplifies the Suncrisp commitment to excellence, 
                combining masterful architecture with uncompromising attention to detail. 
                Every element has been carefully considered to create a living experience 
                that transcends the ordinary.
              </p>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-secondary p-8 rounded-lg sticky top-24">
                <p className="text-primary font-serif text-3xl font-bold mb-6">{item.price}</p>
                
                <h3 className="font-serif text-lg font-semibold mb-4">Features</h3>
                <ul className="space-y-3 mb-8">
                  {item.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-3 text-muted-foreground">
                      <Check className="w-5 h-5 text-primary flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <button className="btn-primary w-full">
                  Schedule a Viewing
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PropertyDetail;
