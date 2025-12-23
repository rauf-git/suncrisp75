import { ArrowRight, Building, Crown, Star } from 'lucide-react';

interface HeroProps {
  onNavigate: (page: string) => void;
}

const Hero = ({ onNavigate }: HeroProps) => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920&h=1080&fit=crop"
          alt="Luxury modern architecture"
          className="w-full h-full object-cover animate-zoom-out"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-foreground/60 via-foreground/40 to-foreground/70" />
      </div>

      {/* Floating Elements */}
      <div className="absolute top-1/4 left-10 animate-float-slow opacity-20">
        <Building className="w-20 h-20 text-primary" />
      </div>
      <div className="absolute bottom-1/3 right-16 animate-float-medium opacity-20">
        <Crown className="w-16 h-16 text-primary" />
      </div>
      <div className="absolute top-1/2 left-1/4 animate-float-fast opacity-20">
        <Star className="w-12 h-12 text-primary" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
        <p className="text-primary font-sans text-sm md:text-base uppercase tracking-[0.3em] mb-6 animate-fade-in">
          Premier Construction & Hospitality
        </p>
        
        <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl font-bold text-primary-foreground leading-tight mb-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          Where Vision Meets
          <span className="block text-primary mt-2">Masterful Craft</span>
        </h1>
        
        <p className="text-primary-foreground/80 font-sans text-lg md:text-xl max-w-2xl mx-auto mb-12 animate-fade-in" style={{ animationDelay: '0.4s' }}>
          We design, build, and curate exceptional properties and experiences 
          for those who expect nothing less than extraordinary.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in" style={{ animationDelay: '0.6s' }}>
          <button
            onClick={() => onNavigate('portfolio')}
            className="btn-primary flex items-center justify-center gap-3 group"
          >
            View Our Work
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
          
          <button
            onClick={() => onNavigate('contact')}
            className="btn-outline border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-foreground"
          >
            Get in Touch
          </button>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-primary-foreground/50 rounded-full flex justify-center pt-2">
          <div className="w-1 h-3 bg-primary-foreground/50 rounded-full" />
        </div>
      </div>
    </section>
  );
};

export default Hero;
