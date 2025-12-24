import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '@/components/suncrisp/Navbar';
import Hero from '@/components/suncrisp/Hero';
import Properties from '@/components/suncrisp/Properties';
import RentalsByLocation from '@/components/suncrisp/RentalsByLocation';
import Services from '@/components/suncrisp/Services';
import About from '@/components/suncrisp/About';
import ContactFooter from '@/components/suncrisp/ContactFooter';
import Testimonials from '@/components/suncrisp/Testimonials';
import Footer from '@/components/suncrisp/Footer';
import PropertyDetail from '@/components/suncrisp/PropertyDetail';
import FloatingCTA from '@/components/suncrisp/FloatingCTA';
import FeaturedProjects from '@/components/suncrisp/FeaturedProjects';
import BrandStorySection from '@/components/suncrisp/BrandStorySection';
import { CONSTRUCTION_SERVICES } from '@/constants';
import { Property, Service, Experience, AboutData, ContactData } from '@/types';
import { projectService } from '@/services/projectService';
import { rentalService } from '@/services/rentalService';
import { constructionService } from '@/services/constructionService';

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
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isLoaded, setIsLoaded] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Property | null>(null);
  const [selectedSection, setSelectedSection] = useState<string>('');
  
  // Get current page from URL params, default to 'home'
  const currentPage = searchParams.get('page') || 'home';
  // Data state - separate for each section
  const [portfolioData, setPortfolioData] = useState<Property[]>([]);
  const [rentalsData, setRentalsData] = useState<Property[]>([]);
  const [constructionData, setConstructionData] = useState<Property[]>([]);
  const [hospitalityData, setHospitalityData] = useState<Property[]>([]);
  const [aboutData] = useState<AboutData>(INITIAL_ABOUT);
  const [contactData] = useState<ContactData>(INITIAL_CONTACT);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Fetch data from database - SEPARATE for each section
  useEffect(() => {
    const fetchData = async () => {
      console.log("[Index] Fetching all data from database...");
      
      // Fetch portfolio projects (from projects table)
      const { data: portfolioProjects } = await projectService.getAll();
      const mappedPortfolio: Property[] = (portfolioProjects || []).map(p => ({
        id: p.id,
        title: p.title,
        type: p.category || 'Project',
        location: p.location || '',
        price: p.short_description || '',
        image: p.image_url,
        description: p.short_description || p.description || '',
        detailedDescription: p.long_description || p.description || '',
        features: [],
        gallery: p.images || [],
        is_featured: p.is_featured,
        content_sections: ((p as unknown as Record<string, unknown>).content_sections as { heading: string; content: string; image?: string }[]) || [],
      }));
      setPortfolioData(mappedPortfolio);

      // Filter hospitality projects from portfolio (category = Hospitality)
      const hospitalityProperties: Property[] = (portfolioProjects || [])
        .filter(p => (p.category || '').toLowerCase().includes('hospitality'))
        .map(h => ({
          id: h.id,
          title: h.title,
          type: 'Hospitality',
          location: h.location || '',
          price: h.short_description || '',
          image: h.image_url || '',
          description: h.short_description || h.description || '',
          detailedDescription: h.long_description || h.description || '',
          features: [],
          gallery: h.images || [],
          content_sections: ((h as unknown as Record<string, unknown>).content_sections as { heading: string; content: string; image?: string }[]) || [],
        }));
      setHospitalityData(hospitalityProperties);

      // Fetch construction projects (from construction_projects table)
      const { data: constructionProjects, error: constructionError } = await constructionService.getAll();
      console.log("[Index] Construction projects fetched:", constructionProjects?.length, "Error:", constructionError);
      if (constructionProjects && constructionProjects.length > 0) {
        const mappedConstruction: Property[] = constructionProjects.map(c => ({
          id: c.id,
          title: c.title,
          type: c.status || 'Construction',
          location: c.address || '',
          price: c.status || '',
          image: c.thumbnail_url || '',
          description: c.description || '',
          detailedDescription: c.description || '',
          features: [c.status || 'Under Construction'],
          gallery: c.images || [],
          content_sections: ((c as unknown as Record<string, unknown>).content_sections as { heading: string; content: string; image?: string }[]) || [],
        }));
        console.log("[Index] Mapped construction:", mappedConstruction);
        setConstructionData(mappedConstruction);
      }

      // Fetch rentals (from rentals table)
      const { data: rentalItems, error: rentalError } = await rentalService.getAll();
      console.log("[Index] Rentals fetched:", rentalItems?.length, "Error:", rentalError);
      if (rentalItems && rentalItems.length > 0) {
        const mappedRentals: Property[] = rentalItems.map(r => ({
          id: r.id,
          title: r.title,
          type: 'Rental',
          location: r.address || '',
          price: r.price || '',
          image: r.thumbnail_url || '',
          description: r.short_description || '',
          detailedDescription: r.long_description || r.short_description || '',
          features: [
            r.bedrooms ? `${r.bedrooms} Beds` : '',
            r.bathrooms ? `${r.bathrooms} Baths` : '',
            r.area || '',
            ...(r.amenities || [])
          ].filter(Boolean),
          gallery: r.images || [],
          content_sections: ((r as unknown as Record<string, unknown>).content_sections as { heading: string; content: string; image?: string }[]) || [],
        }));
        console.log("[Index] Mapped rentals:", mappedRentals);
        setRentalsData(mappedRentals);
      }

      console.log("[Index] Fetch complete.");
    };

    fetchData();
  }, []);

  // Scroll to top when page changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage, selectedItem]);

  const handleNavigation = (page: string) => {
    // Navigate to brand-story page
    if (page === 'brand-story') {
      navigate('/our-brand-story');
      return;
    }
    // Update URL query param instead of local state
    if (page === 'home') {
      setSearchParams({});
    } else {
      setSearchParams({ page });
    }
    setSelectedItem(null);
    setSelectedSection('');
  };

  const handleItemClick = (section: string, item: Property | Service | Experience) => {
    // Convert Experience to Property format for detail view
    if ('priceStart' in item) {
      const exp = item as Experience & { detailedDescription?: string; gallery?: string[]; location?: string };
      const propertyItem: Property = {
        id: exp.id,
        title: exp.title,
        type: 'Hospitality',
        location: exp.location || '',
        price: exp.priceStart,
        image: exp.image,
        description: exp.description,
        detailedDescription: exp.detailedDescription || exp.description,
        features: [],
        gallery: exp.gallery || [],
      };
      setSelectedItem(propertyItem);
      setSelectedSection(section);
    } else if ('features' in item) {
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
        // Get featured projects from portfolio
        const featuredProjects = portfolioData.filter(p => p.is_featured);
        return (
          <>
            <Hero onNavigate={handleNavigation} />
            {/* Featured Portfolio Projects - shown first if available */}
            {featuredProjects.length > 0 && (
              <FeaturedProjects 
                items={featuredProjects}
                onItemClick={(item) => handleItemClick('portfolio', item)}
                onViewAll={() => handleNavigation('portfolio')}
                title="Our Portfolio"
              />
            )}
            {/* Featured Construction Projects - grid layout */}
            {constructionData.length > 0 && (
              <FeaturedProjects 
                items={constructionData.slice(0, 2)}
                onItemClick={(item) => handleItemClick('construction', item)}
                onViewAll={() => handleNavigation('construction')}
                title="Commercial Property"
                variant="grid"
              />
            )}
            {/* Brand Story Section */}
            <BrandStorySection />
            <Testimonials />
          </>
        );
      case 'portfolio':
        return (
          <div className="pt-20">
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
          <div className="pt-20">
            {constructionData.length > 0 ? (
              <Properties
                title="Construction Projects"
                subtitle="Building Excellence with Precision"
                items={constructionData}
                onItemClick={(item) => handleItemClick('construction', item)}
              />
            ) : (
              <Services
                title="Construction Services"
                items={CONSTRUCTION_SERVICES}
                onItemClick={(item) => handleItemClick('construction', item)}
              />
            )}
          </div>
        );
      case 'rentals':
        return (
          <div className="pt-20">
            <RentalsByLocation
              onItemClick={(item) => handleItemClick('rentals', item)}
            />
          </div>
        );
      case 'hospitality':
        return (
          <div className="pt-20">
            <Properties
              title="Hospitality"
              subtitle="Exceptional Hospitality Experiences"
              items={hospitalityData}
              onItemClick={(item) => handleItemClick('hospitality', item)}
            />
          </div>
        );
      case 'about':
        return (
          <div className="pt-20">
            <About data={aboutData} />
          </div>
        );
      case 'contact':
        return (
          <div className="pt-20">
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

      {/* Floating CTA Button - Right Side */}
      <FloatingCTA isVisible={!selectedItem} />

      {/* Footer - hide on contact page which has its own dark section */}
      {currentPage !== 'contact' && !selectedItem && (
        <Footer onNavigate={handleNavigation} />
      )}
    </div>
  );
};

export default Index;
