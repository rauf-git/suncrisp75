import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Reveal from './Reveal';
import { pageBlockService } from '@/services/pageBlockService';

interface BrandStorySectionData {
  heading?: string;
  paragraph?: string;
  image?: string;
}

const BrandStorySection = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<BrandStorySectionData>({
    heading: 'Our Brand Story',
    paragraph: 'Discover the journey that shaped Suncrisp Hospitality into what it is today. From humble beginnings to becoming a trusted name in construction, rentals, and hospitality excellence.',
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80'
  });

  const fetchData = async () => {
    const { data: block } = await pageBlockService.getByKey('home', 'brand_story_section');
    if (block?.content) {
      const content = block.content as BrandStorySectionData;
      setData({
        heading: content.heading || 'Our Brand Story',
        paragraph: content.paragraph || data.paragraph,
        image: content.image || data.image,
      });
    }
  };

  useEffect(() => {
    fetchData();

    const onUpdated = (e: Event) => {
      const evt = e as CustomEvent<{ page_key?: string; block_key?: string }>;
      if (evt.detail?.page_key === 'home' && evt.detail?.block_key === 'brand_story_section') {
        fetchData();
      }
    };

    window.addEventListener('page-block-updated', onUpdated);
    return () => window.removeEventListener('page-block-updated', onUpdated);
  }, []);

  return (
    <section className="min-h-screen flex items-center bg-muted/30">
      <div className="w-full max-w-7xl mx-auto px-6 md:px-12 py-16 md:py-20">
        <Reveal>
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-center mb-12 md:mb-16">
            {data.heading}
          </h2>
        </Reveal>

        <div className="flex flex-col md:grid md:grid-cols-[1fr,auto] gap-6 md:gap-8 lg:gap-12 items-center">
          {/* Left Side - Paragraph with Know More Button */}
          <Reveal delay={200}>
            <div className="space-y-6 order-1">
              <p className="text-muted-foreground text-base md:text-lg leading-relaxed max-w-xl">
                {data.paragraph}
              </p>
              <Button
                onClick={() => navigate('/our-brand-story')}
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3"
              >
                Know More
              </Button>
            </div>
          </Reveal>

          {/* Right Side - Image (smaller, right side on md+, below on mobile) */}
          <Reveal delay={400}>
            <div className="relative order-2 w-full md:w-[340px] lg:w-[400px] xl:w-[480px]">
              <div className="absolute -inset-3 bg-gradient-to-br from-primary/20 via-transparent to-primary/10 rounded-2xl blur-sm" />
              <div className="relative h-[280px] md:h-[320px] lg:h-[380px] rounded-xl overflow-hidden shadow-2xl border border-primary/20">
                <img
                  src={data.image}
                  alt="Our Brand Story"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-3/4 h-4 bg-primary/20 blur-xl rounded-full" />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
};

export default BrandStorySection;
