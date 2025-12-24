import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/suncrisp/Navbar';
import Footer from '@/components/suncrisp/Footer';
import Reveal from '@/components/suncrisp/Reveal';
import { pageContentService, ContentSection } from '@/services/pageContentService';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
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
    fetchContent();
  }, []);

  const handleNavigation = (page: string) => {
    if (page === 'home') {
      navigate('/');
    } else {
      navigate(`/?page=${page}`);
    }
  };

  return (
    <div className={`min-h-screen transition-opacity duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
      <Navbar currentPage="about" onNavigate={handleNavigation} />

      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative py-20 overflow-hidden">
          {pageData.heroImage && (
            <div 
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: `url('${pageData.heroImage}')` }}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />
          
          <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12">
            <Reveal>
              <Button 
                variant="ghost" 
                onClick={() => navigate('/')}
                className="mb-6 text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Reveal>

            <Reveal delay={200}>
              <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold mb-4 tracking-tight">
                {pageData.title}
              </h1>
            </Reveal>

            <Reveal delay={300}>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl">
                {pageData.subtitle}
              </p>
            </Reveal>
          </div>
        </section>

        {/* Content Sections */}
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-6 md:px-12">
            {pageData.contentSections.length > 0 ? (
              <div className="space-y-12">
                {pageData.contentSections.map((section, index) => (
                  <Reveal key={index} delay={index * 100}>
                    <div className="prose prose-lg max-w-none">
                      {section.heading && (
                        <h2 className="font-serif text-2xl md:text-3xl font-semibold mb-4 text-foreground">
                          {section.heading}
                        </h2>
                      )}
                      <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                        {section.content}
                      </p>
                    </div>
                    {index < pageData.contentSections.length - 1 && (
                      <div className="mt-12 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
                    )}
                  </Reveal>
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <p className="text-muted-foreground">Content coming soon...</p>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer onNavigate={handleNavigation} />
    </div>
  );
};

export default AboutUs;
