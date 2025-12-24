import { useEffect, useState } from 'react';
import { TESTIMONIALS, PRESS_LOGOS } from '@/constants';
import { Quote } from 'lucide-react';
import { pageBlockService } from '@/services/pageBlockService';

interface Testimonial {
  id: string;
  text: string;
  author: string;
  role: string;
}

const Testimonials = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>(TESTIMONIALS);
  const [trustedByTitle, setTrustedByTitle] = useState("Trusted By");
  const [trustedByLogos, setTrustedByLogos] = useState<string[]>(PRESS_LOGOS);

  useEffect(() => {
    const fetchData = async () => {
      const [testimonialsResult, trustedByResult] = await Promise.all([
        pageBlockService.getByKey("home", "testimonials"),
        pageBlockService.getByKey("home", "trusted_by"),
      ]);

      if (testimonialsResult.data) {
        const items = (testimonialsResult.data.content as { items?: Testimonial[] }).items;
        if (items && items.length > 0) {
          setTestimonials(items);
        }
      }

      if (trustedByResult.data) {
        const content = trustedByResult.data.content as { title?: string; logos?: string[] };
        if (content.title) setTrustedByTitle(content.title);
        if (content.logos && content.logos.length > 0) setTrustedByLogos(content.logos);
      }
    };

    fetchData();
  }, []);

  return (
    <section className="py-12 md:py-16 bg-background border-y border-border overflow-hidden">
      
      {/* Section Heading */}
      <div className="text-center mb-10">
        <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-foreground">Testimonials</h2>
      </div>

      {/* Testimonials Marquee */}
      <div className="mb-12 touch-pan-x">
        <div className="flex w-max animate-marquee" style={{ touchAction: 'pan-x' }}>
          {[...testimonials, ...testimonials].map((item, index) => (
            <div 
              key={`${item.id}-${index}`} 
              className="w-[400px] md:w-[600px] mx-6 p-8 md:p-10 bg-secondary border border-border rounded-2xl relative shadow-soft pointer-events-none"
            >
              <Quote className="absolute top-6 left-6 text-primary/10 w-12 h-12 fill-current" />
              <p className="font-serif text-lg md:text-xl text-foreground/80 italic mb-8 relative z-10 leading-relaxed">
                "{item.text}"
              </p>
              <div className="flex items-center gap-4">
                <div className="w-10 h-1 bg-primary rounded-full" />
                <div>
                  <h4 className="text-sm font-bold text-foreground uppercase tracking-widest">{item.author}</h4>
                  <span className="text-xs text-muted-foreground">{item.role}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Press Marquee (Reverse) */}
      <div className="touch-pan-x">
        <h3 className="text-center text-xs uppercase tracking-[0.3em] text-muted-foreground mb-8 font-bold">{trustedByTitle}</h3>
        <div className="flex w-max animate-marquee-reverse" style={{ touchAction: 'pan-x' }}>
          {[...trustedByLogos, ...trustedByLogos, ...trustedByLogos].map((logo, index) => (
            <div 
              key={`press-${index}`} 
              className="mx-12 opacity-40 transition-opacity duration-300 pointer-events-none"
            >
              <span className="font-serif text-3xl md:text-4xl text-muted-foreground font-bold whitespace-nowrap cursor-default">
                {logo}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
