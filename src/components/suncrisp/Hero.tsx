import Reveal from './Reveal';

interface HeroProps {
  onNavigate?: (page: string) => void;
}

const Hero = ({ onNavigate }: HeroProps) => {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background Image with dark gradient */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1920&q=80')`
        }}
      />
      {/* Dark gradient overlay - stronger on left side */}
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-background/30" />
      <div className="absolute inset-0 bg-gradient-to-t from-background/50 via-transparent to-background/30" />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12">
        <div className="max-w-xl">
          <Reveal delay={200}>
            <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold mb-3 leading-tight tracking-tight">
              <span className="text-primary">Sun</span>
              <span className="text-primary">Crisp</span>
            </h1>
          </Reveal>

          <Reveal>
            <div className="inline-flex items-center gap-2 px-3 py-1 border border-primary/30 rounded-full bg-background/50 mb-4 backdrop-blur-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <span className="text-[9px] uppercase tracking-widest text-primary font-bold">
                Constructions | Rentals | Hospitality
              </span>
            </div>
          </Reveal>

          <Reveal delay={400}>
            <p className="font-sans text-muted-foreground text-sm md:text-base tracking-wide max-w-md mb-6 leading-relaxed">
              From groundbreaking construction to exquisite rentals and world-class experiences. 
              We build the future and curate the present.
            </p>
          </Reveal>
        </div>
      </div>
      
      {/* Scroll Indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce text-muted-foreground/30">
        <div className="w-[1px] h-20 bg-gradient-to-b from-transparent via-primary/50 to-transparent" />
      </div>
    </section>
  );
};

export default Hero;
