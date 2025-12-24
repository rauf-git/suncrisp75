import { useEffect, useState } from 'react';

interface PageLoaderProps {
  onLoadComplete?: () => void;
  minDisplayTime?: number;
}

const PageLoader = ({ onLoadComplete, minDisplayTime = 2000 }: PageLoaderProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isAnimating, setIsAnimating] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAnimating(false);
      setTimeout(() => {
        setIsVisible(false);
        onLoadComplete?.();
      }, 500);
    }, minDisplayTime);

    return () => clearTimeout(timer);
  }, [minDisplayTime, onLoadComplete]);

  if (!isVisible) return null;

  return (
    <div 
      className={`fixed inset-0 z-[9999] bg-background flex items-center justify-center transition-opacity duration-500 ${
        isAnimating ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div className="relative w-32 h-32">
        {/* Flower petals - 5 seeds forming flower */}
        {[0, 1, 2, 3, 4].map((index) => (
          <div
            key={index}
            className="absolute left-1/2 top-1/2 w-6 h-12 rounded-full"
            style={{
              background: 'linear-gradient(180deg, hsl(14, 80%, 55%) 0%, hsl(14, 85%, 50%) 100%)',
              transformOrigin: 'center bottom',
              transform: `translate(-50%, -100%) rotate(${index * 72}deg)`,
              animation: `flowerPetal 2s ease-in-out infinite`,
              animationDelay: `${index * 0.15}s`,
              boxShadow: '0 0 20px hsla(14, 80%, 55%, 0.5)',
            }}
          />
        ))}
        
        {/* Center glow */}
        <div 
          className="absolute left-1/2 top-1/2 w-4 h-4 rounded-full -translate-x-1/2 -translate-y-1/2"
          style={{
            background: 'radial-gradient(circle, hsl(14, 85%, 55%) 0%, hsl(14, 80%, 45%) 100%)',
            boxShadow: '0 0 30px hsla(14, 80%, 55%, 0.8)',
            animation: 'centerPulse 1.5s ease-in-out infinite',
          }}
        />
      </div>
      
      {/* Loading text */}
      <div className="absolute bottom-1/3 left-1/2 -translate-x-1/2">
        <span 
          className="font-serif text-xl tracking-widest"
          style={{ 
            color: 'hsl(14, 80%, 55%)',
            animation: 'textFade 2s ease-in-out infinite',
          }}
        >
          SunCrisp
        </span>
      </div>

      <style>{`
        @keyframes flowerPetal {
          0%, 100% {
            transform: translate(-50%, -100%) rotate(var(--rotate)) scale(0.8);
            opacity: 0.6;
          }
          50% {
            transform: translate(-50%, -100%) rotate(var(--rotate)) scale(1);
            opacity: 1;
          }
        }
        
        @keyframes centerPulse {
          0%, 100% {
            transform: translate(-50%, -50%) scale(1);
            box-shadow: 0 0 30px hsla(14, 80%, 55%, 0.8);
          }
          50% {
            transform: translate(-50%, -50%) scale(1.3);
            box-shadow: 0 0 50px hsla(14, 80%, 55%, 1);
          }
        }
        
        @keyframes textFade {
          0%, 100% {
            opacity: 0.5;
          }
          50% {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default PageLoader;