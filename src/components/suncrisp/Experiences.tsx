import { useState, useRef, useEffect } from 'react';
import { Experience } from '@/types';
import Reveal from './Reveal';
import { ArrowRight, Star } from 'lucide-react';

interface ExperiencesProps {
  items: Experience[];
  onItemClick?: (item: Experience) => void;
}

const Experiences = ({ items, onItemClick }: ExperiencesProps) => {
  const [cursorContent, setCursorContent] = useState<string | null>(null);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        setCursorPosition({
          x: e.clientX,
          y: e.clientY
        });
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Show empty state when no items
  if (!items || items.length === 0) {
    return (
      <section className="section-padding bg-background">
        <div className="max-w-7xl mx-auto">
          <Reveal>
            <div className="text-center mb-16">
              <p className="text-primary font-sans text-sm uppercase tracking-[0.3em] mb-4">
                Curated Stays
              </p>
              <h2 className="section-title mb-4">Curated Experiences</h2>
              <div className="w-24 h-1 bg-primary mx-auto mb-6 rounded-full" />
              <p className="section-subtitle mx-auto">
                Beyond property, we design moments. Immersion in the extraordinary.
              </p>
            </div>
          </Reveal>
          <div className="text-center py-20">
            <p className="text-muted-foreground">No hospitality experiences available yet. Check back soon!</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      ref={containerRef as React.RefObject<HTMLElement>}
      className="relative section-padding bg-background overflow-hidden cursor-none"
    >
      {/* Custom Cursor Element */}
      <div 
        className="fixed pointer-events-none z-50 flex items-center justify-center transition-transform duration-100 ease-out mix-blend-difference"
        style={{ 
          left: cursorPosition.x, 
          top: cursorPosition.y,
          transform: `translate(-50%, -50%) scale(${cursorContent ? 1 : 0})`
        }}
      >
        <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-serif text-xs font-bold uppercase tracking-widest text-center px-2 shadow-lg">
          {cursorContent}
        </div>
      </div>

      {/* Default small cursor */}
      <div 
        className="fixed pointer-events-none z-50 w-3 h-3 bg-primary rounded-full transition-all duration-150 shadow-sm"
        style={{ 
          left: cursorPosition.x, 
          top: cursorPosition.y,
          transform: `translate(-50%, -50%) scale(${cursorContent ? 0 : 1})`
        }}
      />

      <div className="max-w-7xl mx-auto">
        <Reveal>
          <div className="text-center mb-16">
            <p className="text-primary font-sans text-sm uppercase tracking-[0.3em] mb-4">
              Curated Stays
            </p>
            <h2 className="section-title mb-4">Curated Experiences</h2>
            <div className="w-24 h-1 bg-primary mx-auto mb-6 rounded-full" />
            <p className="section-subtitle mx-auto">
              Beyond property, we design moments. Immersion in the extraordinary.
            </p>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {items.map((exp, index) => {
            const Icon = exp.icon || Star;
            return (
              <Reveal key={exp.id} delay={index * 100}>
                <div 
                  className="group relative rounded-2xl overflow-hidden h-[500px] shadow-soft hover:shadow-elevated transition-all duration-500 cursor-pointer"
                  onMouseEnter={() => setCursorContent("Explore")}
                  onMouseLeave={() => setCursorContent(null)}
                  onClick={() => onItemClick && onItemClick(exp)}
                >
                  {/* Background Image with Overlay */}
                  <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-foreground/20 group-hover:bg-foreground/10 transition-colors duration-500 z-10" />
                    <img 
                      src={exp.image} 
                      alt={exp.title}
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-1000"
                    />
                    {/* Gradient Overlay for Text Readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-foreground/90 via-foreground/40 to-transparent opacity-90" />
                  </div>

                  {/* Content */}
                  <div className="absolute inset-0 z-20 p-8 flex flex-col justify-end">
                    <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                      <div className="bg-primary/90 p-3 rounded-lg w-fit mb-6">
                        <Icon className="w-6 h-6 text-primary-foreground" />
                      </div>
                      <h3 className="font-serif text-2xl text-primary-foreground mb-3">{exp.title}</h3>
                      <p className="text-primary-foreground/80 text-sm mb-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100 leading-relaxed">
                        {exp.description}
                      </p>
                      <div className="flex items-center justify-between border-t border-primary-foreground/20 pt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-200">
                        <span className="text-primary font-bold text-xs uppercase tracking-widest bg-primary-foreground/10 px-3 py-1 rounded">
                          {exp.priceStart}
                        </span>
                        <ArrowRight size={18} className="text-primary-foreground" />
                      </div>
                    </div>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Experiences;