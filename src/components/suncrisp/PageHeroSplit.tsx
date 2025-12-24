import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Reveal from './Reveal';

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

  // Use hero image + secondary images for the collage
  const images = [heroImage, ...secondaryImages].filter(Boolean) as string[];

  return (
    <section className="relative py-16 md:py-24 overflow-hidden">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12">
        <div className="flex flex-col md:grid md:grid-cols-[1fr,auto] gap-6 md:gap-8 lg:gap-12 items-center">
          {/* Left Column - Text Content */}
          <div className="order-1">
            {showBackButton && (
              <Reveal>
                <Button
                  variant="ghost"
                  onClick={() => navigate('/')}
                  className="mb-6 text-muted-foreground hover:text-foreground -ml-4"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Home
                </Button>
              </Reveal>
            )}

            <Reveal delay={100}>
              <span className="text-primary font-sans font-bold uppercase tracking-[0.2em] text-sm mb-4 block">
                Discover
              </span>
            </Reveal>

            <Reveal delay={200}>
              <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight text-foreground leading-tight">
                {title}
              </h1>
            </Reveal>

            <Reveal delay={300}>
              <p className="text-lg md:text-xl text-muted-foreground max-w-xl leading-relaxed">
                {subtitle}
              </p>
            </Reveal>

            <Reveal delay={400}>
              <div className="mt-8 h-1 w-24 bg-primary rounded-full" />
            </Reveal>
          </div>

          {/* Right Column - Image (smaller, right side on md+, below on mobile) */}
          <div className="order-2 w-full md:w-[340px] lg:w-[400px] xl:w-[480px]">
            <Reveal delay={200}>
              {images.length >= 2 ? (
                // Two-image collage layout
                <div className="relative h-[300px] md:h-[350px] lg:h-[400px]">
                  {/* Primary image */}
                  <div className="absolute top-0 right-0 w-[70%] h-[70%] rounded-2xl overflow-hidden shadow-elevated">
                    <img
                      src={images[0]}
                      alt={title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  {/* Secondary image - offset */}
                  <div className="absolute bottom-0 left-0 w-[55%] h-[55%] rounded-2xl overflow-hidden shadow-elevated border-4 border-background">
                    <img
                      src={images[1]}
                      alt={`${title} detail`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  {/* Decorative element */}
                  <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-primary/10 rounded-full blur-2xl" />
                </div>
              ) : images.length === 1 ? (
                // Single image
                <div className="relative">
                  <div className="rounded-2xl overflow-hidden shadow-elevated">
                    <img
                      src={images[0]}
                      alt={title}
                      className="w-full h-auto object-cover aspect-[4/3]"
                      loading="lazy"
                    />
                  </div>
                  {/* Decorative element */}
                  <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-primary/10 rounded-full blur-2xl -z-10" />
                </div>
              ) : (
                // No images - decorative placeholder
                <div className="relative h-[300px] md:h-[350px] flex items-center justify-center">
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
