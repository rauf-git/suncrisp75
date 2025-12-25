import React, { useState } from 'react';
import { X, Send, Mail, Check, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { ScrollArea } from '@/components/ui/scroll-area';

interface EmailModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const EmailModal = React.forwardRef<HTMLDivElement, EmailModalProps>(({ isOpen, onClose }, ref) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setStatus('success');
      toast.success('Message sent successfully!');

      setTimeout(() => {
        onClose();
        setTimeout(() => {
          setStatus('idle');
          setName('');
          setEmail('');
          setMessage('');
        }, 300);
      }, 2000);
    } catch (error) {
      setStatus('error');
      setErrorMessage('Something went wrong. Please try again.');
    }
  };

  return (
    <div ref={ref} className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-foreground/60 backdrop-blur-sm transition-opacity" onClick={onClose} />

      {/* Modal Container */}
      <div className="relative w-full max-w-[95vw] sm:max-w-lg max-h-[90vh] bg-card border border-border shadow-2xl rounded-t-2xl sm:rounded-2xl overflow-hidden animate-fade-in flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-border flex justify-between items-center bg-secondary shrink-0">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary-light flex items-center justify-center">
              <Mail className="text-primary w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg sm:text-xl text-foreground leading-none">Contact Us</h3>
              <p className="text-xs text-muted-foreground mt-1">Send us a message directly</p>
            </div>
          </div>
          <button
            onClick={onClose}
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
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 text-green-600">
                  <Check size={28} className="sm:hidden" />
                  <Check size={32} className="hidden sm:block" />
                </div>
                <h4 className="text-lg sm:text-xl font-serif text-foreground mb-2">Message Sent!</h4>
                <p className="text-muted-foreground text-sm">Thank you for reaching out. We will get back to you shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1 font-semibold">Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-secondary border border-border rounded-lg p-3 text-sm sm:text-base text-foreground focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-colors"
                    placeholder="Your Name"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1 font-semibold">Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-secondary border border-border rounded-lg p-3 text-sm sm:text-base text-foreground focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-colors"
                    placeholder="your@email.com"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1 font-semibold">Message</label>
                  <textarea
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={4}
                    className="w-full bg-secondary border border-border rounded-lg p-3 text-sm sm:text-base text-foreground focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-colors resize-none min-h-[100px] sm:min-h-[120px]"
                    placeholder="How can we help you?"
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
                  className="w-full btn-primary rounded-lg flex items-center justify-center gap-2 mt-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg h-11 sm:h-12 text-sm sm:text-base"
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
  );
});

EmailModal.displayName = 'EmailModal';

export default EmailModal;
