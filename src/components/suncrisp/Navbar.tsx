import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, Menu, X } from 'lucide-react';
import { NAV_LINKS } from '@/constants';
import { ThemeToggle } from '@/components/ThemeToggle';
import suncrespLogo from '@/assets/suncrisp-logo.png';

interface NavbarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

const Navbar = ({ currentPage, onNavigate }: NavbarProps) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleNavClick = (id: string) => {
    onNavigate(id);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-background/95 backdrop-blur-xl py-1 shadow-sm'
            : 'bg-background/80 backdrop-blur-lg py-1.5'
        }`}
        style={{
          WebkitBackdropFilter: 'blur(16px)',
        }}
      >
        <div className="max-w-7xl mx-auto px-3 md:px-6">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <button
              onClick={() => handleNavClick('home')}
              className="hover:opacity-80 transition-all duration-300 hover:scale-105 active:scale-95 flex-shrink-0"
            >
              <img 
                src={suncrespLogo} 
                alt="SunCrisp Hospitality" 
                className={`w-auto transition-all duration-300 ${isScrolled ? 'h-8 md:h-10' : 'h-10 md:h-12'}`}
              />
            </button>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-3">
              {NAV_LINKS.map((link) => (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link.id)}
                  className={`relative whitespace-nowrap px-3 py-2 transition-all duration-300 text-xs font-bold uppercase tracking-wider group ${
                    currentPage === link.id 
                      ? 'text-primary' 
                      : 'text-foreground/80 hover:text-primary'
                  }`}
                >
                  {link.label}
                  <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-primary transform origin-left transition-transform duration-300 ${
                    currentPage === link.id ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                  }`} />
                </button>
              ))}
              
              <div className="flex items-center gap-0.5 pl-2 border-l border-border/50 flex-shrink-0">
                <ThemeToggle />
                <button
                  onClick={() => navigate('/admin')}
                  className="p-1.5 rounded-full hover:bg-primary/15 transition-all duration-300 hover:scale-110 active:scale-95"
                  title="Admin Panel"
                >
                  <Settings className="w-3.5 h-3.5 text-foreground/90 hover:text-primary transition-colors" />
                </button>
              </div>
            </div>

            {/* Mobile/Tablet Menu Button */}
            <div className="flex lg:hidden items-center gap-2">
              <ThemeToggle />
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-lg bg-primary/10 hover:bg-primary/20 transition-all duration-300"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? (
                  <X className="w-5 h-5 text-foreground" />
                ) : (
                  <Menu className="w-5 h-5 text-foreground" />
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile/Tablet Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-foreground/40 backdrop-blur-sm animate-fade-in"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          
          {/* Menu Panel */}
          <div 
            className="absolute top-0 right-0 w-72 h-full bg-background/95 backdrop-blur-xl border-l border-border shadow-2xl animate-slide-in-right"
            style={{
              WebkitBackdropFilter: 'blur(20px)',
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <span className="font-serif text-lg text-foreground">Menu</span>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 rounded-lg hover:bg-muted transition-colors"
              >
                <X className="w-5 h-5 text-foreground" />
              </button>
            </div>
            
            {/* Nav Links */}
            <div className="p-4 space-y-2">
              {NAV_LINKS.map((link, index) => (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link.id)}
                  className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-300 text-sm font-bold uppercase tracking-wider ${
                    currentPage === link.id 
                      ? 'bg-primary text-primary-foreground shadow-md' 
                      : 'text-foreground hover:bg-primary/10 hover:text-primary'
                  }`}
                  style={{
                    animationDelay: `${index * 50}ms`,
                  }}
                >
                  {link.label}
                </button>
              ))}
              
              <div className="pt-4 mt-4 border-t border-border">
                <button
                  onClick={() => {
                    navigate('/admin');
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-foreground hover:bg-primary/10 hover:text-primary transition-all duration-300"
                >
                  <Settings className="w-4 h-4" />
                  <span className="text-sm font-bold uppercase tracking-wider">Admin Panel</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;