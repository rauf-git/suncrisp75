import { Star, Quote } from 'lucide-react';
import { TESTIMONIALS, PRESS_LOGOS } from '@/constants';

const Testimonials = () => {
  return (
    <section className="section-padding bg-secondary">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in">
          <p className="text-primary font-sans text-sm uppercase tracking-[0.3em] mb-4">
            Trusted Worldwide
          </p>
          <h2 className="section-title mb-4">What Our Clients Say</h2>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {TESTIMONIALS.map((testimonial, index) => (
            <div
              key={testimonial.id}
              className="bg-card p-8 rounded-lg shadow-soft animate-fade-in"
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              {/* Quote Icon */}
              <Quote className="w-10 h-10 text-primary/20 mb-4" />
              
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                ))}
              </div>
              
              {/* Text */}
              <p className="text-foreground leading-relaxed mb-6">
                "{testimonial.text}"
              </p>
              
              {/* Author */}
              <div className="pt-4 border-t border-border">
                <p className="font-serif font-semibold text-foreground">{testimonial.author}</p>
                <p className="text-muted-foreground text-sm">{testimonial.role}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Press Logos Marquee */}
        <div className="border-t border-border pt-16">
          <p className="text-center text-muted-foreground text-sm uppercase tracking-widest mb-8">
            Featured In
          </p>
          
          <div className="relative overflow-hidden">
            <div className="flex animate-marquee whitespace-nowrap">
              {[...PRESS_LOGOS, ...PRESS_LOGOS].map((logo, index) => (
                <span
                  key={index}
                  className="mx-12 font-serif text-2xl text-muted-foreground/50 hover:text-primary transition-colors"
                >
                  {logo}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
