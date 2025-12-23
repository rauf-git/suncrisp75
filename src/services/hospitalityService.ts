import { supabase } from "@/integrations/supabase/client";
import { validateFile } from "@/lib/validation";
import { z } from "zod";

export interface HospitalityProject {
  id: string;
  title: string;
  description: string | null;
  short_description: string | null;
  long_description: string | null;
  location: string | null;
  thumbnail_url: string | null;
  images: string[];
  price_info: string | null;
  display_order: number;
  created_at: string;
  updated_at: string;
}

const createHospitalitySchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  description: z.string().trim().max(1000).optional(),
  short_description: z.string().trim().max(500).optional(),
  long_description: z.string().trim().max(5000).optional(),
  location: z.string().trim().max(200).optional(),
  thumbnail_url: z.string().optional(),
  images: z.array(z.string()).optional(),
  price_info: z.string().trim().max(100).optional(),
  display_order: z.number().int().min(0).max(1000).optional(),
});

const updateHospitalitySchema = createHospitalitySchema.partial();

export type CreateHospitalityInput = z.infer<typeof createHospitalitySchema>;
export type UpdateHospitalityInput = z.infer<typeof updateHospitalitySchema>;

const BUCKET_NAME = "content-images";

export const hospitalityService = {
  async getAll(): Promise<{ data: HospitalityProject[] | null; error: Error | null }> {
    const { data, error } = await supabase
      .from("hospitality_projects")
      .select("*")
      .order("display_order", { ascending: true });
    
    return { data: data as HospitalityProject[] | null, error };
  },

  async getById(id: string): Promise<{ data: HospitalityProject | null; error: Error | null }> {
    const { data, error } = await supabase
      .from("hospitality_projects")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    
    return { data: data as HospitalityProject | null, error };
  },

  async create(project: CreateHospitalityInput): Promise<{ data: HospitalityProject | null; error: Error | null }> {
    const validationResult = createHospitalitySchema.safeParse(project);
    if (!validationResult.success) {
      const errorMessage = validationResult.error.errors.map(e => e.message).join(", ");
      return { data: null, error: new Error(errorMessage) };
    }

    const insertData = {
      title: validationResult.data.title,
      description: validationResult.data.description ?? null,
      short_description: validationResult.data.short_description ?? null,
      long_description: validationResult.data.long_description ?? null,
      location: validationResult.data.location ?? null,
      thumbnail_url: validationResult.data.thumbnail_url ?? null,
      images: validationResult.data.images ?? [],
      price_info: validationResult.data.price_info ?? null,
      display_order: validationResult.data.display_order ?? 0,
    };

    const { data, error } = await supabase
      .from("hospitality_projects")
      .insert(insertData)
      .select()
      .single();
    
    return { data: data as HospitalityProject | null, error };
  },

  async update(id: string, updates: UpdateHospitalityInput): Promise<{ data: HospitalityProject | null; error: Error | null }> {
    const validationResult = updateHospitalitySchema.safeParse(updates);
    if (!validationResult.success) {
      const errorMessage = validationResult.error.errors.map(e => e.message).join(", ");
      return { data: null, error: new Error(errorMessage) };
    }

    const { data, error } = await supabase
      .from("hospitality_projects")
      .update(validationResult.data)
      .eq("id", id)
      .select()
      .single();
    
    return { data: data as HospitalityProject | null, error };
  },

  async delete(id: string): Promise<{ error: Error | null }> {
    const { error } = await supabase
      .from("hospitality_projects")
      .delete()
      .eq("id", id);
    
    return { error };
  },

  async updateOrder(items: { id: string; display_order: number }[]): Promise<{ error: Error | null }> {
    for (const item of items) {
      const { error } = await supabase
        .from("hospitality_projects")
        .update({ display_order: item.display_order })
        .eq("id", item.id);
      
      if (error) return { error };
    }
    return { error: null };
  },

  async uploadImage(file: File): Promise<{ url: string | null; error: Error | null }> {
    const fileValidation = validateFile(file);
    if (!fileValidation.valid) {
      return { url: null, error: new Error(fileValidation.error) };
    }

    const fileExt = file.name.split(".").pop()?.toLowerCase();
    const fileName = `hospitality/${crypto.randomUUID()}.${fileExt}`;

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
