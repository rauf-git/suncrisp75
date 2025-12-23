import { supabase } from "@/integrations/supabase/client";

export interface RentalLocation {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface Rental {
  id: string;
  title: string;
  short_description: string | null;
  long_description: string | null;
  location_id: string | null;
  address: string | null;
  price: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  area: string | null;
  amenities: string[];
  thumbnail_url: string | null;
  images: string[];
  is_featured: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
  rental_locations?: RentalLocation;
}

export interface CreateRentalInput {
  title: string;
  short_description?: string;
  long_description?: string;
  location_id?: string;
  address?: string;
  price?: string;
  bedrooms?: number;
  bathrooms?: number;
  area?: string;
  amenities?: string[];
  thumbnail_url?: string;
  images?: string[];
  is_featured?: boolean;
  display_order?: number;
}

export interface UpdateRentalInput {
  title?: string;
  short_description?: string;
  long_description?: string;
  location_id?: string;
  address?: string;
  price?: string;
  bedrooms?: number;
  bathrooms?: number;
  area?: string;
  amenities?: string[];
  thumbnail_url?: string;
  images?: string[];
  is_featured?: boolean;
  display_order?: number;
}

export interface CreateLocationInput {
  name: string;
  description?: string;
  image_url?: string;
  display_order?: number;
}

export interface UpdateLocationInput {
  name?: string;
  description?: string;
  image_url?: string;
  display_order?: number;
}

const BUCKET_NAME = "content-images";

export const rentalService = {
  // Rentals
  async getAll(): Promise<{ data: Rental[] | null; error: Error | null }> {
    const { data, error } = await supabase
      .from("rentals")
      .select("*, rental_locations(*)")
      .order("display_order", { ascending: true });
    
    return { data: data as Rental[] | null, error };
  },

  async getById(id: string): Promise<{ data: Rental | null; error: Error | null }> {
    const { data, error } = await supabase
      .from("rentals")
      .select("*, rental_locations(*)")
      .eq("id", id)
      .maybeSingle();
    
    return { data: data as Rental | null, error };
  },

  async getByLocation(locationId: string): Promise<{ data: Rental[] | null; error: Error | null }> {
    const { data, error } = await supabase
      .from("rentals")
      .select("*, rental_locations(*)")
      .eq("location_id", locationId)
      .order("display_order", { ascending: true });
    
    return { data: data as Rental[] | null, error };
  },

  async getFeatured(): Promise<{ data: Rental[] | null; error: Error | null }> {
    const { data, error } = await supabase
      .from("rentals")
      .select("*, rental_locations(*)")
      .eq("is_featured", true)
      .order("display_order", { ascending: true });
    
    return { data: data as Rental[] | null, error };
  },

  async create(rental: CreateRentalInput): Promise<{ data: Rental | null; error: Error | null }> {
    const { data, error } = await supabase
      .from("rentals")
      .insert(rental)
      .select("*, rental_locations(*)")
      .single();
    
    return { data: data as Rental | null, error };
  },

  async update(id: string, updates: UpdateRentalInput): Promise<{ data: Rental | null; error: Error | null }> {
    const { data, error } = await supabase
      .from("rentals")
      .update(updates)
      .eq("id", id)
      .select("*, rental_locations(*)")
      .single();
    
    return { data: data as Rental | null, error };
  },

  async delete(id: string): Promise<{ error: Error | null }> {
    const { error } = await supabase
      .from("rentals")
      .delete()
      .eq("id", id);
    
    return { error };
  },

  // Locations
  async getAllLocations(): Promise<{ data: RentalLocation[] | null; error: Error | null }> {
    const { data, error } = await supabase
      .from("rental_locations")
      .select("*")
      .order("display_order", { ascending: true });
    
    return { data: data as RentalLocation[] | null, error };
  },

  async getLocationById(id: string): Promise<{ data: RentalLocation | null; error: Error | null }> {
    const { data, error } = await supabase
      .from("rental_locations")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    
    return { data: data as RentalLocation | null, error };
  },

  async createLocation(location: CreateLocationInput): Promise<{ data: RentalLocation | null; error: Error | null }> {
    const { data, error } = await supabase
      .from("rental_locations")
      .insert(location)
      .select()
      .single();
    
    return { data: data as RentalLocation | null, error };
  },

  async updateLocation(id: string, updates: UpdateLocationInput): Promise<{ data: RentalLocation | null; error: Error | null }> {
    const { data, error } = await supabase
      .from("rental_locations")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    
    return { data: data as RentalLocation | null, error };
  },

  async deleteLocation(id: string): Promise<{ error: Error | null }> {
    const { error } = await supabase
      .from("rental_locations")
      .delete()
      .eq("id", id);
    
    return { error };
  },

  // Image upload
  async uploadImage(file: File): Promise<{ url: string | null; error: Error | null }> {
    const fileExt = file.name.split(".").pop();
    const fileName = `rentals/${crypto.randomUUID()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, file);

    if (uploadError) {
      return { url: null, error: uploadError };
    }

    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(fileName);

    return { url: urlData.publicUrl, error: null };
  },

  async deleteImage(imageUrl: string): Promise<{ error: Error | null }> {
    const urlParts = imageUrl.split(`${BUCKET_NAME}/`);
    if (urlParts.length < 2) {
      return { error: null };
    }
    
    const filePath = urlParts[1];
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([filePath]);
    
    return { error };
  },
};