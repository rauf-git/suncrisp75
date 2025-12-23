import { supabase } from "@/integrations/supabase/client";
import { Json } from "@/integrations/supabase/types";

export interface PageBlockContent {
  title?: string;
  subtitle?: string;
  description?: string;
  text?: string;
  image_url?: string;
  background_image?: string;
  images?: string[];
  email?: string;
  phone?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  [key: string]: unknown;
}

export interface PageBlock {
  id: string;
  page_key: string;
  block_type: string;
  block_key: string;
  content: PageBlockContent;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreatePageBlockInput {
  page_key: string;
  block_type: string;
  block_key: string;
  content: PageBlockContent;
  display_order?: number;
  is_active?: boolean;
}

export interface UpdatePageBlockInput {
  content?: PageBlockContent;
  display_order?: number;
  is_active?: boolean;
}

export const pageBlockService = {
  async getByPage(pageKey: string): Promise<{ data: PageBlock[] | null; error: Error | null }> {
    const { data, error } = await supabase
      .from("page_blocks")
      .select("*")
      .eq("page_key", pageKey)
      .order("display_order", { ascending: true });
    
    return { data: data as PageBlock[] | null, error };
  },

  async getByKey(pageKey: string, blockKey: string): Promise<{ data: PageBlock | null; error: Error | null }> {
    const { data, error } = await supabase
      .from("page_blocks")
      .select("*")
      .eq("page_key", pageKey)
      .eq("block_key", blockKey)
      .maybeSingle();
    
    return { data: data as PageBlock | null, error };
  },

  async create(block: CreatePageBlockInput): Promise<{ data: PageBlock | null; error: Error | null }> {
    const insertData = {
      ...block,
      content: block.content as unknown as Json,
    };
    
    const { data, error } = await supabase
      .from("page_blocks")
      .insert(insertData)
      .select()
      .single();
    
    return { data: data as PageBlock | null, error };
  },

  async update(id: string, updates: UpdatePageBlockInput): Promise<{ data: PageBlock | null; error: Error | null }> {
    const updateData = {
      ...updates,
      content: updates.content ? (updates.content as unknown as Json) : undefined,
    };
    
    const { data, error } = await supabase
      .from("page_blocks")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();
    
    return { data: data as PageBlock | null, error };
  },

  async updateByKey(pageKey: string, blockKey: string, updates: UpdatePageBlockInput): Promise<{ data: PageBlock | null; error: Error | null }> {
    const updateData = {
      ...updates,
      content: updates.content ? (updates.content as unknown as Json) : undefined,
    };
    
    const { data, error } = await supabase
      .from("page_blocks")
      .update(updateData)
      .eq("page_key", pageKey)
      .eq("block_key", blockKey)
      .select()
      .single();
    
    return { data: data as PageBlock | null, error };
  },

  async delete(id: string): Promise<{ error: Error | null }> {
    const { error } = await supabase
      .from("page_blocks")
      .delete()
      .eq("id", id);
    
    return { error };
  },

  async reorder(pageKey: string, orderedIds: string[]): Promise<{ error: Error | null }> {
    const updates = orderedIds.map((id, index) => ({
      id,
      display_order: index + 1,
    }));

    for (const update of updates) {
      const { error } = await supabase
        .from("page_blocks")
        .update({ display_order: update.display_order })
        .eq("id", update.id);
      
      if (error) return { error };
    }

    return { error: null };
  },
};