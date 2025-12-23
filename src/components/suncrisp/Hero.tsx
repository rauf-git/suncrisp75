import { Key, Building, GlassWater, Plane, HardHat } from 'lucide-react';
import Reveal from './Reveal';

interface HeroProps {
  onNavigate?: (page: string) => void;
}

const Hero = ({ onNavigate }: HeroProps) => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background">
      {/* Background Subtle Gradient */}
      <div className="absolute top-0 right-0 w-[50vw] h-[50vw] bg-primary-light rounded-full blur-[120px] opacity-50 -translate-y-1/2 translate-x-1/4 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[40vw] h-[40vw] bg-secondary rounded-full blur-[100px] opacity-50 translate-y-1/3 -translate-x-1/4 pointer-events-none" />

      {/* Parallax Floating Icons */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <HardHat className="absolute top-[20%] left-[10%] w-12 h-12 text-primary animate-float-slow" />
        <Building className="absolute top-[15%] right-[15%] w-16 h-16 text-muted-foreground/30 animate-float-medium" />
        <GlassWater className="absolute bottom-[20%] left-[20%] w-10 h-10 text-primary-hover animate-float-fast" />
        <Plane className="absolute bottom-[30%] right-[10%] w-14 h-14 text-muted-foreground/30 animate-float-slow" />
        <Key className="absolute top-[40%] left-[80%] w-8 h-8 text-primary animate-float-medium" />
      </div>

      <div className="relative z-10 w-full max-w-5xl mx-auto px-6 flex flex-col items-center text-center">
        <Reveal delay={200}>
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight tracking-tight">
            <span className="text-primary">Sun</span>
            <span className="text-primary">Crisp</span>
          </h1>
        </Reveal>

        <Reveal>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 border border-primary/20 rounded-full bg-primary-light/50 mb-6 backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <span className="text-[10px] uppercase tracking-widest text-primary font-bold">
              Constructions | Rentals | Hospitality
            </span>
          </div>
        </Reveal>

        <Reveal delay={400}>
          <p className="font-sans text-muted-foreground text-base md:text-lg tracking-wide max-w-xl mx-auto mb-8 leading-relaxed">
            From groundbreaking construction to exquisite rentals and world-class experiences. 
            We build the future and curate the present.
          </p>
        </Reveal>

        <Reveal delay={600}>
          <button 
            className="px-8 py-3 bg-card border border-border text-foreground hover:border-primary hover:text-primary rounded-xl font-sans font-bold uppercase tracking-widest text-sm transition-all hover:shadow-lg"
            onClick={() => onNavigate && onNavigate('contact')}
          >
            Contact Us
          </button>
        </Reveal>
      </div>
      
      {/* Scroll Indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce text-muted-foreground/30">
        <div className="w-[1px] h-20 bg-gradient-to-b from-transparent via-primary/50 to-transparent" />
      </div>
    </section>
  );
};

export default Hero;
