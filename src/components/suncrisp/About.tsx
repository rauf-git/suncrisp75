import Reveal from './Reveal';
import { AboutData } from '@/types';

interface AboutProps {
  data: AboutData;
}

const About = ({ data }: AboutProps) => {
  return (
    <section className="py-10 md:py-14 px-4 bg-secondary relative flex items-center justify-center">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
        <Reveal>
          <div className="relative">
            {/* Decorative corners */}
            <div className="absolute -top-4 -left-4 w-24 h-24 border-t-4 border-l-4 border-primary/20 rounded-tl-3xl" />
            <div className="absolute -bottom-4 -right-4 w-24 h-24 border-b-4 border-r-4 border-primary/20 rounded-br-3xl" />
            
            <img 
              src={data.image} 
              alt="About Suncrisp Team" 
              className="w-full max-w-md mx-auto rounded-2xl shadow-elevated grayscale hover:grayscale-0 transition-all duration-700 object-cover aspect-[3/4]"
            />
            
            {/* Floating card */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[85%] bg-card p-6 text-center border border-border rounded-xl shadow-lg">
              <h3 className="font-serif text-xl text-foreground font-bold">Leadership</h3>
              <p className="text-primary text-xs uppercase tracking-widest mt-1 font-semibold">Suncrisp Visionaries</p>
            </div>
          </div>
        </Reveal>

        <Reveal delay={200}>
          <div>
            <span className="text-primary text-xs font-bold uppercase tracking-[0.2em] mb-4 block">
              Our Philosophy
            </span>
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl text-foreground mb-8 leading-tight">
              {data.title}
            </h2>
            <div className="text-muted-foreground mb-6 leading-relaxed text-lg whitespace-pre-line">
              {data.description}
            </div>

            <div className="flex flex-wrap gap-4 mt-8">
              {['20+ Years Excellence', '$2B+ Portfolio', 'Global Operations'].map((badge) => (
                <span 
                  key={badge}
                  className="px-5 py-2 bg-card border border-border rounded-full text-xs uppercase tracking-wide text-muted-foreground font-bold shadow-sm"
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
