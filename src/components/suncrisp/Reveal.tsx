import React, { ReactNode, useEffect, useRef, useState } from 'react';

interface RevealProps {
  children: ReactNode;
  width?: 'fit-content' | '100%';
  delay?: number;
  className?: string;
}

function setRefs<T>(
  node: T | null,
  refs: Array<React.Ref<T> | undefined>
) {
  refs.forEach((ref) => {
    if (!ref) return;
    if (typeof ref === 'function') {
      ref(node);
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (ref as any).current = node;
    }
  });
}

const Reveal = React.forwardRef<HTMLDivElement, RevealProps>(
  ({ children, width = 'fit-content', delay = 0, className = '' }, forwardedRef) => {
    const localRef = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
      const node = localRef.current;
      if (!node) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
          }
        },
        { threshold: 0.1 }
      );

      observer.observe(node);
      return () => observer.disconnect();
    }, []);

    return (
      <div
        ref={(node) => setRefs(node, [localRef, forwardedRef])}
        style={{ width, position: 'relative', overflow: 'hidden' }}
        className={className}
      >
        <div
          className={`transition-all duration-1000 ease-out transform ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
          }`}
          style={{ transitionDelay: `${delay}ms` }}
        >
          {children}
        </div>
      </div>
    );
  }
);

Reveal.displayName = 'Reveal';

export default Reveal;
