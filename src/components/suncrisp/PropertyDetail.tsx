import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, MapPin, Tag, Camera, Maximize2, Check } from 'lucide-react';
import Reveal from './Reveal';
import { Property } from '@/types';
import { projectService } from '@/services/projectService';
import { constructionService } from '@/services/constructionService';
import { rentalService } from '@/services/rentalService';

interface PropertyDetailProps {
  item: Property;
  section?: string;
  onBack: () => void;
}

const PropertyDetail = ({ item, section = 'property', onBack }: PropertyDetailProps) => {
  const [resolvedItem, setResolvedItem] = useState<Property>(item);

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
          content_sections: (data.content_sections as { heading: string; content: string }[] | null) || [],
        });
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
          content_sections: (data.content_sections as { heading: string; content: string }[] | null) || [],
        });
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
          content_sections: (data.content_sections as { heading: string; content: string }[] | null) || [],
        });
      }
    };

    fetchLatest();
    return () => {
      isMounted = false;
    };
  }, [item.id, section]);

  const contentSections = useMemo(() => resolvedItem.content_sections || [], [resolvedItem.content_sections]);

  return (
    <div className="bg-background min-h-screen pb-24 relative">
      
      {/* 1. Hero Section */}
      <div className="relative w-full h-[60vh] md:h-[75vh] overflow-hidden group">
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
        <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-start z-30 pt-24 md:pt-32">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-primary-foreground hover:text-primary bg-foreground/20 hover:bg-foreground/40 px-5 py-2.5 rounded-full transition-all backdrop-blur-md border border-primary-foreground/10"
          >
            <ArrowLeft size={18} /> 
            <span className="uppercase tracking-widest text-xs font-bold">Back</span>
          </button>
        </div>

        <div className="absolute bottom-0 left-0 w-full p-8 md:p-16 text-primary-foreground z-20">
          <div className="max-w-7xl mx-auto">
            <Reveal>
              <div className="flex items-center gap-3 mb-6">
                <span className="bg-primary px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest text-primary-foreground shadow-lg">
                  {section}
                </span>
                {item.type && (
                  <span className="flex items-center gap-1 text-[10px] uppercase tracking-widest text-primary-foreground/70 font-medium bg-primary-foreground/10 px-3 py-1 rounded-md backdrop-blur-sm">
                    <Tag size={12} /> {item.type}
                  </span>
                )}
              </div>
            </Reveal>
            <Reveal delay={100}>
                <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight tracking-tight text-primary-foreground">
                  {resolvedItem.title}
                </h1>
            </Reveal>
            <Reveal delay={200}>
              <div className="flex flex-col sm:flex-row sm:items-center gap-6 text-primary-foreground/80 font-sans border-t border-primary-foreground/10 pt-6 mt-6">
                {resolvedItem.location && (
                  <div className="flex items-center gap-2">
                    <MapPin size={20} className="text-primary" />
                    <span className="text-lg">{resolvedItem.location}</span>
                  </div>
                )}
                {resolvedItem.price && (
                  <>
                    <div className="hidden sm:block w-1 h-1 bg-primary-foreground/50 rounded-full" />
                    <div className="text-xl font-serif text-primary-foreground">
                      {resolvedItem.price}
                    </div>
                  </>
                )}
              </div>
            </Reveal>
          </div>
        </div>
      </div>

      {/* 2. Content Section */}
      <div className="max-w-7xl mx-auto px-6 py-20 md:py-32 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24">
        
        {/* Main Text */}
        <div className="lg:col-span-7">
          {/* Dynamic Content Sections */}
          {contentSections.length > 0 ? (
            <div className="space-y-12">
              {contentSections.map((section, index) => (
                <Reveal key={index} delay={300 + index * 100}>
                  <div>
                    {section.heading && (
                      <h3 className="font-serif text-3xl text-foreground mb-6 border-l-4 border-primary pl-6">
                        {section.heading}
                      </h3>
                    )}
                    <div className="prose prose-lg text-muted-foreground font-sans leading-loose whitespace-pre-line text-lg pl-6">
                      {section.content}
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          ) : (
            <Reveal delay={300}>
              <h3 className="font-serif text-3xl text-foreground mb-8 border-l-4 border-primary pl-6">
                Project Overview
              </h3>
              <div className="prose prose-lg text-muted-foreground font-sans leading-loose whitespace-pre-line text-lg pl-6">
                {item.detailedDescription || item.description || "No detailed description available."}
              </div>
            </Reveal>
          )}
        </div>

        {/* Features Sidebar */}
        <div className="lg:col-span-5">
          {item.features && item.features.length > 0 && (
            <Reveal delay={400}>
              <div className="bg-secondary p-8 rounded-3xl border border-border shadow-sm sticky top-32">
                <h4 className="font-serif text-xl text-foreground mb-8 flex items-center gap-3">
                  <span className="w-8 h-[2px] bg-primary"></span>
                  Key Features
                </h4>
                <div className="grid grid-cols-1 gap-4">
                  {item.features.map((feature: string, idx: number) => (
                    <div key={idx} className="flex items-center gap-4 text-foreground/80 group">
                      <div className="w-10 h-10 rounded-full bg-card flex items-center justify-center border border-border group-hover:border-primary/50 transition-colors">
                        <Check className="w-4 h-4 text-primary" />
                      </div>
                      <span className="font-medium">{feature}</span>
                    </div>
                  ))}
                </div>
                
                <button className="w-full btn-primary rounded-xl mt-8">
                  Schedule a Viewing
                </button>
              </div>
            </Reveal>
          )}
        </div>
      </div>

      {/* 3. Gallery Section */}
      {resolvedItem.gallery && resolvedItem.gallery.length > 0 && (
        <div className="max-w-7xl mx-auto px-6 pb-24">
          <Reveal delay={500}>
            <div className="flex items-center justify-center gap-4 mb-16">
              <div className="h-[1px] w-12 bg-border"></div>
              <h3 className="font-serif text-3xl text-foreground text-center flex items-center gap-3">
                <Camera className="text-primary" /> Visual Gallery
              </h3>
              <div className="h-[1px] w-12 bg-border"></div>
            </div>
          </Reveal>
          
          <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
            {resolvedItem.gallery.map((img: string, index: number) => (
              <Reveal key={index} delay={index * 100}>
                <div className="group relative break-inside-avoid rounded-2xl overflow-hidden shadow-md hover:shadow-elevated hover:-translate-y-1 transition-all duration-500 ease-in-out cursor-zoom-in">
                  <img 
                    src={img} 
                    alt={`Gallery ${index}`} 
                    className="w-full h-auto object-cover transform scale-100 group-hover:scale-110 transition-transform duration-1000"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0">
                    <div className="p-3 bg-primary-foreground/10 backdrop-blur-md rounded-full text-primary-foreground">
                      <Maximize2 size={20} />
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyDetail;
