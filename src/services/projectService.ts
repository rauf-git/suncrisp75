import { supabase } from "@/integrations/supabase/client";

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
  created_at: string;
  updated_at: string;
}

export interface CreateProjectInput {
  title: string;
  description?: string;
  short_description?: string;
  long_description?: string;
  location?: string;
  category?: string;
  image_url: string;
  images?: string[];
  display_order?: number;
}

export interface UpdateProjectInput {
  title?: string;
  description?: string;
  short_description?: string;
  long_description?: string;
  location?: string;
  category?: string;
  image_url?: string;
  images?: string[];
  display_order?: number;
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
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .ilike("category", category)
      .order("display_order", { ascending: true });
    
    return { data, error };
  },

  async getById(id: string): Promise<{ data: Project | null; error: Error | null }> {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("id", id)
      .single();
    
    return { data, error };
  },

  async create(project: CreateProjectInput): Promise<{ data: Project | null; error: Error | null }> {
    const { data, error } = await supabase
      .from("projects")
      .insert(project)
      .select()
      .single();
    
    return { data, error };
  },

  async update(id: string, updates: UpdateProjectInput): Promise<{ data: Project | null; error: Error | null }> {
    const { data, error } = await supabase
      .from("projects")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    
    return { data, error };
  },

  async delete(id: string): Promise<{ error: Error | null }> {
    const { error } = await supabase
      .from("projects")
      .delete()
      .eq("id", id);
    
    return { error };
  },

  async uploadImage(file: File): Promise<{ url: string | null; error: Error | null }> {
    const fileExt = file.name.split(".").pop();
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
    const acceptedTypes = ["image/jpeg", "image/png", "image/webp"];
    const maxSize = this.getMaxFileSize();

    if (!acceptedTypes.includes(file.type)) {
      return { valid: false, error: "Only JPG, PNG, and WEBP files are allowed" };
    }

    if (file.size > maxSize) {
      return { valid: false, error: "File size must be less than 5MB" };
    }

    return { valid: true };
  },
};
