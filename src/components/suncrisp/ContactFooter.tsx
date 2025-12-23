import { Mail, Phone, MapPin, Linkedin, Globe } from 'lucide-react';
import Reveal from './Reveal';
import { ContactData } from '@/types';

interface ContactFooterProps {
  data: ContactData;
}

const ContactFooter = ({ data }: ContactFooterProps) => {
  return (
    <section className="min-h-screen bg-background pt-8 pb-10 flex flex-col">
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex-grow w-full">
        
        <Reveal>
          <div className="mb-16">
            <span className="text-primary font-sans font-bold uppercase tracking-[0.2em] text-sm mb-4 block">
              Let's Talk
            </span>
            <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl text-foreground mb-6">
              Get in Touch
            </h2>
            <div className="h-1 w-24 bg-primary rounded-full" />
          </div>
        </Reveal>

        {/* Contact Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          <Reveal>
            <div className="bg-secondary p-10 h-full flex flex-col justify-between group rounded-3xl border border-border hover:border-primary/50 transition-all shadow-sm hover:shadow-elevated">
              <div>
                <div className="w-16 h-16 bg-background rounded-2xl flex items-center justify-center mb-8 shadow-sm group-hover:scale-110 transition-transform duration-500">
                  <Mail className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-serif text-3xl text-foreground mb-4">Inquiries</h3>
                <p className="text-muted-foreground mb-8 text-lg leading-relaxed">
                  Reach out to us directly via email or phone for any construction or hospitality needs.
                </p>
              </div>
              <div className="space-y-6">
                <a 
                  href={`mailto:${data.email}`} 
                  className="flex items-center gap-4 text-foreground hover:text-primary transition-colors group/link"
                >
                  <div className="p-2 bg-background rounded-lg group-hover/link:bg-primary group-hover/link:text-primary-foreground transition-colors">
                    <Mail size={20} />
                  </div>
                  <span className="uppercase tracking-widest text-sm font-bold">{data.email}</span>
                </a>
                <a 
                  href={`tel:${data.phone}`}
                  className="flex items-center gap-4 text-foreground hover:text-primary transition-colors group/link"
                >
                  <div className="p-2 bg-background rounded-lg group-hover/link:bg-primary group-hover/link:text-primary-foreground transition-colors">
                    <Phone size={20} />
                  </div>
                  <span className="uppercase tracking-widest text-sm font-bold">{data.phone}</span>
                </a>
              </div>
            </div>
          </Reveal>

          <Reveal delay={200}>
            <div className="bg-secondary p-10 h-full flex flex-col justify-between group rounded-3xl border border-border hover:border-primary/50 transition-all shadow-sm hover:shadow-elevated relative overflow-hidden">
              <div className="relative z-10">
                <div className="w-16 h-16 bg-background rounded-2xl flex items-center justify-center mb-8 shadow-sm group-hover:scale-110 transition-transform duration-500">
                  <Globe className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-serif text-3xl text-foreground mb-4">Headquarters</h3>
                <div className="flex items-start gap-4 text-muted-foreground mb-8">
                  <MapPin size={24} className="text-primary flex-shrink-0 mt-1" />
                  <span className="text-lg leading-relaxed">{data.address}</span>
                </div>
              </div>
              
              {/* Map Embed */}
              <div className="w-full h-56 rounded-2xl overflow-hidden border border-border mt-auto relative z-10 grayscale hover:grayscale-0 transition-all duration-700">
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

        {/* Social / Connect */}
        <div className="text-center py-12">
          <Reveal delay={300}>
            <a 
              href="#" 
              className="inline-flex items-center gap-3 btn-primary rounded-xl shadow-lg hover:shadow-elevated hover:-translate-y-1"
            >
              <Linkedin size={24} /> Connect on LinkedIn
            </a>
          </Reveal>
        </div>
      </div>
      
      {/* Copyright Footer */}
      <div className="border-t border-border pt-8 text-center text-muted-foreground text-xs uppercase tracking-widest">
        © {new Date().getFullYear()} Suncrisp Hospitality. All Rights Reserved.
      </div>
    </section>
  );
};

export default ContactFooter;
