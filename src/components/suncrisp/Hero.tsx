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
const Hero = ({
  onNavigate
}: HeroProps) => {
  const navigate = useNavigate();
  const [heroData, setHeroData] = useState<HeroData>({});
  const fetchHeroData = async () => {
    const {
      data
    } = await pageBlockService.getByKey("home", "hero");
    if (data?.content) {
      const content = data.content as HeroData & {
        hero_images?: string[];
      };
      // Support both heroImages and hero_images for backwards compatibility
      const normalizedData: HeroData = {
        ...content,
        heroImages: content.heroImages || content.hero_images || []
      };
      setHeroData(normalizedData);
    }
  };
  useEffect(() => {
    fetchHeroData();
    const onUpdated = (e: Event) => {
      const evt = e as CustomEvent<{
        page_key?: string;
        block_key?: string;
      }>;
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
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat" 
        style={{
          backgroundImage: heroData.backgroundImage 
            ? `url(${heroData.backgroundImage})` 
            : `url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1920&q=80')`
        }} 
      />
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-background/95 via-background/85 to-background/60" />
      {/* Dark gradient overlay - stronger on left side for text readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/70 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-background/40" />

      <div className="relative z-10 w-full px-6 sm:px-8 md:px-12 lg:px-16 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 lg:gap-20 items-center">
          {/* Text Section */}
          <div className="md:col-span-7 lg:col-span-6 text-left order-2 md:order-1">
            <Reveal delay={200}>
              <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-4 leading-tight tracking-tight">
                <span className="text-primary">Sun</span>
                <span className="text-primary">Crisp</span>
              </h1>
            </Reveal>

            <Reveal>
              <div className="inline-flex items-center gap-2 sm:gap-4 px-4 py-2 sm:px-6 sm:py-3 border border-primary/30 rounded-full bg-background/50 mb-6 backdrop-blur-sm">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="text-xs sm:text-sm uppercase tracking-widest text-primary font-bold">
                  Constructions | Rentals | Hospitality
                </span>
              </div>
            </Reveal>

            <Reveal delay={400}>
              <p className="font-sans text-muted-foreground text-base sm:text-lg md:text-xl tracking-wide max-w-2xl mb-8 leading-relaxed">
                {heroData.description || 'From groundbreaking construction to exquisite rentals and world-class experiences. We build the future and curate the present.'}
              </p>
            </Reveal>

            <Reveal delay={500}>
              <Button 
                onClick={() => navigate('/about-us')} 
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg font-medium"
              >
                More About Us
              </Button>
            </Reveal>
          </div>

          {/* Carousel Section */}
          <Reveal delay={600} width="100%">
            <div className="md:col-span-5 lg:col-span-6 flex justify-center md:justify-end order-1 md:order-2">
              <div className="relative w-full max-w-[380px] sm:max-w-[420px] md:w-[340px] lg:w-[400px] xl:w-[480px]">
                <HeroImageCarousel key={heroImages.length} images={heroImages} interval={5000} />
              </div>
            </div>
          </Reveal>
        </div>
      </div>
      
      {/* Scroll Indicator */}
      <div className="absolute bottom-20 sm:bottom-10 left-1/2 -translate-x-1/2 animate-bounce text-muted-foreground/30">
        <div className="w-[1px] h-16 sm:h-20 bg-gradient-to-b from-transparent via-primary/50 to-transparent" />
      </div>
    </section>
  );
};
export default Hero;