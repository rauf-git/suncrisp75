import { useState, useEffect } from 'react';
import Navbar from '@/components/suncrisp/Navbar';
import Hero from '@/components/suncrisp/Hero';
import Properties from '@/components/suncrisp/Properties';
import Experiences from '@/components/suncrisp/Experiences';
import Services from '@/components/suncrisp/Services';
import About from '@/components/suncrisp/About';
import ContactFooter from '@/components/suncrisp/ContactFooter';
import Testimonials from '@/components/suncrisp/Testimonials';
import Footer from '@/components/suncrisp/Footer';
import PropertyDetail from '@/components/suncrisp/PropertyDetail';
import { RENTALS_DATA, PORTFOLIO_DATA, CONSTRUCTION_SERVICES, HOSPITALITY_DATA } from '@/constants';
import { Property, Service, Experience, AboutData, ContactData } from '@/types';

const INITIAL_ABOUT: AboutData = {
  title: "Building Futures Through Excellence",
  description: "At Suncrisp Hospitality, we believe that true luxury lies in the integrity of construction and the art of service. With experience spanning major global markets, we have cultivated a portfolio that stands as a testament to quality. We don't just build structures; we create environments. From the foundation to the final guest experience, our integrated approach ensures every detail resonates with purpose and elegance.",
  image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600&h=800&fit=crop&q=80"
};

const INITIAL_CONTACT: ContactData = {
  email: "contact@suncrisphospitality.com",
  phone: "+1 (555) 123-4567",
  address: "Dubai Design District, UAE",
  mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3610.1786539269224!2d55.29377407595462!3d25.197196977712395!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e5f428383853173%3A0x6b42b9370773070!2sDubai%20Design%20District!5e0!3m2!1sen!2sae!4v1709462800000!5m2!1sen!2sae"
};

const Index = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedItem, setSelectedItem] = useState<Property | null>(null);
  const [selectedSection, setSelectedSection] = useState<string>('');

  // Data state
  const [portfolioData] = useState<Property[]>(PORTFOLIO_DATA);
  const [rentalsData] = useState<Property[]>(RENTALS_DATA);
  const [constructionData] = useState<Service[]>(CONSTRUCTION_SERVICES);
  const [hospitalityData] = useState<Experience[]>(HOSPITALITY_DATA);
  const [aboutData] = useState<AboutData>(INITIAL_ABOUT);
  const [contactData] = useState<ContactData>(INITIAL_CONTACT);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Scroll to top when page changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage, selectedItem]);

  const handleNavigation = (page: string) => {
    setCurrentPage(page);
    setSelectedItem(null);
    setSelectedSection('');
  };

  const handleItemClick = (section: string, item: Property | Service | Experience) => {
    if ('features' in item) {
      // It's a Property
      setSelectedItem(item as Property);
      setSelectedSection(section);
    }
  };

  const handleBack = () => {
    setSelectedItem(null);
    setSelectedSection('');
  };

  const renderPage = () => {
    // Show detail view if an item is selected
    if (selectedItem) {
      return (
        <PropertyDetail 
          item={selectedItem} 
          onBack={handleBack}
        />
      );
    }

    switch (currentPage) {
      case 'home':
        return (
          <>
            <Hero onNavigate={handleNavigation} />
            <Testimonials />
          </>
        );
      case 'portfolio':
        return (
          <div className="pt-24">
            <Properties
              title="Our Portfolio"
              subtitle="Showcasing Excellence in Development & Design"
              items={portfolioData}
              onItemClick={(item) => handleItemClick('portfolio', item)}
            />
          </div>
        );
      case 'construction':
        return (
          <div className="pt-24">
            <Services
              title="Construction Services"
              items={constructionData}
              onItemClick={(item) => handleItemClick('construction', item)}
            />
          </div>
        );
      case 'rentals':
        return (
          <div className="pt-24">
            <Properties
              title="Luxury Rentals"
              subtitle="Exclusive Properties for Short & Long Term Stays"
              items={rentalsData}
              onItemClick={(item) => handleItemClick('rentals', item)}
            />
          </div>
        );
      case 'hospitality':
        return (
          <div className="pt-24">
            <Experiences
              items={hospitalityData}
              onItemClick={(item) => handleItemClick('hospitality', item)}
            />
          </div>
        );
      case 'about':
        return (
          <div className="pt-24">
            <About data={aboutData} />
          </div>
        );
      case 'contact':
        return (
          <div className="pt-24">
            <ContactFooter data={contactData} />
          </div>
        );
      default:
        return <Hero onNavigate={handleNavigation} />;
    }
  };

  return (
    <div className={`min-h-screen transition-opacity duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
      <Navbar 
        currentPage={currentPage} 
        onNavigate={handleNavigation}
      />

      <main>
        {renderPage()}
      </main>

      {/* Footer - hide on contact page which has its own dark section */}
      {currentPage !== 'contact' && !selectedItem && (
        <Footer onNavigate={handleNavigation} />
      )}
    </div>
  );
};

export default Index;
