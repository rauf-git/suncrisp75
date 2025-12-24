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
  return <section className="relative min-h-[85vh] flex items-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img 
          src={heroData.backgroundImage || "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1920&q=80"} 
          alt="" 
          className="w-full h-full object-cover"
        />
      </div>
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-background/90 via-background/80 to-background/60" />
      {/* Dark gradient overlay - stronger on left side */}
      <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/70 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-background/40" />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-20">
        <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-center">
          {/* Left Column - Text Content */}
          <div className="flex-1 max-w-xl order-1 text-center md:text-left">
            <Reveal delay={200}>
              <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight tracking-tight">
                <span className="text-primary">Sun</span>
                <span className="text-primary">Crisp</span>
              </h1>
            </Reveal>

            <Reveal>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 border border-primary/30 rounded-full bg-background/50 mb-5 backdrop-blur-sm">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="text-[10px] uppercase tracking-widest text-primary font-bold">
                  Constructions | Rentals | Hospitality
                </span>
              </div>
            </Reveal>

            <Reveal delay={400}>
              <p className="font-sans text-muted-foreground text-base md:text-lg tracking-wide max-w-lg mb-8 leading-relaxed mx-auto md:mx-0">
                {heroData.description || 'From groundbreaking construction to exquisite rentals and world-class experiences. We build the future and curate the present.'}
              </p>
            </Reveal>

            <Reveal delay={500}>
              <Button onClick={() => navigate('/about-us')} className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 text-base font-medium">
                More About Us
              </Button>
            </Reveal>
          </div>

          {/* Right Column - Image Carousel */}
          <Reveal delay={600} width="100%">
            <div className="flex-1 w-full max-w-md md:max-w-lg xl:max-w-xl order-2">
              <HeroImageCarousel key={heroImages.length} images={heroImages} interval={5000} />
            </div>
          </Reveal>
        </div>
      </div>
      
      {/* Scroll Indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce text-muted-foreground/30">
        <div className="w-[1px] h-20 bg-gradient-to-b from-transparent via-primary/50 to-transparent" />
      </div>
    </section>;
};
export default Hero;