import { useState, useEffect } from 'react';
import { rentalService, RentalLocation, Rental } from '@/services/rentalService';
import Reveal from './Reveal';
import { Property } from '@/types';
import { MapPin, ChevronDown, ChevronUp } from 'lucide-react';
import ContentSections from './ContentSections';

interface RentalsByLocationProps {
  onItemClick: (item: Property) => void;
}

interface LocationWithRentals extends RentalLocation {
  rentals: Rental[];
}

const RentalsByLocation = ({ onItemClick }: RentalsByLocationProps) => {
  const [locationsWithRentals, setLocationsWithRentals] = useState<LocationWithRentals[]>([]);
  const [unassignedRentals, setUnassignedRentals] = useState<Rental[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedLocations, setExpandedLocations] = useState<Set<string>>(new Set());

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

      // Filter out locations with no rentals and sort by display_order
      const locationsWithContent = Array.from(locationMap.values())
        .filter(loc => loc.rentals.length > 0 || (loc.content_sections && loc.content_sections.length > 0))
        .sort((a, b) => a.display_order - b.display_order);

      setLocationsWithRentals(locationsWithContent);
      setUnassignedRentals(unassigned);
      
      // Auto-expand all locations
      setExpandedLocations(new Set(locationsWithContent.map(l => l.id)));
      
      setIsLoading(false);
    };

    fetchData();
  }, []);

  const toggleLocation = (locationId: string) => {
    setExpandedLocations(prev => {
      const newSet = new Set(prev);
      if (newSet.has(locationId)) {
        newSet.delete(locationId);
      } else {
        newSet.add(locationId);
      }
      return newSet;
    });
  };

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
          <div className="space-y-16">
            {/* Location-based sections */}
            {locationsWithRentals.map((location, index) => (
              <Reveal key={location.id} delay={index * 100}>
                <div className="border border-border rounded-2xl overflow-hidden bg-card shadow-soft">
                  {/* Location Header */}
                  <button
                    onClick={() => toggleLocation(location.id)}
                    className="w-full flex items-center justify-between p-6 md:p-8 bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <MapPin className="w-6 h-6 text-primary" />
                      </div>
                      <div className="text-left">
                        <h3 className="font-serif text-2xl md:text-3xl text-foreground">{location.name}</h3>
                        {location.description && (
                          <p className="text-muted-foreground mt-1">{location.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground bg-background px-3 py-1 rounded-full">
                        {location.rentals.length} {location.rentals.length === 1 ? 'property' : 'properties'}
                      </span>
                      {expandedLocations.has(location.id) ? (
                        <ChevronUp className="w-5 h-5 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>
                  </button>

                  {/* Expanded Content */}
                  {expandedLocations.has(location.id) && (
                    <div className="p-6 md:p-8 space-y-8">
                      {/* Location Rich Text Content */}
                      {location.content_sections && location.content_sections.length > 0 && (
                        <div className="mb-8">
                          <ContentSections 
                            sections={location.content_sections.map(s => ({
                              heading: s.heading || '',
                              content: s.content || '',
                              image: s.image
                            }))}
                          />
                        </div>
                      )}

                      {/* Rentals Grid */}
                      {location.rentals.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {location.rentals.map((rental) => (
                            <div
                              key={rental.id}
                              className="group bg-background rounded-xl overflow-hidden shadow-soft cursor-pointer border border-border md:hover:shadow-elevated md:hover:border-primary/30 transition-all duration-300"
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
                                {rental.address && (
                                  <p className="text-sm text-muted-foreground mb-3 flex items-center gap-1">
                                    <MapPin className="w-3 h-3" />
                                    {rental.address}
                                  </p>
                                )}
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
                      )}
                    </div>
                  )}
                </div>
              </Reveal>
            ))}

            {/* Unassigned Rentals (no location) */}
            {unassignedRentals.length > 0 && (
              <Reveal delay={locationsWithRentals.length * 100}>
                <div className="border border-border rounded-2xl overflow-hidden bg-card shadow-soft">
                  <div className="p-6 md:p-8 bg-muted/30">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                        <MapPin className="w-6 h-6 text-muted-foreground" />
                      </div>
                      <div>
                        <h3 className="font-serif text-2xl md:text-3xl text-foreground">Other Properties</h3>
                        <p className="text-muted-foreground mt-1">Additional rental opportunities</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-6 md:p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {unassignedRentals.map((rental) => (
                        <div
                          key={rental.id}
                          className="group bg-background rounded-xl overflow-hidden shadow-soft cursor-pointer border border-border md:hover:shadow-elevated md:hover:border-primary/30 transition-all duration-300"
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
                            {rental.address && (
                              <p className="text-sm text-muted-foreground mb-3 flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {rental.address}
                              </p>
                            )}
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
                </div>
              </Reveal>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default RentalsByLocation;
