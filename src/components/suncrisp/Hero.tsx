import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Reveal from './Reveal';
import HeroImageCarousel from './HeroImageCarousel';
import { pageBlockService } from '@/services/pageBlockService';

interface HeroProps {
  onNavigate?: (page: string) => void;
}

interface HeroData {
  title?: string;
  subtitle?: string;
  description?: string;
  backgroundImage?: string;
  videoUrl?: string;
  heroImages?: string[];
}

const Hero = ({ onNavigate }: HeroProps) => {
  const navigate = useNavigate();
  const [heroData, setHeroData] = useState<HeroData>({});

  const fetchHeroData = async () => {
    const { data } = await pageBlockService.getByKey("home", "hero");
    if (data?.content) {
      const content = data.content as HeroData & { hero_images?: string[] };
      // Support both heroImages and hero_images for backwards compatibility
      const normalizedData: HeroData = {
        ...content,
        heroImages: content.heroImages || content.hero_images || [],
      };
      setHeroData(normalizedData);
    }
  };

  useEffect(() => {
    fetchHeroData();

    const onUpdated = (e: Event) => {
      const evt = e as CustomEvent<{ page_key?: string; block_key?: string }>;
      if (evt.detail?.page_key === "home" && evt.detail?.block_key === "hero") {
        fetchHeroData();
      }
    };

    window.addEventListener("page-block-updated", onUpdated);
    return () => window.removeEventListener("page-block-updated", onUpdated);
  }, []);

  const heroImages = heroData.heroImages || [];
  
  // Log warning if no images configured
  if (heroImages.length === 0) {
    console.warn('[Hero] No hero images configured. Upload images via Admin → Pages → Home.');
  }

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background/95 to-background/80" />
      {/* Dark gradient overlay - stronger on left side */}
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-background/30" />
      <div className="absolute inset-0 bg-gradient-to-t from-background/50 via-transparent to-background/30" />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Column - Text Content */}
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
                {heroData.description || 'From groundbreaking construction to exquisite rentals and world-class experiences. We build the future and curate the present.'}
              </p>
            </Reveal>

            <Reveal delay={500}>
              <div className="flex flex-wrap gap-3">
                <Button 
                  onClick={() => navigate('/about-us')}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2 text-sm font-medium"
                >
                  More About Us
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => navigate('/our-brand-story')}
                  className="border-primary/30 text-foreground hover:bg-primary/10 px-6 py-2 text-sm font-medium"
                >
                  Our Brand Story
                </Button>
              </div>
            </Reveal>
          </div>

          {/* Right Column - Image Carousel */}
          <Reveal delay={600} width="100%">
            <div className="relative mt-8 lg:mt-0 w-full">
              <HeroImageCarousel key={heroImages.length} images={heroImages} interval={5000} />
            </div>
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
