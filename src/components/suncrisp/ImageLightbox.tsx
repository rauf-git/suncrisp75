import { useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface ImageLightboxProps {
  images: string[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

const ImageLightbox = ({
  images,
  currentIndex,
  isOpen,
  onClose,
  onNavigate,
}: ImageLightboxProps) => {
  const handlePrevious = useCallback(() => {
    const newIndex = currentIndex === 0 ? images.length - 1 : currentIndex - 1;
    onNavigate(newIndex);
  }, [currentIndex, images.length, onNavigate]);

  const handleNext = useCallback(() => {
    const newIndex = currentIndex === images.length - 1 ? 0 : currentIndex + 1;
    onNavigate(newIndex);
  }, [currentIndex, images.length, onNavigate]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          handlePrevious();
          break;
        case 'ArrowRight':
          handleNext();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    // Prevent body scroll when lightbox is open
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose, handlePrevious, handleNext]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-foreground/95 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 p-3 bg-primary-foreground/10 hover:bg-primary-foreground/20 text-primary-foreground rounded-full transition-colors min-w-[48px] min-h-[48px] flex items-center justify-center"
        aria-label="Close lightbox"
      >
        <X size={24} />
      </button>

      {/* Navigation - Previous */}
      {images.length > 1 && (
        <button
          onClick={handlePrevious}
          className="absolute left-4 z-10 p-3 bg-primary-foreground/10 hover:bg-primary-foreground/20 text-primary-foreground rounded-full transition-colors min-w-[48px] min-h-[48px] flex items-center justify-center"
          aria-label="Previous image"
        >
          <ChevronLeft size={24} />
        </button>
      )}

      {/* Navigation - Next */}
      {images.length > 1 && (
        <button
          onClick={handleNext}
          className="absolute right-4 z-10 p-3 bg-primary-foreground/10 hover:bg-primary-foreground/20 text-primary-foreground rounded-full transition-colors min-w-[48px] min-h-[48px] flex items-center justify-center"
          aria-label="Next image"
        >
          <ChevronRight size={24} />
        </button>
      )}

      {/* Main Image */}
      <div className="relative max-w-[90vw] max-h-[85vh] z-10">
        <img
          src={images[currentIndex]}
          alt={`Gallery image ${currentIndex + 1}`}
          className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
        />
      </div>

      {/* Image Counter */}
      {images.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 bg-primary-foreground/10 backdrop-blur-md px-4 py-2 rounded-full">
          <span className="text-primary-foreground text-sm font-medium">
            {currentIndex + 1} / {images.length}
          </span>
        </div>
      )}
    </div>
  );
};

export default ImageLightbox;
