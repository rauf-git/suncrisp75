import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings } from 'lucide-react';
import { NAV_LINKS } from '@/constants';
import { ThemeToggle } from '@/components/ThemeToggle';
import suncrespLogo from '@/assets/suncrisp-logo.png';

interface NavbarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

const Navbar = ({ currentPage, onNavigate }: NavbarProps) => {
  const [isScrolled, setIsScrolled] = useState(false);
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
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? 'bg-card/95 dark:bg-card/95 backdrop-blur-xl py-2 shadow-lg border-b border-border'
          : 'bg-card/80 dark:bg-card/90 backdrop-blur-lg py-4 border-b border-border/30'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <button
            onClick={() => handleNavClick('home')}
            className="hover:opacity-80 transition-all duration-300 hover:scale-105 active:scale-95 flex-shrink-0"
          >
            <img 
              src={suncrespLogo} 
              alt="SunCrisp Hospitality" 
              className={`w-auto transition-all duration-300 ${isScrolled ? 'h-7 md:h-9' : 'h-8 md:h-10'}`}
            />
          </button>

          {/* Navigation - Always visible, horizontally scrollable on mobile */}
          <div className="flex items-center gap-1 md:gap-3 overflow-x-auto scrollbar-hide">
            {NAV_LINKS.map((link) => (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                className={`relative whitespace-nowrap px-2.5 py-1.5 md:px-3.5 md:py-2 rounded-lg transition-all duration-300 text-[10px] md:text-xs font-bold uppercase tracking-wider ${
                  currentPage === link.id 
                    ? 'bg-primary text-primary-foreground shadow-md' 
                    : 'text-foreground hover:bg-primary/15 hover:text-primary'
                }`}
              >
                {link.label}
              </button>
            ))}
            
            <div className="flex items-center gap-1 pl-2 md:pl-3 border-l border-border flex-shrink-0">
              <ThemeToggle />
              <button
                onClick={() => navigate('/admin')}
                className="p-2 rounded-full hover:bg-primary/15 transition-all duration-300 hover:scale-110 active:scale-95"
                title="Admin Panel"
              >
                <Settings className="w-4 h-4 text-foreground hover:text-primary transition-colors" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
