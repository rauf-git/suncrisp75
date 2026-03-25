import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Phone, Mail, Instagram, Facebook, Youtube } from "lucide-react";
import { NAV_LINKS } from "@/constants";
import { PAGE_ROUTES } from "@/pages/Index";
import suncrespLogo from "@/assets/suncrisp-logo-orange.png";
import { pageBlockService } from "@/services/pageBlockService";

interface SocialLinks {
  instagram?: string;
  facebook?: string;
  youtube?: string;
}

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [socialLinks, setSocialLinks] = useState<SocialLinks>({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSocialLinks = async () => {
      const { data } = await pageBlockService.getByKey("home", "social_links");
      if (data) {
        setSocialLinks(data.content as SocialLinks);
      }
    };
    fetchSocialLinks();

    const handleUpdate = (e: CustomEvent) => {
      if (e.detail?.block_key === "social_links") {
        fetchSocialLinks();
      }
    };
    window.addEventListener("page-block-updated", handleUpdate as EventListener);
    return () => window.removeEventListener("page-block-updated", handleUpdate as EventListener);
  }, []);

  const handleNavigate = (id: string) => {
    const route = PAGE_ROUTES[id];
    if (route) {
      navigate(route);
    } else {
      navigate('/');
    }
  };

  return (
    <footer className="bg-secondary pt-10 pb-6 border-t border-border font-sans">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Column 1: Quick Links */}
          <div>
            <h3 className="font-serif text-foreground font-bold text-lg mb-6">Quick Links</h3>
            <ul className="space-y-3">
              {NAV_LINKS.slice(0, 5).map((link) => (
                <li key={link.id}>
                  <button
                    onClick={() => handleNavigate(link.id)}
                    className="text-muted-foreground hover:text-primary transition-colors duration-300 block w-fit text-sm font-medium"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
              <li>
                <button
                  onClick={() => handleNavigate("brand-story")}
                  className="text-muted-foreground hover:text-primary transition-colors duration-300 block w-fit text-sm font-medium"
                >
                  OUR BRAND STORY
                </button>
              </li>
            </ul>
          </div>

          {/* Column 2: Contact Us */}
          <div>
            <h3 className="font-serif text-foreground font-bold text-lg mb-6">Contact Us</h3>
            <div className="space-y-4">
              <a
                href="tel:+919997268880"
                className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors duration-300 group w-fit"
              >
                <Phone className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">+91 9997268880</span>
              </a>
              <a
                href="tel:+9108912726888"
                className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors duration-300 group w-fit"
              >
                <Phone className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">0891-2726888</span>
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

          {/* Column 3: Follow Us */}
          <div>
            <h3 className="font-serif text-foreground font-bold text-lg mb-6">Follow Us</h3>
            <div className="flex items-center gap-4">
              {socialLinks.instagram && (
                <a
                  href={socialLinks.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-colors duration-300"
                  aria-label="Instagram"
                >
                  <Instagram className="w-5 h-5" />
                </a>
              )}
              {socialLinks.facebook && (
                <a
                  href={socialLinks.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-colors duration-300"
                  aria-label="Facebook"
                >
                  <Facebook className="w-5 h-5" />
                </a>
              )}
              {socialLinks.youtube && (
                <a
                  href={socialLinks.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-colors duration-300"
                  aria-label="YouTube"
                >
                  <Youtube className="w-5 h-5" />
                </a>
              )}
              {!socialLinks.instagram && !socialLinks.facebook && !socialLinks.youtube && (
                <p className="text-muted-foreground text-sm">Coming soon</p>
              )}
            </div>
          </div>

          {/* Column 4: Company Address */}
          <div>
            <img src={suncrespLogo} alt="SunCrisp Hospitality" className="h-20 w-auto mb-2" />
            <p className="font-serif text-foreground font-bold text-sm mb-4">SUNCRISP HOSPITALITY LLP</p>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Door No.7-8-9, Ground Floor, Flat No.102,
              <br />
              Located At Harbour Park Road,
              <br />
              Siri Puram Area, Pandurangapuram,
              <br />
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
