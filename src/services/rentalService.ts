import { supabase } from "@/integrations/supabase/client";
import { TablesInsert, TablesUpdate } from "@/integrations/supabase/types";
import {
  createRentalSchema,
  updateRentalSchema,
  createLocationSchema,
  updateLocationSchema,
  uuidSchema,
  validateFile,
  type CreateRentalInput,
  type UpdateRentalInput,
  type CreateLocationInput,
  type UpdateLocationInput
} from "@/lib/validation";

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
  // Dynamic content blocks (stored as JSON)
  content_sections: unknown | null;
  is_featured: boolean;
  display_order: number;
  visit_url: string | null;
  heading: string | null;
  content_heading: string | null;
  created_at: string;
  updated_at: string;
  rental_locations?: RentalLocation;
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
    // Validate UUID
    const idResult = uuidSchema.safeParse(id);
    if (!idResult.success) {
      return { data: null, error: new Error("Invalid rental ID format") };
    }

    const { data, error } = await supabase
      .from("rentals")
      .select("*, rental_locations(*)")
      .eq("id", id)
      .maybeSingle();
    
    return { data: data as Rental | null, error };
  },

  async getByLocation(locationId: string): Promise<{ data: Rental[] | null; error: Error | null }> {
    // Validate UUID
    const idResult = uuidSchema.safeParse(locationId);
    if (!idResult.success) {
      return { data: null, error: new Error("Invalid location ID format") };
    }

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
    // Validate input with Zod schema
    const validationResult = createRentalSchema.safeParse(rental);
    if (!validationResult.success) {
      const errorMessage = validationResult.error.errors.map(e => e.message).join(", ");
      return { data: null, error: new Error(errorMessage) };
    }

    const { data, error } = await supabase
      .from("rentals")
      .insert(validationResult.data as TablesInsert<"rentals">)
      .select("*, rental_locations(*)")
      .single();
    
    return { data: data as Rental | null, error };
  },

  async update(id: string, updates: UpdateRentalInput): Promise<{ data: Rental | null; error: Error | null }> {
    // Validate UUID
    const idResult = uuidSchema.safeParse(id);
    if (!idResult.success) {
      return { data: null, error: new Error("Invalid rental ID format") };
    }

    // Validate input with Zod schema
    const validationResult = updateRentalSchema.safeParse(updates);
    if (!validationResult.success) {
      const errorMessage = validationResult.error.errors.map(e => e.message).join(", ");
      return { data: null, error: new Error(errorMessage) };
    }

    const { data, error } = await supabase
      .from("rentals")
      .update(validationResult.data as TablesUpdate<"rentals">)
      .eq("id", id)
      .select("*, rental_locations(*)")
      .single();
    
    return { data: data as Rental | null, error };
  },

  async delete(id: string): Promise<{ error: Error | null }> {
    // Validate UUID
    const idResult = uuidSchema.safeParse(id);
    if (!idResult.success) {
      return { error: new Error("Invalid rental ID format") };
    }

    const { error } = await supabase
      .from("rentals")
      .delete()
      .eq("id", id);
    
    return { error };
  },

  async updateOrder(items: { id: string; display_order: number }[]): Promise<{ error: Error | null }> {
    try {
      for (const item of items) {
        const { error } = await supabase
          .from("rentals")
          .update({ display_order: item.display_order })
          .eq("id", item.id);
        if (error) throw error;
      }
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  },
  async getAllLocations(): Promise<{ data: RentalLocation[] | null; error: Error | null }> {
    const { data, error } = await supabase
      .from("rental_locations")
      .select("*")
      .order("display_order", { ascending: true });
    
    return { data: data as RentalLocation[] | null, error };
  },

  async getLocationById(id: string): Promise<{ data: RentalLocation | null; error: Error | null }> {
    // Validate UUID
    const idResult = uuidSchema.safeParse(id);
    if (!idResult.success) {
      return { data: null, error: new Error("Invalid location ID format") };
    }

    const { data, error } = await supabase
      .from("rental_locations")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    
    return { data: data as RentalLocation | null, error };
  },

  async createLocation(location: CreateLocationInput): Promise<{ data: RentalLocation | null; error: Error | null }> {
    // Validate input with Zod schema
    const validationResult = createLocationSchema.safeParse(location);
    if (!validationResult.success) {
      const errorMessage = validationResult.error.errors.map(e => e.message).join(", ");
      return { data: null, error: new Error(errorMessage) };
    }

    const { data, error } = await supabase
      .from("rental_locations")
      .insert(validationResult.data as TablesInsert<"rental_locations">)
      .select()
      .single();
    
    return { data: data as RentalLocation | null, error };
  },

  async updateLocation(id: string, updates: UpdateLocationInput): Promise<{ data: RentalLocation | null; error: Error | null }> {
    // Validate UUID
    const idResult = uuidSchema.safeParse(id);
    if (!idResult.success) {
      return { data: null, error: new Error("Invalid location ID format") };
    }

    // Validate input with Zod schema
    const validationResult = updateLocationSchema.safeParse(updates);
    if (!validationResult.success) {
      const errorMessage = validationResult.error.errors.map(e => e.message).join(", ");
      return { data: null, error: new Error(errorMessage) };
    }

    const { data, error } = await supabase
      .from("rental_locations")
      .update(validationResult.data as TablesUpdate<"rental_locations">)
      .eq("id", id)
      .select()
      .single();
    
    return { data: data as RentalLocation | null, error };
  },

  async deleteLocation(id: string): Promise<{ error: Error | null }> {
    // Validate UUID
    const idResult = uuidSchema.safeParse(id);
    if (!idResult.success) {
      return { error: new Error("Invalid location ID format") };
    }

    const { error } = await supabase
      .from("rental_locations")
      .delete()
      .eq("id", id);
    
    return { error };
  },

  // Image upload
  async uploadImage(file: File): Promise<{ url: string | null; error: Error | null }> {
    // Validate file
    const fileValidation = validateFile(file);
    if (!fileValidation.valid) {
      return { url: null, error: new Error(fileValidation.error) };
    }

    const fileExt = file.name.split(".").pop()?.toLowerCase();
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

// Re-export types for backwards compatibility
export type { CreateRentalInput, UpdateRentalInput, CreateLocationInput, UpdateLocationInput };
