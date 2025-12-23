import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X, Settings } from 'lucide-react';
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

  const handleNavClick = (id: string) => {
    onNavigate(id);
    setIsMobileMenuOpen(false);
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? 'bg-background/70 dark:bg-background/80 backdrop-blur-xl backdrop-saturate-150 py-3 shadow-soft border-b border-border/50'
          : 'bg-transparent py-6'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <button
            onClick={() => handleNavClick('home')}
            className="hover:opacity-80 transition-all duration-300 hover:scale-105 active:scale-95"
          >
            <img 
              src={suncrespLogo} 
              alt="SunCrisp Hospitality" 
              className={`w-auto transition-all duration-300 ${isScrolled ? 'h-8 md:h-10' : 'h-10 md:h-12'}`}
            />
          </button>

          {/* Desktop Navigation - Always visible on lg+ */}
          <div className="hidden lg:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                className={`relative nav-link group overflow-hidden ${
                  currentPage === link.id ? 'nav-link-active' : ''
                }`}
              >
                <span className="relative z-10">{link.label}</span>
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
              </button>
            ))}
            
            <div className="flex items-center gap-2 pl-4 border-l border-border/50">
              <ThemeToggle />
              <button
                onClick={() => navigate('/admin')}
                className="p-2 rounded-full hover:bg-primary/10 transition-all duration-300 hover:scale-110 active:scale-95"
                title="Admin Panel"
              >
                <Settings className="w-4 h-4 text-foreground/70 hover:text-primary transition-colors" />
              </button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-foreground hover:text-primary transition-all duration-300 hover:scale-110 active:scale-95"
              aria-label="Toggle menu"
            >
              <div className="relative w-6 h-6">
                <X className={`absolute inset-0 w-6 h-6 transition-all duration-300 ${isMobileMenuOpen ? 'rotate-0 opacity-100' : 'rotate-90 opacity-0'}`} />
                <Menu className={`absolute inset-0 w-6 h-6 transition-all duration-300 ${isMobileMenuOpen ? '-rotate-90 opacity-0' : 'rotate-0 opacity-100'}`} />
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={`lg:hidden overflow-hidden transition-all duration-500 ease-out ${
            isMobileMenuOpen ? 'max-h-[400px] opacity-100 mt-6' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="flex flex-col gap-1 pb-6 bg-background/50 dark:bg-background/70 backdrop-blur-lg rounded-xl p-4 border border-border/30">
            {NAV_LINKS.map((link, index) => (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                style={{ animationDelay: `${index * 50}ms` }}
                className={`text-left py-3 px-4 rounded-lg nav-link transition-all duration-300 hover:bg-primary/10 hover:translate-x-1 ${
                  currentPage === link.id ? 'bg-primary/10 nav-link-active' : ''
                } ${isMobileMenuOpen ? 'animate-fade-in' : ''}`}
              >
                {link.label}
              </button>
            ))}
            <button
              onClick={() => navigate('/admin')}
              className="text-left py-3 px-4 rounded-lg nav-link flex items-center gap-2 transition-all duration-300 hover:bg-primary/10 hover:translate-x-1"
            >
              <Settings className="w-4 h-4" />
              Admin Panel
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
