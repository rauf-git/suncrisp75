import Reveal from './Reveal';
import { ContentSection } from '@/services/pageContentService';

interface ContentSectionsProps {
  sections: ContentSection[];
}

const ContentSections = ({ sections }: ContentSectionsProps) => {
  if (sections.length === 0) {
    return (
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-6 md:px-12">
          <div className="text-center py-20">
            <p className="text-muted-foreground">Content coming soon...</p>
          </div>
        </div>
      </section>
    );
  }

  // Determine if we should use a feature grid for many sections (4+)
  const useFeatureGrid = sections.length >= 4;

  if (useFeatureGrid) {
    return (
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          {/* Intro sections (first 2) as standard blocks */}
          {sections.slice(0, 2).map((section, index) => (
            <Reveal key={index} delay={index * 100}>
              <div className="max-w-4xl mx-auto mb-16">
                <div className={`flex flex-col ${section.image ? 'md:flex-row md:gap-8 md:items-start' : ''}`}>
                  {section.image && (
                    <div className="mb-6 md:mb-0 md:w-1/2 md:flex-shrink-0 rounded-xl overflow-hidden shadow-elevated">
                      <img
                        src={section.image}
                        alt={section.heading || `Section ${index + 1}`}
                        className="w-full h-auto object-cover aspect-video"
                        loading="lazy"
                      />
                    </div>
                  )}
                  <div className={`prose prose-lg max-w-none ${section.image ? 'md:w-1/2' : ''}`}>
                    {section.heading && (
                      <h2 className="font-serif text-2xl md:text-3xl font-semibold mb-4 text-foreground">
                        {section.heading}
                      </h2>
                    )}
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                      {section.content}
                    </p>
                  </div>
                </div>
                <div className="mt-12 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
              </div>
            </Reveal>
          ))}

          {/* Feature grid for remaining sections */}
          {sections.length > 2 && (
            <div className="mt-8">
              <Reveal>
                <h3 className="font-serif text-2xl md:text-3xl text-center mb-12 text-foreground">
                  What Sets Us Apart
                </h3>
              </Reveal>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sections.slice(2).map((section, index) => (
                  <Reveal key={index + 2} delay={(index + 2) * 100}>
                    <div className="glass-card rounded-xl overflow-hidden h-full hover:shadow-elevated transition-all duration-300 group">
                      {section.image && (
                        <div className="aspect-video overflow-hidden">
                          <img
                            src={section.image}
                            alt={section.heading || `Section ${index + 3}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            loading="lazy"
                          />
                        </div>
                      )}
                      <div className="p-6">
                        {section.heading && (
                          <h4 className="font-serif text-lg font-semibold mb-3 text-foreground group-hover:text-primary transition-colors">
                            {section.heading}
                          </h4>
                        )}
                        <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-wrap line-clamp-6">
                          {section.content}
                        </p>
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    );
  }

  // Standard alternating layout for fewer sections
  return (
    <section className="py-16 md:py-24">
      <div className="max-w-4xl mx-auto px-6 md:px-12">
        <div className="space-y-16">
          {sections.map((section, index) => (
            <Reveal key={index} delay={index * 100}>
              <div
                className={`${
                  index % 2 === 1
                    ? 'glass-card rounded-xl p-8 md:p-10'
                    : ''
                }`}
              >
                <div className={`flex flex-col ${section.image ? 'md:flex-row md:gap-8 md:items-start' : ''} ${index % 2 === 1 ? 'md:flex-row-reverse' : ''}`}>
                  {section.image && (
                    <div className={`mb-6 md:mb-0 md:w-1/2 md:flex-shrink-0 rounded-xl overflow-hidden shadow-elevated ${index % 2 === 1 ? '-mx-2 md:mx-0' : ''}`}>
                      <img
                        src={section.image}
                        alt={section.heading || `Section ${index + 1}`}
                        className="w-full h-auto object-cover aspect-video"
                        loading="lazy"
                      />
                    </div>
                  )}
                  <div className={`prose prose-lg max-w-none ${section.image ? 'md:w-1/2' : ''}`}>
                    {section.heading && (
                      <h2 className="font-serif text-2xl md:text-3xl font-semibold mb-4 text-foreground">
                        {section.heading}
                      </h2>
                    )}
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                      {section.content}
                    </p>
                  </div>
                </div>
              </div>
              {index < sections.length - 1 && index % 2 === 0 && (
                <div className="mt-16 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
              )}
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ContentSections;