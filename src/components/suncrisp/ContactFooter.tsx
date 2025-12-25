import { Mail, Phone, MapPin, Globe } from 'lucide-react';
import Reveal from './Reveal';
import { ContactData } from '@/types';

interface ContactFooterProps {
  data: ContactData;
}

const ContactFooter = ({ data }: ContactFooterProps) => {
  return (
    <section className="min-h-screen bg-background pt-6 sm:pt-8 pb-8 sm:pb-10 flex flex-col">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 flex-grow">
        
        <Reveal>
          <div className="mb-10 sm:mb-16">
            <span className="text-primary font-sans font-bold uppercase tracking-[0.15em] sm:tracking-[0.2em] text-xs sm:text-sm mb-3 sm:mb-4 block">
              Let's Talk
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl text-foreground mb-4 sm:mb-6">
              Get in Touch
            </h2>
            <div className="h-1 w-16 sm:w-24 bg-primary rounded-full" />
          </div>
        </Reveal>

        {/* Contact Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-12 sm:mb-20">
          <Reveal>
            <div className="bg-secondary p-6 sm:p-8 lg:p-10 h-full flex flex-col justify-between group rounded-2xl sm:rounded-3xl border border-border hover:border-primary/50 transition-all shadow-sm hover:shadow-elevated">
              <div>
                <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-background rounded-xl sm:rounded-2xl flex items-center justify-center mb-6 sm:mb-8 shadow-sm group-hover:scale-110 transition-transform duration-500">
                  <Mail className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-primary" />
                </div>
                <h3 className="font-serif text-xl sm:text-2xl lg:text-3xl text-foreground mb-3 sm:mb-4">Inquiries</h3>
                <p className="text-muted-foreground mb-6 sm:mb-8 text-sm sm:text-base lg:text-lg leading-relaxed">
                  Reach out to us directly via email or phone for any construction or hospitality needs.
                </p>
              </div>
              <div className="space-y-4 sm:space-y-6">
                <a 
                  href={`mailto:${data.email}`} 
                  className="flex items-center gap-3 sm:gap-4 text-foreground hover:text-primary transition-colors group/link min-h-[44px]"
                >
                  <div className="p-2 bg-background rounded-lg group-hover/link:bg-primary group-hover/link:text-primary-foreground transition-colors flex-shrink-0">
                    <Mail size={18} className="sm:w-5 sm:h-5" />
                  </div>
                  <span className="lowercase tracking-wide text-xs sm:text-sm font-bold break-all">{data.email}</span>
                </a>
                <a 
                  href={`tel:${data.phone}`}
                  className="flex items-center gap-3 sm:gap-4 text-foreground hover:text-primary transition-colors group/link min-h-[44px]"
                >
                  <div className="p-2 bg-background rounded-lg group-hover/link:bg-primary group-hover/link:text-primary-foreground transition-colors flex-shrink-0">
                    <Phone size={18} className="sm:w-5 sm:h-5" />
                  </div>
                  <span className="uppercase tracking-wider sm:tracking-widest text-xs sm:text-sm font-bold">{data.phone}</span>
                </a>
              </div>
            </div>
          </Reveal>

          <Reveal delay={200}>
            <div className="bg-secondary p-6 sm:p-8 lg:p-10 h-full flex flex-col justify-between group rounded-2xl sm:rounded-3xl border border-border hover:border-primary/50 transition-all shadow-sm hover:shadow-elevated relative overflow-hidden">
              <div className="relative z-10">
                <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-background rounded-xl sm:rounded-2xl flex items-center justify-center mb-6 sm:mb-8 shadow-sm group-hover:scale-110 transition-transform duration-500">
                  <Globe className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-primary" />
                </div>
                <h3 className="font-serif text-xl sm:text-2xl lg:text-3xl text-foreground mb-3 sm:mb-4">Headquarters</h3>
                <div className="flex items-start gap-3 sm:gap-4 text-muted-foreground mb-6 sm:mb-8">
                  <MapPin size={20} className="sm:w-6 sm:h-6 text-primary flex-shrink-0 mt-0.5 sm:mt-1" />
                  <span className="text-sm sm:text-base lg:text-lg leading-relaxed">{data.address}</span>
                </div>
              </div>
              
              {/* Map Embed */}
              <div className="w-full h-40 sm:h-48 lg:h-56 rounded-xl sm:rounded-2xl overflow-hidden border border-border mt-auto relative z-10 grayscale hover:grayscale-0 transition-all duration-700">
                <iframe 
                  src={data.mapUrl} 
                  width="100%" 
                  height="100%" 
                  style={{ border: 0 }} 
                  allowFullScreen 
                  loading="lazy" 
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Office Location"
                />
              </div>
            </div>
          </Reveal>
        </div>

      </div>
      
      {/* Copyright Footer */}
      <div className="border-t border-border pt-6 sm:pt-8 text-center text-muted-foreground text-[10px] sm:text-xs uppercase tracking-wider sm:tracking-widest px-4">
        © {new Date().getFullYear()} Suncrisp Hospitality. All Rights Reserved.
      </div>
    </section>
  );
};

export default ContactFooter;
