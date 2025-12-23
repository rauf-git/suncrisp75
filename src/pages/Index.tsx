import { useState, useEffect } from 'react';
import { Mail } from 'lucide-react';
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
import EmailModal from '@/components/suncrisp/EmailModal';
import { RENTALS_DATA, PORTFOLIO_DATA, CONSTRUCTION_SERVICES, HOSPITALITY_DATA } from '@/constants';
import { Property, Service, Experience, AboutData, ContactData } from '@/types';
import { projectService } from '@/services/projectService';
import { rentalService } from '@/services/rentalService';

const INITIAL_ABOUT: AboutData = {
  title: "Building Futures Through Excellence",
  description: "At Suncrisp Hospitality, we believe that true luxury lies in the integrity of construction and the art of service. With experience spanning major global markets, we have cultivated a portfolio that stands as a testament to quality.\n\nWe don't just build structures; we create environments. From the foundation to the final guest experience, our integrated approach ensures every detail resonates with purpose and elegance.",
  image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600&h=800&fit=crop&q=80"
};

const INITIAL_CONTACT: ContactData = {
  email: "suncrisphospitality@gmail.com",
  phone: "+91 9559665556",
  address: "Door No.7-8-9, Ground Floor, Flat No.102, Harbour Park Road, Siri Puram Area, Pandurangapuram, Visakhkapatnam-530003",
  mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3800.4835815693146!2d83.2956!3d17.7275!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTfCsDQzJzM5LjAiTiA4M8KwMTcnNDQuMCJF!5e0!3m2!1sen!2sin!4v1709462800000!5m2!1sen!2sin"
};

const Index = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedItem, setSelectedItem] = useState<Property | null>(null);
  const [selectedSection, setSelectedSection] = useState<string>('');
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);

  // Data state - initialized with static data, then updated from database
  const [portfolioData, setPortfolioData] = useState<Property[]>(PORTFOLIO_DATA);
  const [rentalsData, setRentalsData] = useState<Property[]>(RENTALS_DATA);
  const [constructionData] = useState<Service[]>(CONSTRUCTION_SERVICES);
  const [hospitalityData, setHospitalityData] = useState<Experience[]>(HOSPITALITY_DATA);
  const [aboutData] = useState<AboutData>(INITIAL_ABOUT);
  const [contactData] = useState<ContactData>(INITIAL_CONTACT);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Fetch data from database
  useEffect(() => {
    const fetchData = async () => {
      // Fetch portfolio projects
      const { data: portfolioProjects } = await projectService.getAll();
      if (portfolioProjects && portfolioProjects.length > 0) {
        const mappedPortfolio: Property[] = portfolioProjects
          .filter(p => p.category?.toLowerCase() !== 'hospitality')
          .map(p => ({
            id: p.id,
            title: p.title,
            type: p.category || 'Project',
            location: p.location || '',
            price: '',
            image: p.image_url,
            description: p.description || '',
            features: []
          }));
        if (mappedPortfolio.length > 0) {
          setPortfolioData(mappedPortfolio);
        }
      }

      // Fetch hospitality projects
      const { data: hospitalityProjects } = await projectService.getByCategory('hospitality');
      if (hospitalityProjects && hospitalityProjects.length > 0) {
        const mappedHospitality: Experience[] = hospitalityProjects.map(p => ({
          id: p.id,
          title: p.title,
          description: p.description || '',
          image: p.image_url,
          priceStart: p.short_description || 'Inquire for pricing'
        }));
        setHospitalityData(mappedHospitality);
      }

      // Fetch rentals
      const { data: rentalItems } = await rentalService.getAll();
      if (rentalItems && rentalItems.length > 0) {
        const mappedRentals: Property[] = rentalItems.map(r => ({
          id: r.id,
          title: r.title,
          type: 'Rental',
          location: r.address || '',
          price: r.price || '',
          image: r.thumbnail_url || '',
          description: r.short_description || '',
          features: [
            r.bedrooms ? `${r.bedrooms} Beds` : '',
            r.bathrooms ? `${r.bathrooms} Baths` : '',
            r.area || '',
            ...(r.amenities || [])
          ].filter(Boolean)
        }));
        if (mappedRentals.length > 0) {
          setRentalsData(mappedRentals);
        }
      }
    };

    fetchData();
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
          section={selectedSection}
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

      {/* Floating Email Button */}
      {!selectedItem && (
        <button
          onClick={() => setIsEmailModalOpen(true)}
          className="fixed bottom-8 left-8 z-40 bg-card text-foreground p-4 rounded-full shadow-elevated border border-border transition-all duration-300 hover:scale-105 hover:border-primary group"
          aria-label="Contact Us"
        >
          <Mail className="w-6 h-6 text-primary" />
          <span className="absolute left-full ml-4 top-1/2 -translate-y-1/2 bg-foreground text-background text-xs font-bold uppercase tracking-widest px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-lg">
            Contact Us
          </span>
        </button>
      )}

      {/* Email Modal */}
      <EmailModal 
        isOpen={isEmailModalOpen} 
        onClose={() => setIsEmailModalOpen(false)} 
      />

      {/* Footer - hide on contact page which has its own dark section */}
      {currentPage !== 'contact' && !selectedItem && (
        <Footer onNavigate={handleNavigation} />
      )}
    </div>
  );
};

export default Index;
