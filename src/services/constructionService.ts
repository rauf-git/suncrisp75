import { supabase } from "@/integrations/supabase/client";
import { TablesInsert, TablesUpdate } from "@/integrations/supabase/types";
import {
  createConstructionSchema,
  updateConstructionSchema,
  uuidSchema,
  validateFile,
  type CreateConstructionInput,
  type UpdateConstructionInput
} from "@/lib/validation";

export interface ConstructionProject {
  id: string;
  title: string;
  description: string | null;
  status: string;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  thumbnail_url: string | null;
  images: string[];
  // Dynamic content blocks (stored as JSON)
  content_sections: unknown | null;
  display_order: number;
  visit_url: string | null;
  heading: string | null;
  content_heading: string | null;
  created_at: string;
  updated_at: string;
}

const BUCKET_NAME = "content-images";

export const constructionService = {
  async getAll(): Promise<{ data: ConstructionProject[] | null; error: Error | null }> {
    const { data, error } = await supabase
      .from("construction_projects")
      .select("*")
      .order("display_order", { ascending: true });
    
    return { data: data as ConstructionProject[] | null, error };
  },

  async getById(id: string): Promise<{ data: ConstructionProject | null; error: Error | null }> {
    // Validate UUID
    const idResult = uuidSchema.safeParse(id);
    if (!idResult.success) {
      return { data: null, error: new Error("Invalid construction project ID format") };
    }

    const { data, error } = await supabase
      .from("construction_projects")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    
    return { data: data as ConstructionProject | null, error };
  },

  async create(project: CreateConstructionInput): Promise<{ data: ConstructionProject | null; error: Error | null }> {
    // Validate input with Zod schema
    const validationResult = createConstructionSchema.safeParse(project);
    if (!validationResult.success) {
      const errorMessage = validationResult.error.errors.map(e => e.message).join(", ");
      return { data: null, error: new Error(errorMessage) };
    }

    const { data, error } = await supabase
      .from("construction_projects")
      .insert(validationResult.data as TablesInsert<"construction_projects">)
      .select()
      .single();
    
    return { data: data as ConstructionProject | null, error };
  },

  async update(id: string, updates: UpdateConstructionInput): Promise<{ data: ConstructionProject | null; error: Error | null }> {
    // Validate UUID
    const idResult = uuidSchema.safeParse(id);
    if (!idResult.success) {
      return { data: null, error: new Error("Invalid construction project ID format") };
    }

    // Validate input with Zod schema
    const validationResult = updateConstructionSchema.safeParse(updates);
    if (!validationResult.success) {
      const errorMessage = validationResult.error.errors.map(e => e.message).join(", ");
      return { data: null, error: new Error(errorMessage) };
    }

    const { data, error } = await supabase
      .from("construction_projects")
      .update(validationResult.data as TablesUpdate<"construction_projects">)
      .eq("id", id)
      .select()
      .single();
    
    return { data: data as ConstructionProject | null, error };
  },

  async delete(id: string): Promise<{ error: Error | null }> {
    // Validate UUID
    const idResult = uuidSchema.safeParse(id);
    if (!idResult.success) {
      return { error: new Error("Invalid construction project ID format") };
    }

    const { error } = await supabase
      .from("construction_projects")
      .delete()
      .eq("id", id);
    
    return { error };
  },

  async uploadImage(file: File): Promise<{ url: string | null; error: Error | null }> {
    // Validate file
    const fileValidation = validateFile(file);
    if (!fileValidation.valid) {
      return { url: null, error: new Error(fileValidation.error) };
    }

    const fileExt = file.name.split(".").pop()?.toLowerCase();
    const fileName = `construction/${crypto.randomUUID()}.${fileExt}`;

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
export type { CreateConstructionInput, UpdateConstructionInput };
