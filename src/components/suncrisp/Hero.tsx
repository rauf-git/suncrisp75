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
  return <section className="relative min-h-screen flex items-center overflow-hidden ml-0 md:ml-[70px]">
      {/* Background Image */}
      <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{
      backgroundImage: heroData.backgroundImage ? `url(${heroData.backgroundImage})` : `url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1920&q=80')`
    }} />
      
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-background/80 via-background/60 to-background/40" />
      
      {/* Dark gradient overlay - stronger on left side for text readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-background/75 via-background/50 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-background/40 via-transparent to-background/30" />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 mt-2 sm:mt-6 md:mt-10 lg:mt-[61px]">
        <div className="flex flex-col lg:grid lg:grid-cols-[1fr,auto] gap-6 sm:gap-8 lg:gap-12 items-center">
          {/* Left Column - Text Content */}
          <div className="max-w-xl order-2 lg:order-1 text-left sm:text-center lg:text-left">
            <Reveal delay={200}>
              <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 leading-tight tracking-tight">
                <span className="text-primary">​Sun</span>
                <span className="text-primary">Crisp</span>
              </h1>
            </Reveal>

            <Reveal>
              <div className="inline-flex items-center gap-2 px-3 py-1 border border-primary/30 rounded-full bg-background/50 mb-4 backdrop-blur-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                <span className="text-[8px] sm:text-[9px] uppercase tracking-widest text-primary font-bold">
                  Constructions | Rentals | Hospitality
                </span>
              </div>
            </Reveal>

            <Reveal delay={400}>
              <p className="font-sans text-muted-foreground text-sm sm:text-base tracking-wide max-w-md lg:mx-0 mb-6 leading-relaxed">
                {heroData.description || 'From groundbreaking construction to exquisite rentals and world-class experiences. We build the future and curate the present.'}
              </p>
            </Reveal>

            <Reveal delay={500}>
              <Button onClick={() => navigate('/about-us')} className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2 text-sm font-medium min-h-[44px] min-w-[120px]">
                More About Us
              </Button>
            </Reveal>
          </div>

          {/* Right Column - Image Carousel */}
          <Reveal delay={600} width="100%">
            <div className="relative w-full max-w-[320px] sm:max-w-[380px] md:max-w-[400px] lg:max-w-[400px] xl:max-w-[480px] mx-auto lg:mx-0 order-1 lg:order-2">
              <HeroImageCarousel key={heroImages.length} images={heroImages} interval={5000} />
            </div>
          </Reveal>
        </div>
      </div>
      
      {/* Scroll Indicator */}
      <div className="absolute bottom-6 sm:bottom-10 left-1/2 -translate-x-1/2 animate-bounce text-muted-foreground/30">
        <div className="w-[1px] h-12 sm:h-20 bg-gradient-to-b from-transparent via-primary/50 to-transparent" />
      </div>
    </section>;
};
export default Hero;