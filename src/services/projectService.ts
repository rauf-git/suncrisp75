import { supabase } from "@/integrations/supabase/client";
import { TablesInsert, TablesUpdate } from "@/integrations/supabase/types";
import { 
  createProjectSchema, 
  updateProjectSchema, 
  uuidSchema,
  validateFile,
  type CreateProjectInput,
  type UpdateProjectInput
} from "@/lib/validation";

export interface Project {
  id: string;
  title: string;
  description: string | null;
  short_description: string | null;
  long_description: string | null;
  location: string | null;
  category: string | null;
  image_url: string;
  images: string[];
  display_order: number;
  is_featured: boolean;
  visit_url: string | null;
  heading: string | null;
  content_heading: string | null;
  created_at: string;
  updated_at: string;
}

const BUCKET_NAME = "project-images";

export const projectService = {
  async getAll(): Promise<{ data: Project[] | null; error: Error | null }> {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("display_order", { ascending: true });
    
    return { data, error };
  },

  async getByCategory(category: string): Promise<{ data: Project[] | null; error: Error | null }> {
    const sanitizedCategory = category.trim().slice(0, 100);
    if (!sanitizedCategory) {
      return { data: null, error: new Error("Category is required") };
    }

    // Use a wildcard pattern to handle minor variations (case/whitespace)
    const pattern = `%${sanitizedCategory}%`;

    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .ilike("category", pattern)
      .order("display_order", { ascending: true });

    return { data, error };
  },

  async getById(id: string): Promise<{ data: Project | null; error: Error | null }> {
    // Validate UUID
    const idResult = uuidSchema.safeParse(id);
    if (!idResult.success) {
      return { data: null, error: new Error("Invalid project ID format") };
    }

    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("id", id)
      .single();
    
    return { data, error };
  },

  async create(project: CreateProjectInput): Promise<{ data: Project | null; error: Error | null }> {
    // Validate input with Zod schema
    const validationResult = createProjectSchema.safeParse(project);
    if (!validationResult.success) {
      const errorMessage = validationResult.error.errors.map(e => e.message).join(", ");
      return { data: null, error: new Error(errorMessage) };
    }

    const { data, error } = await supabase
      .from("projects")
      .insert(validationResult.data as TablesInsert<"projects">)
      .select()
      .single();
    
    return { data, error };
  },

  async update(id: string, updates: UpdateProjectInput): Promise<{ data: Project | null; error: Error | null }> {
    // Validate UUID
    const idResult = uuidSchema.safeParse(id);
    if (!idResult.success) {
      return { data: null, error: new Error("Invalid project ID format") };
    }

    // Validate input with Zod schema
    const validationResult = updateProjectSchema.safeParse(updates);
    if (!validationResult.success) {
      const errorMessage = validationResult.error.errors.map(e => e.message).join(", ");
      return { data: null, error: new Error(errorMessage) };
    }

    const { data, error } = await supabase
      .from("projects")
      .update(validationResult.data as TablesUpdate<"projects">)
      .eq("id", id)
      .select()
      .single();
    
    return { data, error };
  },

  async delete(id: string): Promise<{ error: Error | null }> {
    // Validate UUID
    const idResult = uuidSchema.safeParse(id);
    if (!idResult.success) {
      return { error: new Error("Invalid project ID format") };
    }

    const { error } = await supabase
      .from("projects")
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
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file);

    if (uploadError) {
      return { url: null, error: uploadError };
    }

    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);

    return { url: urlData.publicUrl, error: null };
  },

  async deleteImage(imageUrl: string): Promise<{ error: Error | null }> {
    // Extract file path from URL
    const urlParts = imageUrl.split(`${BUCKET_NAME}/`);
    if (urlParts.length < 2) {
      return { error: null }; // Not a storage URL, skip deletion
    }
    
    const filePath = urlParts[1];
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([filePath]);
    
    return { error };
  },

  getAcceptedFileTypes(): string {
    return "image/jpeg,image/png,image/webp";
  },

  getMaxFileSize(): number {
    return 5 * 1024 * 1024; // 5MB
  },

  validateFile(file: File): { valid: boolean; error?: string } {
    return validateFile(file);
  },
};

// Re-export types for backwards compatibility
export type { CreateProjectInput, UpdateProjectInput };
