import { useState } from 'react';
import { MessageCircle, X, Send, Loader2, Check, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface FloatingCTAProps {
  isVisible?: boolean;
}

const FloatingCTA = ({ isVisible = true }: FloatingCTAProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

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

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 z-40 bg-primary text-primary-foreground p-4 rounded-full shadow-elevated transition-all duration-300 hover:scale-110 hover:shadow-xl hover:shadow-primary/30 group"
        aria-label="Contact Us"
      >
        <MessageCircle className="w-6 h-6" />
        <span className="absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-foreground text-background text-xs font-bold uppercase tracking-widest px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-lg">
          Get In Touch
        </span>
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-foreground/60 backdrop-blur-sm transition-opacity animate-fade-in"
            onClick={() => { setIsOpen(false); resetForm(); }}
          />
          
          {/* Modal Content */}
          <div className="relative w-full max-w-md bg-card border border-border shadow-2xl rounded-2xl overflow-hidden animate-scale-in">
            {/* Header */}
            <div className="p-6 border-b border-border flex justify-between items-center bg-primary/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <MessageCircle className="text-primary w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-xl text-foreground leading-none">Get In Touch</h3>
                  <p className="text-xs text-muted-foreground mt-1">We'd love to hear from you</p>
                </div>
              </div>
              <button 
                onClick={() => { setIsOpen(false); resetForm(); }}
                className="text-muted-foreground hover:text-foreground transition-colors p-2 hover:bg-background rounded-full"
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6">
              {status === 'success' ? (
                <div className="flex flex-col items-center justify-center py-10 text-center animate-fade-in">
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4 text-green-600 dark:text-green-400">
                    <Check size={32} />
                  </div>
                  <h4 className="text-xl font-serif text-foreground mb-2">Message Sent!</h4>
                  <p className="text-muted-foreground text-sm">Thank you for reaching out. We'll get back to you shortly.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1 font-semibold">Name</label>
                    <input 
                      type="text" 
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-secondary border border-border rounded-lg p-3 text-foreground focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-colors"
                      placeholder="Your Name"
                      disabled={status === 'loading'}
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1 font-semibold">Email</label>
                    <input 
                      type="email" 
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-secondary border border-border rounded-lg p-3 text-foreground focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-colors"
                      placeholder="your@email.com"
                      disabled={status === 'loading'}
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1 font-semibold">Message</label>
                    <textarea 
                      required
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={4}
                      className="w-full bg-secondary border border-border rounded-lg p-3 text-foreground focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-colors resize-none"
                      placeholder="How can we help you?"
                      disabled={status === 'loading'}
                    />
                  </div>

                  {status === 'error' && (
                    <div className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 p-3 rounded-lg border border-destructive/20">
                      <AlertCircle size={16} />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  <button 
                    type="submit" 
                    disabled={status === 'loading'}
                    className="w-full btn-primary rounded-lg flex items-center justify-center gap-2 mt-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg"
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
          </div>
        </div>
      )}
    </>
  );
};

export default FloatingCTA;
