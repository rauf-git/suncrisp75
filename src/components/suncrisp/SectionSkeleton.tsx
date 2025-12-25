import { Skeleton } from "@/components/ui/skeleton";

interface SectionSkeletonProps {
  title?: string;
  cardCount?: number;
  variant?: "carousel" | "grid";
}

export function SectionSkeleton({ 
  title, 
  cardCount = 3, 
  variant = "carousel" 
}: SectionSkeletonProps) {
  return (
    <section className="section-padding">
      <div className="max-w-7xl mx-auto">
        {/* Header skeleton */}
        <div className="flex flex-col items-center text-center mb-12">
          {title ? (
            <h2 className="section-title mb-4">{title}</h2>
          ) : (
            <Skeleton className="h-10 w-64 mb-4" />
          )}
          <Skeleton className="h-5 w-96 max-w-full" />
        </div>

        {/* Cards skeleton */}
        {variant === "carousel" ? (
          <div className="flex gap-6 overflow-hidden">
            {Array.from({ length: cardCount }).map((_, i) => (
              <div 
                key={i} 
                className="flex-shrink-0 w-[300px] md:w-[350px]"
              >
                <div className="luxury-card">
                  <Skeleton className="aspect-[4/3] w-full" />
                  <div className="p-6 space-y-3">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Array.from({ length: cardCount }).map((_, i) => (
              <div key={i} className="luxury-card">
                <Skeleton className="aspect-[16/9] w-full" />
                <div className="p-6 space-y-3">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
