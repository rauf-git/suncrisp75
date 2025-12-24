import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Reveal from './Reveal';
import { AutoCarousel } from '@/components/ui/auto-carousel';

interface PageHeroSplitProps {
  title: string;
  subtitle: string;
  heroImage?: string;
  secondaryImages?: string[];
  showBackButton?: boolean;
}

const PageHeroSplit = ({
  title,
  subtitle,
  heroImage,
  secondaryImages = [],
  showBackButton = true,
}: PageHeroSplitProps) => {
  const navigate = useNavigate();

  // Use hero image + secondary images for the carousel
  const images = [heroImage, ...secondaryImages].filter(Boolean) as string[];

  return (
    <section className="relative py-10 md:py-14 lg:py-16 overflow-hidden">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
      
      {/* Centered max-width container with responsive padding */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Responsive grid: 1 column mobile, 2 columns desktop, vertically centered */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Column - Text Content */}
          <div className="order-2 lg:order-1 space-y-4 sm:space-y-6">
            {showBackButton && (
              <Reveal>
                <Button
                  variant="ghost"
                  onClick={() => navigate('/')}
                  className="text-muted-foreground hover:text-foreground -ml-4"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Home
                </Button>
              </Reveal>
            )}

            <Reveal delay={100}>
              <span className="text-primary font-sans font-bold uppercase tracking-[0.2em] text-xs sm:text-sm block">
                Discover
              </span>
            </Reveal>

            <Reveal delay={200}>
              <h1 className="font-serif text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight text-foreground leading-tight">
                {title}
              </h1>
            </Reveal>

            <Reveal delay={300}>
              <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-xl leading-relaxed">
                {subtitle}
              </p>
            </Reveal>

            <Reveal delay={400}>
              <div className="h-1 w-24 bg-primary rounded-full" />
            </Reveal>
          </div>

          {/* Right Column - Image Carousel with aspect-ratio */}
          <div className="order-1 lg:order-2 w-full">
            <Reveal delay={200}>
              {images.length > 0 ? (
                <div className="relative rounded-2xl overflow-hidden shadow-elevated aspect-[4/3]">
                  <AutoCarousel
                    images={images}
                    alt={title}
                    autoplayInterval={5000}
                    showArrows={true}
                    showDots={true}
                    showCounter={false}
                  />
                  {/* Decorative element */}
                  <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-primary/10 rounded-full blur-2xl -z-10" />
                </div>
              ) : (
                <div className="relative aspect-[4/3] flex items-center justify-center">
                  <div className="w-full h-full bg-gradient-to-br from-primary/10 via-transparent to-accent/10 rounded-2xl border border-border/50" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-24 h-24 bg-primary/10 rounded-full animate-float-slow" />
                  </div>
                </div>
              )}
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PageHeroSplit;
