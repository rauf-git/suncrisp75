import Reveal from './Reveal';
import { ContentSection } from '@/services/pageContentService';
interface ContentSectionsProps {
  sections: ContentSection[];
}
const ContentSections = ({
  sections
}: ContentSectionsProps) => {
  if (sections.length === 0) {
    return <section className="py-16">
        <div className="max-w-4xl mx-auto px-6 md:px-12">
          <div className="text-center py-20">
            <p className="text-muted-foreground">Content coming soon...</p>
          </div>
        </div>
      </section>;
  }

  // Determine if we should use a feature grid for many sections (4+)
  const useFeatureGrid = sections.length >= 4;
  if (useFeatureGrid) {
    return <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          {/* Intro sections (first 2) as standard blocks */}
          {sections.slice(0, 2).map((section, index) => <Reveal key={index} delay={index * 100}>
              <div className="max-w-4xl mx-auto mb-16">
                <div className={`flex flex-col ${section.image ? 'lg:flex-row lg:gap-8 lg:items-start' : ''}`}>
                  {section.image && <div className="mb-4 sm:mb-6 lg:mb-0 lg:w-1/2 lg:flex-shrink-0 rounded-lg sm:rounded-xl overflow-hidden shadow-elevated">
                      <img 
                        src={section.image} 
                        alt={section.heading || `Section ${index + 1}`} 
                        className="w-full h-auto object-cover aspect-[4/3] sm:aspect-video" 
                        loading="lazy"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>}
                  <div className={`prose prose-sm sm:prose-base lg:prose-lg max-w-none ${section.image ? 'lg:w-1/2' : ''}`}>
                    {section.heading && <h2 className="font-serif text-xl sm:text-2xl md:text-3xl font-semibold mb-3 sm:mb-4 text-foreground">
                        {section.heading}
                      </h2>}
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap text-sm sm:text-base">
                      {section.content}
                    </p>
                  </div>
                </div>
                <div className="mt-12 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
              </div>
            </Reveal>)}

          {/* Feature grid for remaining sections */}
          {sections.length > 2 && <div className="mt-6 sm:mt-8">
              <Reveal>
                <h3 className="font-serif text-xl sm:text-2xl md:text-3xl text-center mb-8 sm:mb-12 text-foreground">
                  What Sets Us Apart
                </h3>
              </Reveal>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {sections.slice(2).map((section, index) => <Reveal key={index + 2} delay={(index + 2) * 100}>
                    <div className="glass-card rounded-lg sm:rounded-xl overflow-hidden h-full hover:shadow-elevated transition-all duration-300 group">
                      {section.image && <div className="aspect-[4/3] sm:aspect-video overflow-hidden">
                          <img 
                            src={section.image} 
                            alt={section.heading || `Section ${index + 3}`} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                            loading="lazy"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        </div>}
                      <div className="p-4 sm:p-6">
                        {section.heading && <h4 className="font-serif text-base sm:text-lg font-semibold mb-2 sm:mb-3 text-foreground group-hover:text-primary transition-colors">
                            {section.heading}
                          </h4>}
                        <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed whitespace-pre-wrap line-clamp-6">
                          {section.content}
                        </p>
                      </div>
                    </div>
                  </Reveal>)}
              </div>
            </div>}
        </div>
      </section>;
  }

  // Standard alternating layout for fewer sections
  return <section className="py-12 sm:py-16 md:py-24 px-0">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-0">
        <div className="space-y-10 sm:space-y-16">
          {sections.map((section, index) => <Reveal key={index} delay={index * 100}>
              <div className={`${index % 2 === 1 ? 'glass-card rounded-lg sm:rounded-xl p-4 sm:p-6 md:p-8 lg:p-10' : ''}`}>
                <div className={`flex flex-col ${section.image ? 'lg:flex-row lg:gap-8 lg:items-start' : ''} ${index % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}>
                  {section.image && <div className={`mb-4 sm:mb-6 lg:mb-0 lg:w-1/2 lg:flex-shrink-0 rounded-lg sm:rounded-xl overflow-hidden shadow-elevated flex items-center justify-center ${index % 2 === 1 ? '-mx-1 sm:-mx-2 lg:mx-0' : ''}`}>
                      <img 
                        src={section.image} 
                        alt={section.heading || `Section ${index + 1}`} 
                        className="w-full h-auto object-cover aspect-[4/3] sm:aspect-video" 
                        loading="lazy"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>}
                  <div className={`prose prose-sm sm:prose-base lg:prose-lg max-w-none ${section.image ? 'lg:w-1/2' : ''}`}>
                    {section.heading && <h2 className="font-serif text-xl sm:text-2xl md:text-3xl font-semibold mb-3 sm:mb-4 text-foreground">
                        {section.heading}
                      </h2>}
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap text-sm sm:text-base">
                      {section.content}
                    </p>
                  </div>
                </div>
              </div>
              {index < sections.length - 1 && index % 2 === 0 && <div className="mt-16 h-px bg-gradient-to-r from-transparent via-border to-transparent" />}
            </Reveal>)}
        </div>
      </div>
    </section>;
};
export default ContentSections;