import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, MapPin, Tag, Camera, Maximize2, Check, ExternalLink } from 'lucide-react';
import Reveal from './Reveal';
import { Property } from '@/types';
import { projectService } from '@/services/projectService';
import { constructionService } from '@/services/constructionService';
import { rentalService } from '@/services/rentalService';
import EmailModal from './EmailModal';

interface PropertyDetailProps {
  item: Property;
  section?: string;
  onBack: () => void;
}

const PropertyDetail = ({ item, section = 'property', onBack }: PropertyDetailProps) => {
  const [resolvedItem, setResolvedItem] = useState<Property>(item);
  const [visitUrl, setVisitUrl] = useState<string | null>(null);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [item.id]);

  useEffect(() => {
    let isMounted = true;

    const fetchLatest = async () => {
      // portfolio + hospitality both come from projects
      if (section === 'portfolio' || section === 'hospitality') {
        const { data } = await projectService.getById(item.id);
        if (!isMounted || !data) return;
        setResolvedItem({
          ...item,
          title: data.title,
          type: data.category || item.type,
          location: data.location || item.location,
          price: data.short_description || item.price,
          image: data.image_url || item.image,
          description: data.short_description || data.description || item.description,
          detailedDescription: data.long_description || data.description || item.detailedDescription,
          gallery: data.images || [],
          content_sections: (data.content_sections as { heading: string; content: string; image?: string }[] | null) || [],
        });
        setVisitUrl(data.visit_url || null);
        return;
      }

      if (section === 'construction') {
        const { data } = await constructionService.getById(item.id);
        if (!isMounted || !data) return;
        setResolvedItem({
          ...item,
          title: data.title,
          type: data.status || item.type,
          location: data.address || item.location,
          price: data.status || item.price,
          image: data.thumbnail_url || item.image,
          description: data.description || item.description,
          detailedDescription: data.description || item.detailedDescription,
          gallery: data.images || [],
          content_sections: (data.content_sections as { heading: string; content: string; image?: string }[] | null) || [],
        });
        setVisitUrl(data.visit_url || null);
        return;
      }

      if (section === 'rentals') {
        const { data } = await rentalService.getById(item.id);
        if (!isMounted || !data) return;
        setResolvedItem({
          ...item,
          title: data.title,
          type: 'Rental',
          location: data.address || item.location,
          price: data.price || item.price,
          image: data.thumbnail_url || item.image,
          description: data.short_description || item.description,
          detailedDescription: data.long_description || data.short_description || item.detailedDescription,
          gallery: data.images || [],
          content_sections: (data.content_sections as { heading: string; content: string; image?: string }[] | null) || [],
        });
        setVisitUrl(data.visit_url || null);
      }
    };

    fetchLatest();
    return () => {
      isMounted = false;
    };
  }, [item.id, section]);

  const contentSections = useMemo(() => resolvedItem.content_sections || [], [resolvedItem.content_sections]);

  return (
    <div className="bg-background min-h-screen pb-16 sm:pb-24 relative">
      
      {/* 1. Hero Section */}
      <div className="relative w-full h-[50vh] sm:h-[60vh] md:h-[75vh] overflow-hidden group">
        <div className="absolute inset-0 bg-foreground z-0" />
        {/* Main Image with Zoom-Out Animation */}
        <img 
          src={resolvedItem.image} 
          alt={resolvedItem.title} 
          className="w-full h-full object-cover animate-zoom-out opacity-90"
        />
        
        {/* Gradients for readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-foreground via-foreground/40 to-transparent opacity-90" />
        <div className="absolute inset-0 bg-gradient-to-b from-foreground/50 via-transparent to-transparent opacity-60" />
        
        {/* Navigation Overlay */}
        <div className="absolute top-0 left-0 w-full p-4 sm:p-6 flex justify-between items-start z-30 pt-20 sm:pt-24 md:pt-32">
          <button 
            onClick={onBack}
            className="flex items-center gap-1.5 sm:gap-2 text-primary-foreground hover:text-primary bg-foreground/20 hover:bg-foreground/40 px-3 sm:px-5 py-2 sm:py-2.5 rounded-full transition-all backdrop-blur-md border border-primary-foreground/10 min-h-[44px]"
          >
            <ArrowLeft size={16} className="sm:w-[18px] sm:h-[18px]" /> 
            <span className="uppercase tracking-widest text-[10px] sm:text-xs font-bold">Back</span>
          </button>
        </div>


        <div className="absolute bottom-0 left-0 w-full p-4 sm:p-8 md:p-16 text-primary-foreground z-20">
          <div className="max-w-7xl mx-auto">
            <Reveal>
              <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6 flex-wrap">
                <span className="bg-primary px-2 sm:px-3 py-1 rounded-md text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-primary-foreground shadow-lg">
                  {section}
                </span>
                {item.type && (
                  <span className="flex items-center gap-1 text-[9px] sm:text-[10px] uppercase tracking-widest text-primary-foreground/70 font-medium bg-primary-foreground/10 px-2 sm:px-3 py-1 rounded-md backdrop-blur-sm">
                    <Tag size={10} className="sm:w-3 sm:h-3" /> {item.type}
                  </span>
                )}
              </div>
            </Reveal>
            <Reveal delay={100}>
                <h1 className="font-serif text-2xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-4 sm:mb-6 leading-tight tracking-tight text-primary-foreground">
                  {resolvedItem.title}
                </h1>
            </Reveal>
            <Reveal delay={200}>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 text-primary-foreground/80 font-sans border-t border-primary-foreground/10 pt-4 sm:pt-6 mt-4 sm:mt-6">
                {resolvedItem.location && (
                  <div className="flex items-center gap-2">
                    <MapPin size={16} className="sm:w-5 sm:h-5 text-primary" />
                    <span className="text-sm sm:text-lg">{resolvedItem.location}</span>
                  </div>
                )}
                {resolvedItem.price && (
                  <>
                    <div className="hidden sm:block w-1 h-1 bg-primary-foreground/50 rounded-full" />
                    <div className="text-base sm:text-xl font-serif text-primary-foreground">
                      {resolvedItem.price}
                    </div>
                  </>
                )}
              </div>
            </Reveal>
          </div>
        </div>
      </div>

      {/* Visit Link Below Hero */}
      {visitUrl && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 flex justify-end">
          <a
            href={visitUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-primary hover:text-primary/80 bg-primary/10 hover:bg-primary/20 px-4 sm:px-6 py-2.5 sm:py-3 rounded-full transition-all border border-primary/20 min-h-[44px]"
          >
            <ExternalLink size={16} className="sm:w-[18px] sm:h-[18px]" />
            <span className="uppercase tracking-widest text-[10px] sm:text-xs font-bold">Visit</span>
          </a>
        </div>
      )}

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-20 md:py-32">
        
        {/* Main Text */}
        <div>
          {/* Dynamic Content Sections */}
          {contentSections.length > 0 ? (
            <div className="space-y-10 sm:space-y-16">
              {contentSections.map((section, index) => (
                <Reveal key={index} delay={300 + index * 100}>
                  <div className={`${section.image ? 'flex flex-col gap-6 sm:gap-8' : ''}`}>
                    {section.image && (
                      <div className="w-full rounded-xl overflow-hidden shadow-elevated flex-shrink-0">
                        <img 
                          src={section.image} 
                          alt={section.heading || `Section ${index + 1}`} 
                          className="w-full h-auto object-cover aspect-video"
                          loading="lazy"
                        />
                      </div>
                    )}
                    <div>
                      {section.heading && (
                        <h3 className="font-serif text-xl sm:text-2xl md:text-3xl text-foreground mb-4 sm:mb-6 border-l-4 border-primary pl-4 sm:pl-6">
                          {section.heading}
                        </h3>
                      )}
                      <div className="prose prose-sm sm:prose-lg text-muted-foreground font-sans leading-relaxed sm:leading-loose whitespace-pre-line text-sm sm:text-base md:text-lg pl-4 sm:pl-6">
                        {section.content}
                      </div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          ) : (
            <Reveal delay={300}>
              <h3 className="font-serif text-xl sm:text-2xl md:text-3xl text-foreground mb-6 sm:mb-8 border-l-4 border-primary pl-4 sm:pl-6">
                Project Overview
              </h3>
              <div className="prose prose-sm sm:prose-lg text-muted-foreground font-sans leading-relaxed sm:leading-loose whitespace-pre-line text-sm sm:text-base md:text-lg pl-4 sm:pl-6">
                {item.detailedDescription || item.description || "No detailed description available."}
              </div>
            </Reveal>
          )}
        </div>
      </div>

      {/* 3. Gallery Section */}
      {resolvedItem.gallery && resolvedItem.gallery.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-16 sm:pb-24">
          <Reveal delay={500}>
            <div className="flex items-center justify-center gap-3 sm:gap-4 mb-10 sm:mb-16">
              <div className="h-[1px] w-8 sm:w-12 bg-border"></div>
              <h3 className="font-serif text-xl sm:text-2xl md:text-3xl text-foreground text-center flex items-center gap-2 sm:gap-3">
                <Camera className="text-primary w-5 h-5 sm:w-6 sm:h-6" /> Visual Gallery
              </h3>
              <div className="h-[1px] w-8 sm:w-12 bg-border"></div>
            </div>
          </Reveal>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {resolvedItem.gallery.map((img: string, index: number) => (
              <Reveal key={index} delay={index * 100}>
                <div className="group relative aspect-[4/3] rounded-xl sm:rounded-2xl overflow-hidden shadow-md hover:shadow-elevated hover:-translate-y-1 transition-all duration-500 ease-in-out cursor-zoom-in">
                  <img 
                    src={img} 
                    alt={`Gallery ${index + 1}`} 
                    className="w-full h-full object-cover transform scale-100 group-hover:scale-110 transition-transform duration-1000"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0">
                    <div className="p-2 sm:p-3 bg-primary-foreground/10 backdrop-blur-md rounded-full text-primary-foreground">
                      <Maximize2 size={16} className="sm:w-5 sm:h-5" />
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      )}

      <EmailModal isOpen={isEmailModalOpen} onClose={() => setIsEmailModalOpen(false)} />
    </div>
  );
};

export default PropertyDetail;
