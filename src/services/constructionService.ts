import { supabase } from "@/integrations/supabase/client";

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
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface CreateConstructionInput {
  title: string;
  description?: string;
  status?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  thumbnail_url?: string;
  images?: string[];
  display_order?: number;
}

export interface UpdateConstructionInput {
  title?: string;
  description?: string;
  status?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  thumbnail_url?: string;
  images?: string[];
  display_order?: number;
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
    const { data, error } = await supabase
      .from("construction_projects")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    
    return { data: data as ConstructionProject | null, error };
  },

  async create(project: CreateConstructionInput): Promise<{ data: ConstructionProject | null; error: Error | null }> {
    const { data, error } = await supabase
      .from("construction_projects")
      .insert(project)
      .select()
      .single();
    
    return { data: data as ConstructionProject | null, error };
  },

  async update(id: string, updates: UpdateConstructionInput): Promise<{ data: ConstructionProject | null; error: Error | null }> {
    const { data, error } = await supabase
      .from("construction_projects")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    
    return { data: data as ConstructionProject | null, error };
  },

  async delete(id: string): Promise<{ error: Error | null }> {
    const { error } = await supabase
      .from("construction_projects")
      .delete()
      .eq("id", id);
    
    return { error };
  },

  async uploadImage(file: File): Promise<{ url: string | null; error: Error | null }> {
    const fileExt = file.name.split(".").pop();
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