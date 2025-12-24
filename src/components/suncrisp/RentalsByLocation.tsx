import { useState, useEffect } from 'react';
import { rentalService, RentalLocation, Rental } from '@/services/rentalService';
import Reveal from './Reveal';
import { Property } from '@/types';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ContentSections from './ContentSections';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface RentalsByLocationProps {
  onItemClick: (item: Property) => void;
}

interface LocationWithRentals extends RentalLocation {
  rentals: Rental[];
}

// Location Card Component with Image Carousel
const LocationCard = ({ 
  location, 
  onClick 
}: { 
  location: LocationWithRentals; 
  onClick: () => void;
}) => {
  const images = location.images?.length ? location.images : (location.image_url ? [location.image_url] : []);
  
  return (
    <div 
      className="group cursor-pointer"
      onClick={onClick}
    >
      {/* Image Carousel */}
      <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-border bg-muted">
        {images.length > 0 ? (
          <Carousel className="w-full h-full" opts={{ loop: true }}>
            <CarouselContent className="h-full -ml-0">
              {images.map((image, index) => (
                <CarouselItem key={index} className="h-full pl-0">
                  <img
                    src={image}
                    alt={`${location.name} - Image ${index + 1}`}
                    className="w-full h-full object-cover md:group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
            {images.length > 1 && (
              <>
                <CarouselPrevious 
                  className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 hover:bg-background border-0"
                  onClick={(e) => e.stopPropagation()}
                />
                <CarouselNext 
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 hover:bg-background border-0"
                  onClick={(e) => e.stopPropagation()}
                />
              </>
            )}
          </Carousel>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted">
            <span className="text-muted-foreground text-sm">No image</span>
          </div>
        )}
        
        {/* Property count badge */}
        {location.rentals.length > 0 && (
          <div className="absolute top-3 right-3">
            <span className="bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded-md shadow-sm">
              {location.rentals.length} {location.rentals.length === 1 ? 'Property' : 'Properties'}
            </span>
          </div>
        )}
      </div>
      
      {/* Location Info */}
      <div className="mt-4">
        <h3 className="font-serif text-xl text-primary md:group-hover:text-primary/80 transition-colors font-semibold">
          {location.name}
        </h3>
        {location.description && (
          <p className="text-muted-foreground text-sm mt-1">
            {location.description}
          </p>
        )}
      </div>
    </div>
  );
};

const RentalsByLocation = ({ onItemClick }: RentalsByLocationProps) => {
  const [locationsWithRentals, setLocationsWithRentals] = useState<LocationWithRentals[]>([]);
  const [unassignedRentals, setUnassignedRentals] = useState<Rental[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState<LocationWithRentals | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      
      // Fetch all locations and rentals
      const [locationsResult, rentalsResult] = await Promise.all([
        rentalService.getAllLocations(),
        rentalService.getAll()
      ]);

      const locations = locationsResult.data || [];
      const rentals = rentalsResult.data || [];

      // Group rentals by location
      const locationMap = new Map<string, LocationWithRentals>();
      locations.forEach(loc => {
        locationMap.set(loc.id, { ...loc, rentals: [] });
      });

      const unassigned: Rental[] = [];
      rentals.forEach(rental => {
        if (rental.location_id && locationMap.has(rental.location_id)) {
          locationMap.get(rental.location_id)!.rentals.push(rental);
        } else {
          unassigned.push(rental);
        }
      });

      // Include all locations (even those without rentals) and sort by display_order
      const allLocations = Array.from(locationMap.values())
        .sort((a, b) => a.display_order - b.display_order);

      setLocationsWithRentals(allLocations);
      setUnassignedRentals(unassigned);
      setIsLoading(false);
    };

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
    return (
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl md:text-5xl text-foreground mb-4">Luxury Rentals</h2>
            <p className="font-sans text-muted-foreground text-lg max-w-2xl mx-auto">Loading...</p>
          </div>
        </div>
      </section>
    );
  }

  const hasNoContent = locationsWithRentals.length === 0 && unassignedRentals.length === 0;

  // Location Detail View
  if (selectedLocation) {
    return (
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 md:px-6">
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
              <h2 className="font-serif text-4xl md:text-5xl text-foreground mb-4">{selectedLocation.name}</h2>
              {selectedLocation.description && (
                <p className="font-sans text-muted-foreground text-lg max-w-2xl mx-auto">
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {selectedLocation.rentals.map((rental, index) => (
                <Reveal key={rental.id} delay={300 + index * 50}>
                  <div
                    className="group bg-card rounded-xl overflow-hidden shadow-soft cursor-pointer border border-border md:hover:shadow-elevated md:hover:border-primary/30 transition-all duration-300"
                    onClick={() => onItemClick(mapRentalToProperty(rental))}
                  >
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <img
                        src={rental.thumbnail_url || '/placeholder.svg'}
                        alt={rental.title}
                        className="w-full h-full object-cover md:group-hover:scale-105 transition-transform duration-700 ease-out"
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
                      <h4 className="font-serif text-lg text-foreground mb-2 line-clamp-1 md:group-hover:text-primary transition-colors">
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

  // Main Grid View
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4 md:px-6">
        {/* Header */}
        <Reveal>
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl md:text-5xl text-foreground mb-4">Luxury Rentals</h2>
            <p className="font-sans text-muted-foreground text-lg max-w-2xl mx-auto">
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
          <>
            {/* Location Cards Grid */}
            {locationsWithRentals.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
                {locationsWithRentals.map((location, index) => (
                  <Reveal key={location.id} delay={100 + index * 50}>
                    <LocationCard 
                      location={location} 
                      onClick={() => setSelectedLocation(location)}
                    />
                  </Reveal>
                ))}
              </div>
            )}

            {/* Unassigned Rentals */}
            {unassignedRentals.length > 0 && (
              <Reveal delay={locationsWithRentals.length * 50 + 100}>
                <div className="mt-16">
                  <h3 className="font-serif text-2xl text-foreground mb-8 text-center">Other Properties</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {unassignedRentals.map((rental) => (
                      <div
                        key={rental.id}
                        className="group bg-card rounded-xl overflow-hidden shadow-soft cursor-pointer border border-border md:hover:shadow-elevated md:hover:border-primary/30 transition-all duration-300"
                        onClick={() => onItemClick(mapRentalToProperty(rental))}
                      >
                        <div className="relative aspect-[4/3] overflow-hidden">
                          <img
                            src={rental.thumbnail_url || '/placeholder.svg'}
                            alt={rental.title}
                            className="w-full h-full object-cover md:group-hover:scale-105 transition-transform duration-700 ease-out"
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
                          <h4 className="font-serif text-lg text-foreground mb-2 line-clamp-1 md:group-hover:text-primary transition-colors">
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
                    ))}
                  </div>
                </div>
              </Reveal>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default RentalsByLocation;