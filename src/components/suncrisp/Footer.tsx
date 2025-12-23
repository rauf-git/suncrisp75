import { Phone, Mail } from 'lucide-react';
import { NAV_LINKS } from '@/constants';

interface FooterProps {
  onNavigate?: (page: string) => void;
}

const Footer = ({ onNavigate }: FooterProps) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-secondary pt-16 pb-8 border-t border-border font-sans">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
          {/* Column 1: Quick Links */}
          <div>
            <h3 className="font-serif text-foreground font-bold text-lg mb-6">Quick Links</h3>
            <ul className="space-y-3">
              {NAV_LINKS.slice(0, 5).map((link) => (
                <li key={link.id}>
                  <button 
                    onClick={() => onNavigate?.(link.id)}
                    className="text-muted-foreground hover:text-primary transition-colors duration-300 block w-fit text-sm font-medium"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 2: Contact Us */}
          <div>
            <h3 className="font-serif text-foreground font-bold text-lg mb-6">Contact Us</h3>
            <div className="space-y-4">
              <a 
                href="tel:+919559665556" 
                className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors duration-300 group w-fit"
              >
                <Phone className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">+91 9559665556</span>
              </a>
              <a 
                href="mailto:suncrisphospitality@gmail.com" 
                className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors duration-300 group w-fit"
              >
                <Mail className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">suncrisphospitality@gmail.com</span>
              </a>
            </div>
          </div>

          {/* Column 3: Company Address */}
          <div>
            <h3 className="font-serif text-foreground font-bold text-lg mb-6 uppercase tracking-wide">
              SUNCRISP HOSPITALITY LLP
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Door No.7-8-9, Ground Floor, Flat No.102,<br />
              Located At Harbour Park Road,<br />
              Siri Puram Area, Pandurangapuram,<br />
              Visakhkapatnam-530003
            </p>
          </div>
        </div>

        {/* Footer Bottom Bar */}
        <div className="border-t border-border pt-8 text-center text-sm text-muted-foreground">
          © {currentYear} SUNCRISP HOSPITALITY LLP. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
