import Reveal from './Reveal';
import { AboutData } from '@/types';

interface AboutProps {
  data: AboutData;
}

const About = ({ data }: AboutProps) => {
  return (
    <section className="py-8 sm:py-10 md:py-14 px-4 sm:px-6 bg-secondary relative flex items-center justify-center">
      <div className="w-full max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10 items-center">
        <Reveal>
          <div className="relative max-w-sm sm:max-w-md mx-auto md:mx-0">
            {/* Decorative corners */}
            <div className="absolute -top-3 -left-3 sm:-top-4 sm:-left-4 w-16 h-16 sm:w-24 sm:h-24 border-t-4 border-l-4 border-primary/20 rounded-tl-2xl sm:rounded-tl-3xl" />
            <div className="absolute -bottom-3 -right-3 sm:-bottom-4 sm:-right-4 w-16 h-16 sm:w-24 sm:h-24 border-b-4 border-r-4 border-primary/20 rounded-br-2xl sm:rounded-br-3xl" />
            
            <img 
              src={data.image} 
              alt="About Suncrisp Team" 
              className="w-full rounded-xl sm:rounded-2xl shadow-elevated grayscale hover:grayscale-0 transition-all duration-700 object-cover aspect-[3/4]"
            />
            
            {/* Floating card */}
            <div className="absolute bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 w-[85%] bg-card p-4 sm:p-6 text-center border border-border rounded-lg sm:rounded-xl shadow-lg">
              <h3 className="font-serif text-base sm:text-xl text-foreground font-bold">Leadership</h3>
              <p className="text-primary text-[10px] sm:text-xs uppercase tracking-widest mt-0.5 sm:mt-1 font-semibold">Suncrisp Visionaries</p>
            </div>
          </div>
        </Reveal>

        <Reveal delay={200}>
          <div className="text-center md:text-left">
            <span className="text-primary text-[10px] sm:text-xs font-bold uppercase tracking-[0.15em] sm:tracking-[0.2em] mb-3 sm:mb-4 block">
              Our Philosophy
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-foreground mb-6 sm:mb-8 leading-tight">
              {data.title}
            </h2>
            <div className="text-muted-foreground mb-4 sm:mb-6 leading-relaxed text-sm sm:text-base lg:text-lg whitespace-pre-line">
              {data.description}
            </div>

            <div className="flex flex-wrap gap-2 sm:gap-4 mt-6 sm:mt-8 justify-center md:justify-start">
              {['20+ Years Excellence', '$2B+ Portfolio', 'Global Operations'].map((badge) => (
                <span 
                  key={badge}
                  className="px-3 sm:px-5 py-1.5 sm:py-2 bg-card border border-border rounded-full text-[10px] sm:text-xs uppercase tracking-wide text-muted-foreground font-bold shadow-sm"
                >
                  {badge}
                </span>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

export default About;
