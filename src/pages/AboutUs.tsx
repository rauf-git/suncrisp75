import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/suncrisp/Navbar';
import Footer from '@/components/suncrisp/Footer';
import PageHeroSplit from '@/components/suncrisp/PageHeroSplit';
import ContentSections from '@/components/suncrisp/ContentSections';
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
    <div className={`min-h-screen transition-opacity duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
      <Navbar currentPage="about" onNavigate={handleNavigation} />

      <main className="pt-20">
        <PageHeroSplit
          title={pageData.title}
          subtitle={pageData.subtitle}
          heroImage={pageData.heroImage}
        />

        <ContentSections sections={pageData.contentSections} />
      </main>

      <Footer onNavigate={handleNavigation} />
    </div>
  );
};

export default AboutUs;
