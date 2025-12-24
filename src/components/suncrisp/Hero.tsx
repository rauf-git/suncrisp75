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
  background_image?: string;
  video_url?: string;
  hero_images?: string[];
}

const Hero = ({ onNavigate }: HeroProps) => {
  const navigate = useNavigate();
  const [heroData, setHeroData] = useState<HeroData>({});

  const fetchHeroData = async () => {
    const { data } = await pageBlockService.getByKey("home", "hero");
    if (data?.content) {
      setHeroData(data.content as HeroData);
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

  const heroImages = heroData.hero_images || [];

  return (
    <section className="relative min-h-screen flex items-center bg-background overflow-hidden">
      <div className="w-full max-w-7xl mx-auto px-6 md:px-12 py-16 lg:py-0">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Column - Text Content */}
          <div className="max-w-lg">
            <Reveal>
              <p className="font-serif italic text-primary text-lg md:text-xl mb-2">
                welcome to
              </p>
            </Reveal>

            <Reveal delay={200}>
              <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight tracking-tight text-foreground uppercase">
                <span className="text-primary">Sun</span>Crisp
              </h1>
            </Reveal>

            <Reveal delay={300}>
              <div className="inline-flex items-center gap-2 px-3 py-1 border border-primary/30 rounded-full bg-muted/50 mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                <span className="text-[9px] uppercase tracking-widest text-primary font-bold">
                  Constructions | Rentals | Hospitality
                </span>
              </div>
            </Reveal>

            <Reveal delay={400}>
              <p className="text-muted-foreground text-base md:text-lg leading-relaxed mb-8">
                {heroData.description || 'From groundbreaking construction to exquisite rentals and world-class experiences. We build the future and curate the present.'}
              </p>
            </Reveal>

            <Reveal delay={500}>
              <Button 
                onClick={() => navigate('/about-us')}
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 text-sm font-medium"
              >
                More About Us
              </Button>
            </Reveal>
          </div>

          {/* Right Column - Image Carousel */}
          <Reveal delay={400}>
            <div className="relative">
              <HeroImageCarousel key={heroImages.length} images={heroImages} interval={5000} />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
};

export default Hero;
