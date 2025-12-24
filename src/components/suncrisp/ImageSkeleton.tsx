import { useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface ImageSkeletonProps {
  src: string;
  alt: string;
  className?: string;
  aspectRatio?: string;
}

const ImageSkeleton = ({ src, alt, className = '', aspectRatio = 'aspect-[4/3]' }: ImageSkeletonProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  return (
    <div className={`relative overflow-hidden bg-muted ${aspectRatio}`}>
      {!isLoaded && !hasError && (
        <Skeleton className="absolute inset-0 w-full h-full animate-pulse" />
      )}
      <img
        src={src}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-500 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        } ${className}`}
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
      />
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted text-muted-foreground text-sm">
          Failed to load
        </div>
      )}
    </div>
  );
};

export default ImageSkeleton;