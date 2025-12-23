import { TESTIMONIALS, PRESS_LOGOS } from '@/constants';
import { Quote } from 'lucide-react';

const Testimonials = () => {
  return (
    <section className="py-20 bg-background border-y border-border overflow-hidden">
      
      {/* Testimonials Marquee */}
      <div className="mb-20">
        <div className="flex w-max animate-marquee hover:[animation-play-state:paused]">
          {[...TESTIMONIALS, ...TESTIMONIALS].map((item, index) => (
            <div 
              key={`${item.id}-${index}`} 
              className="w-[400px] md:w-[600px] mx-6 p-8 md:p-10 bg-secondary border border-border rounded-2xl relative shadow-soft"
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
      <div>
        <h3 className="text-center text-xs uppercase tracking-[0.3em] text-muted-foreground mb-8 font-bold">Trusted By</h3>
        <div className="flex w-max animate-marquee-reverse hover:[animation-play-state:paused]">
          {[...PRESS_LOGOS, ...PRESS_LOGOS, ...PRESS_LOGOS].map((logo, index) => (
            <div 
              key={`press-${index}`} 
              className="mx-12 opacity-40 hover:opacity-100 transition-opacity duration-300"
            >
              <span className="font-serif text-3xl md:text-4xl text-muted-foreground hover:text-primary font-bold whitespace-nowrap cursor-default">
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
