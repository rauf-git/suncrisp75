import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Navbar from '@/components/suncrisp/Navbar';
import Footer from '@/components/suncrisp/Footer';
import Reveal from '@/components/suncrisp/Reveal';
import { pageContentService, ContentSection } from '@/services/pageContentService';

const AboutUs = () => {
  const navigate = useNavigate();
  const [isLoaded, setIsLoaded] = useState(false);
  const [pageData, setPageData] = useState<{
    title: string;
    subtitle: string;
    heroImage: string;
    contentSections: ContentSection[];
  }>({
    title: 'About SunCrisp',
    subtitle: 'Our Story of Excellence',
    heroImage: '',
    contentSections: [],
  });

  useEffect(() => {
    window.scrollTo(0, 0);
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const fetchContent = async () => {
    const { data } = await pageContentService.getByKey('about-us');
    if (data) {
      setPageData({
        title: data.title || 'About SunCrisp',
        subtitle: data.subtitle || 'Our Story of Excellence',
        heroImage: data.hero_image || '',
        contentSections: data.content_sections || [],
      });
    }
  };

  useEffect(() => {
    fetchContent();
  }, []);

  // Listen for CMS updates
  useEffect(() => {
    const handleContentUpdate = (event: CustomEvent) => {
      if (event.detail?.page_key === 'about-us') {
        fetchContent();
      }
    };

    window.addEventListener('page-content-updated', handleContentUpdate as EventListener);
    return () => {
      window.removeEventListener('page-content-updated', handleContentUpdate as EventListener);
    };
  }, []);

  const handleNavigation = (page: string) => {
    if (page === 'home') {
      navigate('/');
    } else {
      navigate(`/?page=${page}`);
    }
  };

  return (
    <div className={`min-h-screen bg-background transition-opacity duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
      <Navbar currentPage="about" onNavigate={handleNavigation} />

      {/* Hero Section - Same as PropertyDetail */}
      <div className="relative w-full h-[60vh] md:h-[75vh] overflow-hidden group">
        <div className="absolute inset-0 bg-foreground z-0" />
        {pageData.heroImage && (
          <img 
            src={pageData.heroImage} 
            alt={pageData.title} 
            className="w-full h-full object-cover animate-zoom-out opacity-90"
          />
        )}
        
        {/* Gradients for readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-foreground via-foreground/40 to-transparent opacity-90" />
        <div className="absolute inset-0 bg-gradient-to-b from-foreground/50 via-transparent to-transparent opacity-60" />
        
        {/* Navigation Overlay */}
        <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-start z-30 pt-24 md:pt-32">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-primary-foreground hover:text-primary bg-foreground/20 hover:bg-foreground/40 px-5 py-2.5 rounded-full transition-all backdrop-blur-md border border-primary-foreground/10"
          >
            <ArrowLeft size={18} /> 
            <span className="uppercase tracking-widest text-xs font-bold">Back</span>
          </button>
        </div>

        {/* Hero Content */}
        <div className="absolute bottom-0 left-0 w-full p-8 md:p-16 text-primary-foreground z-20">
          <div className="max-w-7xl mx-auto">
            <Reveal>
              <div className="flex items-center gap-3 mb-6">
                <span className="bg-primary px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest text-primary-foreground shadow-lg">
                  About Us
                </span>
              </div>
            </Reveal>
            <Reveal delay={100}>
              <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight tracking-tight text-primary-foreground">
                {pageData.title}
              </h1>
            </Reveal>
            <Reveal delay={200}>
              <div className="flex flex-col sm:flex-row sm:items-center gap-6 text-primary-foreground/80 font-sans border-t border-primary-foreground/10 pt-6 mt-6">
                <span className="text-lg md:text-xl">{pageData.subtitle}</span>
              </div>
            </Reveal>
          </div>
        </div>
      </div>

      {/* Content Sections - Same layout as PropertyDetail */}
      <div className="max-w-7xl mx-auto px-6 py-20 md:py-32">
        {pageData.contentSections.length > 0 ? (
          <div className="space-y-16">
            {pageData.contentSections.map((section, index) => (
              <Reveal key={index} delay={300 + index * 100}>
                <div className={`flex flex-col ${section.image ? 'lg:flex-row lg:gap-12 lg:items-start' : ''} ${index % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}>
                  {section.image && (
                    <div className="mb-8 lg:mb-0 lg:w-1/2 lg:flex-shrink-0 rounded-2xl overflow-hidden shadow-elevated">
                      <img 
                        src={section.image} 
                        alt={section.heading || `Section ${index + 1}`} 
                        className="w-full h-auto object-cover aspect-video" 
                        loading="lazy" 
                      />
                    </div>
                  )}
                  <div className={section.image ? 'lg:w-1/2' : 'max-w-4xl'}>
                    {section.heading && (
                      <h3 className="font-serif text-3xl text-foreground mb-6 border-l-4 border-primary pl-6">
                        {section.heading}
                      </h3>
                    )}
                    <div className="prose prose-lg text-muted-foreground font-sans leading-loose whitespace-pre-line text-lg pl-6">
                      {section.content}
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        ) : (
          <Reveal delay={300}>
            <div className="max-w-4xl">
              <h3 className="font-serif text-3xl text-foreground mb-8 border-l-4 border-primary pl-6">
                About SunCrisp
              </h3>
              <div className="prose prose-lg text-muted-foreground font-sans leading-loose text-lg pl-6">
                Discover our journey of excellence and commitment to quality.
              </div>
            </div>
          </Reveal>
        )}
      </div>

      <Footer onNavigate={handleNavigation} />
    </div>
  );
};

export default AboutUs;
