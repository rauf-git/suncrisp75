import { useState, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2, Check, AlertCircle } from 'lucide-react';
import { supabase } from "@/integrations/supabase/safeClient";
import { toast } from 'sonner';
import { ScrollArea } from '@/components/ui/scroll-area';
import { pageBlockService } from '@/services/pageBlockService';

interface FloatingCTAProps {
  isVisible?: boolean;
}

// WhatsApp SVG Icon Component
const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
  </svg>
);

const FloatingCTA = ({ isVisible = true }: FloatingCTAProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('+919559665556');

  useEffect(() => {
    const fetchWhatsapp = async () => {
      try {
        const { data } = await pageBlockService.getByKey('home', 'social_links');
        if (data?.content) {
          const content = data.content as { whatsapp?: string };
          if (content.whatsapp) {
            setWhatsappNumber(content.whatsapp);
          }
        }
      } catch (error) {
        console.error('Failed to fetch WhatsApp number:', error);
      }
    };
    fetchWhatsapp();
  }, []);

  if (!isVisible) return null;

  const resetForm = () => {
    setName('');
    setEmail('');
    setMessage('');
    setStatus('idle');
    setErrorMessage('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    try {
      const { data, error } = await supabase.functions.invoke('send-contact-email', {
        body: { name, email, message }
      });

      if (error) throw error;

      setStatus('success');
      toast.success('Message sent successfully!');

      setTimeout(() => {
        setIsOpen(false);
        setTimeout(resetForm, 300);
      }, 2000);
    } catch (error: unknown) {
      console.error('Email sending error:', error);
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Failed to send message. Please try again.');
    }
  };

  const whatsappUrl = `https://wa.me/${whatsappNumber.replace(/\+/g, '')}`;

  return (
    <>
      {/* Floating Buttons Container */}
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 md:bottom-8 md:right-8 z-40 flex flex-col gap-3">
        {/* WhatsApp Button */}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-[#25D366] text-white p-3 sm:p-4 rounded-full shadow-elevated transition-all duration-300 hover:scale-110 hover:shadow-xl hover:shadow-[#25D366]/30 group min-w-[48px] min-h-[48px] sm:min-w-[56px] sm:min-h-[56px] flex items-center justify-center"
          aria-label="Chat on WhatsApp"
        >
          <WhatsAppIcon className="w-5 h-5 sm:w-6 sm:h-6" />
          <span className="absolute right-full mr-3 sm:mr-4 top-1/2 -translate-y-1/2 bg-foreground text-background text-[10px] sm:text-xs font-bold uppercase tracking-widest px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-lg hidden sm:block">
            WhatsApp
          </span>
        </a>

        {/* Email/Contact Button */}
        <button
          onClick={() => setIsOpen(true)}
          className="bg-primary text-primary-foreground p-3 sm:p-4 rounded-full shadow-elevated transition-all duration-300 hover:scale-110 hover:shadow-xl hover:shadow-primary/30 group min-w-[48px] min-h-[48px] sm:min-w-[56px] sm:min-h-[56px] flex items-center justify-center"
          aria-label="Contact Us"
        >
          <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6" />
          <span className="absolute right-full mr-3 sm:mr-4 top-1/2 -translate-y-1/2 bg-foreground text-background text-[10px] sm:text-xs font-bold uppercase tracking-widest px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-lg hidden sm:block">
            Get In Touch
          </span>
        </button>
      </div>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-foreground/60 backdrop-blur-sm transition-opacity animate-fade-in"
            onClick={() => { setIsOpen(false); resetForm(); }}
          />
          
          {/* Modal Content */}
          <div className="relative w-full max-w-[calc(100%-24px)] sm:max-w-md max-h-[90vh] bg-card border border-border shadow-2xl rounded-xl sm:rounded-2xl overflow-hidden animate-scale-in flex flex-col">
            {/* Header */}
            <div className="p-4 sm:p-6 border-b border-border flex justify-between items-center bg-primary/5 shrink-0">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="text-primary w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-lg sm:text-xl text-foreground leading-none">Get In Touch</h3>
                  <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1">We'd love to hear from you</p>
                </div>
              </div>
              <button 
                onClick={() => { setIsOpen(false); resetForm(); }}
                className="text-muted-foreground hover:text-foreground transition-colors p-2 hover:bg-background rounded-full min-w-[44px] min-h-[44px] flex items-center justify-center"
              >
                <X size={20} />
              </button>
            </div>

            {/* Scrollable Body */}
            <ScrollArea className="flex-1 min-h-0">
              <div className="p-4 sm:p-6">
                {status === 'success' ? (
                  <div className="flex flex-col items-center justify-center py-8 sm:py-10 text-center animate-fade-in">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-3 sm:mb-4 text-green-600 dark:text-green-400">
                      <Check size={28} className="sm:w-8 sm:h-8" />
                    </div>
                    <h4 className="text-lg sm:text-xl font-serif text-foreground mb-2">Message Sent!</h4>
                    <p className="text-muted-foreground text-xs sm:text-sm">Thank you for reaching out. We'll get back to you shortly.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                    <div>
                      <label className="block text-[10px] sm:text-xs uppercase tracking-wider text-muted-foreground mb-1 font-semibold">Name</label>
                      <input 
                        type="text" 
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-secondary border border-border rounded-lg p-2.5 sm:p-3 text-foreground focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-colors text-sm sm:text-base min-h-[44px]"
                        placeholder="Your Name"
                        disabled={status === 'loading'}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] sm:text-xs uppercase tracking-wider text-muted-foreground mb-1 font-semibold">Email</label>
                      <input 
                        type="email" 
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-secondary border border-border rounded-lg p-2.5 sm:p-3 text-foreground focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-colors text-sm sm:text-base min-h-[44px]"
                        placeholder="your@email.com"
                        disabled={status === 'loading'}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] sm:text-xs uppercase tracking-wider text-muted-foreground mb-1 font-semibold">Message</label>
                      <textarea 
                        required
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        rows={3}
                        className="w-full bg-secondary border border-border rounded-lg p-2.5 sm:p-3 text-foreground focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-colors resize-none text-sm sm:text-base"
                        placeholder="How can we help you?"
                        disabled={status === 'loading'}
                      />
                    </div>

                    {status === 'error' && (
                      <div className="flex items-start gap-2 text-destructive text-xs sm:text-sm bg-destructive/10 p-2.5 sm:p-3 rounded-lg border border-destructive/20">
                        <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                        <span>{errorMessage}</span>
                      </div>
                    )}

                    <button 
                      type="submit" 
                      disabled={status === 'loading'}
                      className="w-full btn-primary rounded-lg flex items-center justify-center gap-2 mt-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg min-h-[48px] text-sm sm:text-base"
                    >
                      {status === 'loading' ? (
                        <>
                          <Loader2 size={18} className="animate-spin" /> Sending...
                        </>
                      ) : (
                        <>
                          <Send size={18} /> Send Message
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      )}
    </>
  );
};

export default FloatingCTA;
