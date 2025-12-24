import { useEffect, useState } from 'react';

interface PageLoaderProps {
  onLoadComplete?: () => void;
  minDisplayTime?: number;
}

// Generate floating particles
const particles = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  size: Math.random() * 6 + 3,
  x: Math.random() * 100,
  y: Math.random() * 100,
  duration: Math.random() * 4 + 6,
  delay: Math.random() * 3,
  opacity: Math.random() * 0.5 + 0.2,
}));

const PageLoader = ({ onLoadComplete, minDisplayTime = 2000 }: PageLoaderProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isAnimating, setIsAnimating] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAnimating(false);
      setTimeout(() => {
        setIsVisible(false);
        onLoadComplete?.();
      }, 600);
    }, minDisplayTime);

    return () => clearTimeout(timer);
  }, [minDisplayTime, onLoadComplete]);

  if (!isVisible) return null;

  return (
    <div 
      className={`fixed inset-0 z-[9999] bg-background flex items-center justify-center transition-opacity duration-600 ${
        isAnimating ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {/* Floating particles */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            width: particle.size,
            height: particle.size,
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            background: `radial-gradient(circle, hsla(14, 80%, 55%, ${particle.opacity}) 0%, hsla(14, 85%, 50%, 0) 70%)`,
            animation: `floatParticle ${particle.duration}s ease-in-out infinite`,
            animationDelay: `${particle.delay}s`,
          }}
        />
      ))}

      {/* Outer glow ring */}
      <div 
        className="absolute w-48 h-48 rounded-full"
        style={{
          background: 'radial-gradient(circle, hsla(14, 80%, 55%, 0.1) 0%, transparent 70%)',
          animation: 'outerRingPulse 4s ease-in-out infinite',
        }}
      />

      <div className="relative w-36 h-36">
        {/* Flower petals - 5 leaf-shaped seeds */}
        {[0, 1, 2, 3, 4].map((index) => (
          <div
            key={index}
            className="absolute left-1/2 top-1/2"
            style={{
              width: '20px',
              height: '40px',
              background: 'linear-gradient(180deg, hsl(14, 80%, 58%) 0%, hsl(14, 85%, 48%) 100%)',
              transformOrigin: 'center bottom',
              transform: `translate(-50%, -100%) rotate(${index * 72}deg)`,
              animation: `leafPetal 3.5s ease-in-out infinite`,
              animationDelay: `${index * 0.2}s`,
              boxShadow: '0 0 25px hsla(14, 80%, 55%, 0.6)',
              borderRadius: '50% 50% 50% 50% / 80% 80% 20% 20%',
              clipPath: 'ellipse(50% 100% at 50% 100%)',
            }}
          />
        ))}
        
        {/* Center glow */}
        <div 
          className="absolute left-1/2 top-1/2 w-5 h-5 rounded-full -translate-x-1/2 -translate-y-1/2"
          style={{
            background: 'radial-gradient(circle, hsl(14, 85%, 60%) 0%, hsl(14, 80%, 45%) 100%)',
            boxShadow: '0 0 40px hsla(14, 80%, 55%, 0.9)',
            animation: 'centerPulse 2.5s ease-in-out infinite',
          }}
        />

        {/* Inner sparkles */}
        {[0, 1, 2, 3, 4, 5].map((index) => (
          <div
            key={`sparkle-${index}`}
            className="absolute left-1/2 top-1/2 w-1.5 h-1.5 rounded-full"
            style={{
              background: 'hsl(14, 85%, 65%)',
              transform: `translate(-50%, -50%) rotate(${index * 60}deg) translateY(-55px)`,
              animation: `sparkle 2s ease-in-out infinite`,
              animationDelay: `${index * 0.3}s`,
              boxShadow: '0 0 10px hsla(14, 80%, 55%, 0.8)',
            }}
          />
        ))}
      </div>
      
      {/* Loading text */}
      <div className="absolute bottom-1/3 left-1/2 -translate-x-1/2">
        <span 
          className="font-serif text-2xl tracking-widest"
          style={{ 
            color: 'hsl(14, 80%, 55%)',
            animation: 'textFade 3s ease-in-out infinite',
            textShadow: '0 0 20px hsla(14, 80%, 55%, 0.5)',
          }}
        >
          SunCrisp
        </span>
      </div>

      <style>{`
        @keyframes leafPetal {
          0%, 100% {
            transform: translate(-50%, -100%) rotate(var(--rotate)) scale(0.85);
            opacity: 0.7;
          }
          50% {
            transform: translate(-50%, -100%) rotate(var(--rotate)) scale(1);
            opacity: 1;
          }
        }
        
        @keyframes centerPulse {
          0%, 100% {
            transform: translate(-50%, -50%) scale(1);
            box-shadow: 0 0 40px hsla(14, 80%, 55%, 0.9);
          }
          50% {
            transform: translate(-50%, -50%) scale(1.2);
            box-shadow: 0 0 60px hsla(14, 80%, 55%, 1);
          }
        }
        
        @keyframes textFade {
          0%, 100% {
            opacity: 0.6;
          }
          50% {
            opacity: 1;
          }
        }

        @keyframes floatParticle {
          0%, 100% {
            transform: translateY(0) translateX(0) scale(1);
            opacity: 0.3;
          }
          25% {
            transform: translateY(-20px) translateX(10px) scale(1.2);
            opacity: 0.6;
          }
          50% {
            transform: translateY(-10px) translateX(-5px) scale(0.9);
            opacity: 0.4;
          }
          75% {
            transform: translateY(-30px) translateX(5px) scale(1.1);
            opacity: 0.5;
          }
        }

        @keyframes outerRingPulse {
          0%, 100% {
            transform: scale(1);
            opacity: 0.3;
          }
          50% {
            transform: scale(1.3);
            opacity: 0.6;
          }
        }

        @keyframes sparkle {
          0%, 100% {
            opacity: 0.3;
            transform: translate(-50%, -50%) rotate(var(--rotate)) translateY(-55px) scale(0.8);
          }
          50% {
            opacity: 1;
            transform: translate(-50%, -50%) rotate(var(--rotate)) translateY(-55px) scale(1.2);
          }
        }
      `}</style>
    </div>
  );
};

export default PageLoader;