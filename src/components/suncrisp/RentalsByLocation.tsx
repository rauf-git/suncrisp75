import { useState, useEffect } from 'react';
import { rentalService, RentalLocation, Rental } from '@/services/rentalService';
import Reveal from './Reveal';
import { Property } from '@/types';
import { ChevronLeft, ChevronRight, ArrowRight, Bed, Bath, Maximize } from 'lucide-react';
import ContentSections from './ContentSections';
import { AutoCarousel } from '@/components/ui/auto-carousel';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

interface RentalsByLocationProps {
  onItemClick: (item: Property) => void;
}

interface LocationWithRentals extends RentalLocation {
  rentals: Rental[];
}

// Featured Property Card (Full Width)
const FeaturedPropertyCard = ({ 
  rental, 
  onClick 
}: { 
  rental: Rental; 
  onClick: () => void;
}) => {
  const images = rental.images?.length ? rental.images : (rental.thumbnail_url ? [rental.thumbnail_url] : []);
  const amenities = rental.amenities?.slice(0, 6) || [];

  return (
    <div 
      className="group cursor-pointer bg-card border border-border rounded-2xl overflow-hidden hover:shadow-elevated hover:border-primary/30 transition-all duration-300"
      onClick={onClick}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
        {/* Image Section */}
        <div className="relative aspect-[4/3] md:aspect-auto md:min-h-[350px] overflow-hidden">
          {images.length > 0 ? (
            <AutoCarousel
              images={images}
              alt={rental.title}
              autoplayInterval={5000}
              showArrows={true}
              showDots={true}
              showCounter={false}
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <span className="text-muted-foreground">No image</span>
            </div>
          )}
          {rental.price && (
            <div className="absolute top-4 right-4">
              <span className="bg-primary text-primary-foreground font-bold px-4 py-2 rounded-lg shadow-md text-sm">
                {rental.price}
              </span>
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="p-6 md:p-8 flex flex-col justify-center">
          <div className="space-y-4">
            <h3 className="font-serif text-2xl md:text-3xl lg:text-4xl font-semibold text-foreground group-hover:text-primary transition-colors">
              {rental.title}
            </h3>
            {rental.short_description && (
              <p className="text-muted-foreground text-sm md:text-base lg:text-lg line-clamp-3">
                {rental.short_description}
              </p>
            )}
            
            {/* Property features */}
            <div className="flex flex-wrap gap-4 pt-2">
              {rental.bedrooms && (
                <div className="flex items-center gap-2 text-sm md:text-base text-muted-foreground">
                  <Bed className="w-5 h-5" />
                  <span>{rental.bedrooms} Beds</span>
                </div>
              )}
              {rental.bathrooms && (
                <div className="flex items-center gap-2 text-sm md:text-base text-muted-foreground">
                  <Bath className="w-5 h-5" />
                  <span>{rental.bathrooms} Baths</span>
                </div>
              )}
              {rental.area && (
                <div className="flex items-center gap-2 text-sm md:text-base text-muted-foreground">
                  <Maximize className="w-5 h-5" />
                  <span>{rental.area}</span>
                </div>
              )}
            </div>

            {/* Amenities */}
            {amenities.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {amenities.map((amenity, index) => (
                  <span key={index} className="text-xs md:text-sm bg-muted px-3 py-1.5 rounded-full">
                    {amenity}
                  </span>
                ))}
              </div>
            )}

            <Button 
              className="w-full md:w-auto mt-4 group/btn"
              size="lg"
              onClick={(e) => { e.stopPropagation(); onClick(); }}
            >
              View Property
              <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Location Card (Right Side Small Cards) with Auto-Rotating Carousel
const LocationCardSmall = ({ 
  location
}: { 
  location: LocationWithRentals;
}) => {
  const images = location.images?.length ? location.images : (location.image_url ? [location.image_url] : []);
  
  return (
    <div 
      className="group bg-card border border-border rounded-xl overflow-hidden hover:shadow-elevated hover:border-primary/30 transition-all duration-300 h-full flex flex-col"
    >
      {/* Image Carousel - auto-rotating */}
      <div className="relative aspect-[16/9] overflow-hidden">
        <AutoCarousel
          images={images}
          alt={location.name}
          autoplayInterval={4500}
          showArrows={true}
          showDots={true}
          showCounter={true}
          pauseOnHover={true}
        />
        
        {/* Location tag */}
        <div className="absolute top-3 left-3">
          <span className="bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded-md shadow-sm">
            Location
          </span>
        </div>
      </div>
      
      {/* Location Info */}
      <div className="p-4 flex-1 flex flex-col">
        <h4 className="font-serif text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
          {location.name}
        </h4>
        {location.description && (
          <p className="text-muted-foreground text-sm mt-1 line-clamp-2">
            {location.description}
          </p>
        )}
      </div>
    </div>
  );
};

// Loading Skeleton
const LoadingSkeleton = () => (
  <section className="py-12 md:py-16 lg:py-20 bg-background">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <Skeleton className="h-12 w-64 mx-auto mb-4" />
        <Skeleton className="h-6 w-96 mx-auto" />
      </div>
      {/* Full width property card skeleton */}
      <Skeleton className="h-[400px] w-full rounded-2xl mb-6" />
      {/* Location cards in a row */}
      <div className="grid grid-cols-3 gap-4">
        <Skeleton className="h-[200px] rounded-xl" />
        <Skeleton className="h-[200px] rounded-xl" />
        <Skeleton className="h-[200px] rounded-xl" />
      </div>
    </div>
  </section>
);

const RentalsByLocation = ({ onItemClick }: RentalsByLocationProps) => {
  const [locationsWithRentals, setLocationsWithRentals] = useState<LocationWithRentals[]>([]);
  const [allRentals, setAllRentals] = useState<Rental[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<LocationWithRentals | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const [locationsResult, rentalsResult] = await Promise.all([
        rentalService.getAllLocations(),
        rentalService.getAll()
      ]);

      if (locationsResult.error) throw new Error(locationsResult.error.message);
      if (rentalsResult.error) throw new Error(rentalsResult.error.message);

      const locations = locationsResult.data || [];
      const rentals = rentalsResult.data || [];

      // Group rentals by location using location_ids array
      const locationMap = new Map<string, LocationWithRentals>();
      locations.forEach(loc => {
        locationMap.set(loc.id, { ...loc, rentals: [] });
      });

      rentals.forEach(rental => {
        // Check location_ids array first, fallback to location_id for backward compatibility
        const rentalLocationIds = rental.location_ids?.length ? rental.location_ids : (rental.location_id ? [rental.location_id] : []);
        rentalLocationIds.forEach(locId => {
          if (locationMap.has(locId)) {
            locationMap.get(locId)!.rentals.push(rental);
          }
        });
      });

      const allLocations = Array.from(locationMap.values())
        .sort((a, b) => a.display_order - b.display_order);

      setLocationsWithRentals(allLocations);
      setAllRentals(rentals);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const mapRentalToProperty = (rental: Rental): Property => ({
    id: rental.id,
    title: rental.title,
    type: 'Rental',
    location: rental.address || '',
    price: rental.price || '',
    image: rental.thumbnail_url || '',
    description: rental.short_description || '',
    detailedDescription: rental.long_description || rental.short_description || '',
    features: [
      rental.bedrooms ? `${rental.bedrooms} Beds` : '',
      rental.bathrooms ? `${rental.bathrooms} Baths` : '',
      rental.area || '',
      ...(rental.amenities || [])
    ].filter(Boolean),
    gallery: rental.images || [],
    content_sections: (rental.content_sections as { heading: string; content: string }[]) || [],
  });

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return (
      <section className="py-12 md:py-16 lg:py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={fetchData} variant="outline">
            Try Again
          </Button>
        </div>
      </section>
    );
  }

  const hasNoContent = locationsWithRentals.length === 0 && allRentals.length === 0;

  // Get featured rental (first one) and top 3 locations
  const featuredRental = allRentals.find(r => r.is_featured) || allRentals[0];
  const topLocations = locationsWithRentals.slice(0, 3);

  // Location Detail View
  if (selectedLocation) {
    return (
      <section className="py-12 md:py-16 lg:py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back button */}
          <Reveal>
            <button 
              onClick={() => setSelectedLocation(null)}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
            >
              <ChevronLeft className="w-5 h-5" />
              <span>Back to Locations</span>
            </button>
          </Reveal>

          {/* Location Header */}
          <Reveal delay={100}>
            <div className="text-center mb-12">
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-foreground mb-4">{selectedLocation.name}</h2>
              {selectedLocation.description && (
                <p className="font-sans text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto">
                  {selectedLocation.description}
                </p>
              )}
            </div>
          </Reveal>

          {/* Location Rich Text Content */}
          {selectedLocation.content_sections && selectedLocation.content_sections.length > 0 && (
            <Reveal delay={200}>
              <div className="mb-12">
                <ContentSections 
                  sections={selectedLocation.content_sections.map(s => ({
                    heading: s.heading || '',
                    content: s.content || '',
                    image: s.image
                  }))}
                />
              </div>
            </Reveal>
          )}

          {/* Rentals Grid */}
          {selectedLocation.rentals.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {selectedLocation.rentals.map((rental, index) => (
                <Reveal key={rental.id} delay={300 + index * 50}>
                  <div
                    className="group bg-card rounded-xl overflow-hidden shadow-soft cursor-pointer border border-border hover:shadow-elevated hover:border-primary/30 transition-all duration-300"
                    onClick={() => onItemClick(mapRentalToProperty(rental))}
                  >
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <img
                        src={rental.thumbnail_url || '/placeholder.svg'}
                        alt={rental.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                      />
                      {rental.price && (
                        <div className="absolute top-4 right-4">
                          <span className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1.5 rounded-md shadow-sm">
                            {rental.price}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="p-5">
                      <h4 className="font-serif text-lg text-foreground mb-2 line-clamp-1 group-hover:text-primary transition-colors">
                        {rental.title}
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {rental.bedrooms && (
                          <span className="text-xs bg-muted px-2 py-1 rounded">{rental.bedrooms} Beds</span>
                        )}
                        {rental.bathrooms && (
                          <span className="text-xs bg-muted px-2 py-1 rounded">{rental.bathrooms} Baths</span>
                        )}
                        {rental.area && (
                          <span className="text-xs bg-muted px-2 py-1 rounded">{rental.area}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No properties available in this location yet.</p>
            </div>
          )}
        </div>
      </section>
    );
  }

  // Main Grid View - 2 column layout
  return (
    <section className="py-12 md:py-16 lg:py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <Reveal>
          <div className="text-center mb-12 lg:mb-16">
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-foreground mb-4">Luxury Rentals</h2>
            <p className="font-sans text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto">
              Exclusive Properties for Short & Long Term Stays
            </p>
          </div>
        </Reveal>

        {hasNoContent ? (
          <Reveal delay={100}>
            <div className="text-center py-20">
              <p className="text-muted-foreground text-lg">No rental properties available at this time.</p>
            </div>
          </Reveal>
        ) : (
          <div className="space-y-6">
            {/* Full Width Featured Property Card */}
            {featuredRental && (
              <Reveal delay={100}>
                <FeaturedPropertyCard
                  rental={featuredRental}
                  onClick={() => onItemClick(mapRentalToProperty(featuredRental))}
                />
              </Reveal>
            )}

            {/* Location Cards - Side by Side (even on mobile) */}
            <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
              {topLocations.map((location, index) => (
                <Reveal key={location.id} delay={150 + index * 50}>
                  <div className="min-w-[280px] sm:min-w-0 sm:flex-1">
                    <LocationCardSmall
                      location={location}
                    />
                  </div>
                </Reveal>
              ))}

              {/* If less than 3 locations, show remaining rentals */}
              {topLocations.length < 3 && allRentals.slice(1, 4 - topLocations.length).map((rental, index) => (
                <Reveal key={rental.id} delay={200 + index * 50}>
                  <div
                    className="group cursor-pointer bg-card border border-border rounded-xl overflow-hidden hover:shadow-elevated hover:border-primary/30 transition-all duration-300 h-full flex"
                    onClick={() => onItemClick(mapRentalToProperty(rental))}
                  >
                    <div className="relative w-1/3 overflow-hidden">
                      <img
                        src={rental.thumbnail_url || '/placeholder.svg'}
                        alt={rental.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="flex-1 p-4 flex flex-col justify-between">
                      <div>
                        <h4 className="font-serif text-lg font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                          {rental.title}
                        </h4>
                        {rental.short_description && (
                          <p className="text-muted-foreground text-sm mt-1 line-clamp-2">
                            {rental.short_description}
                          </p>
                        )}
                      </div>
                      {rental.price && (
                        <span className="text-primary font-semibold text-sm mt-2">
                          {rental.price}
                        </span>
                      )}
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        )}

        {/* View All Button */}
        {(locationsWithRentals.length > 3 || allRentals.length > 4) && (
          <Reveal delay={300}>
            <div className="text-center mt-12">
              <Button variant="outline" size="lg">
                View All Properties
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </Reveal>
        )}
      </div>
    </section>
  );
};

export default RentalsByLocation;