import { supabase } from "@/integrations/supabase/client";
import { Json, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";
import {
  createPageBlockSchema,
  updatePageBlockSchema,
  uuidSchema,
  type CreatePageBlockInput,
  type UpdatePageBlockInput
} from "@/lib/validation";

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

export const pageBlockService = {
  async getByPage(pageKey: string): Promise<{ data: PageBlock[] | null; error: Error | null }> {
    // Validate page key
    const sanitizedPageKey = pageKey.trim().slice(0, 100);
    if (!sanitizedPageKey) {
      return { data: null, error: new Error("Page key is required") };
    }

    const { data, error } = await supabase
      .from("page_blocks")
      .select("*")
      .eq("page_key", sanitizedPageKey)
      .order("display_order", { ascending: true });
    
    return { data: data as PageBlock[] | null, error };
  },

  async getByKey(pageKey: string, blockKey: string): Promise<{ data: PageBlock | null; error: Error | null }> {
    // Validate keys
    const sanitizedPageKey = pageKey.trim().slice(0, 100);
    const sanitizedBlockKey = blockKey.trim().slice(0, 100);
    
    if (!sanitizedPageKey || !sanitizedBlockKey) {
      return { data: null, error: new Error("Page key and block key are required") };
    }

    const { data, error } = await supabase
      .from("page_blocks")
      .select("*")
      .eq("page_key", sanitizedPageKey)
      .eq("block_key", sanitizedBlockKey)
      .maybeSingle();
    
    return { data: data as PageBlock | null, error };
  },

  async create(block: CreatePageBlockInput): Promise<{ data: PageBlock | null; error: Error | null }> {
    // Validate input with Zod schema
    const validationResult = createPageBlockSchema.safeParse(block);
    if (!validationResult.success) {
      const errorMessage = validationResult.error.errors.map(e => e.message).join(", ");
      return { data: null, error: new Error(errorMessage) };
    }

    const insertData: TablesInsert<"page_blocks"> = {
      page_key: validationResult.data.page_key,
      block_type: validationResult.data.block_type,
      block_key: validationResult.data.block_key,
      content: validationResult.data.content as unknown as Json,
      display_order: validationResult.data.display_order,
      is_active: validationResult.data.is_active,
    };
    
    const { data, error } = await supabase
      .from("page_blocks")
      .insert(insertData)
      .select()
      .single();
    
    return { data: data as PageBlock | null, error };
  },

  async update(id: string, updates: UpdatePageBlockInput): Promise<{ data: PageBlock | null; error: Error | null }> {
    // Validate UUID
    const idResult = uuidSchema.safeParse(id);
    if (!idResult.success) {
      return { data: null, error: new Error("Invalid page block ID format") };
    }

    // Validate input with Zod schema
    const validationResult = updatePageBlockSchema.safeParse(updates);
    if (!validationResult.success) {
      const errorMessage = validationResult.error.errors.map(e => e.message).join(", ");
      return { data: null, error: new Error(errorMessage) };
    }

    const updateData: TablesUpdate<"page_blocks"> = {
      display_order: validationResult.data.display_order,
      is_active: validationResult.data.is_active,
    };
    
    if (validationResult.data.content) {
      updateData.content = validationResult.data.content as unknown as Json;
    }
    
    const { data, error } = await supabase
      .from("page_blocks")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();
    
    return { data: data as PageBlock | null, error };
  },

  async updateByKey(pageKey: string, blockKey: string, updates: UpdatePageBlockInput): Promise<{ data: PageBlock | null; error: Error | null }> {
    // Validate keys
    const sanitizedPageKey = pageKey.trim().slice(0, 100);
    const sanitizedBlockKey = blockKey.trim().slice(0, 100);
    
    if (!sanitizedPageKey || !sanitizedBlockKey) {
      return { data: null, error: new Error("Page key and block key are required") };
    }

    // Validate input with Zod schema
    const validationResult = updatePageBlockSchema.safeParse(updates);
    if (!validationResult.success) {
      const errorMessage = validationResult.error.errors.map(e => e.message).join(", ");
      return { data: null, error: new Error(errorMessage) };
    }

    const updateData: TablesUpdate<"page_blocks"> = {
      display_order: validationResult.data.display_order,
      is_active: validationResult.data.is_active,
    };
    
    if (validationResult.data.content) {
      updateData.content = validationResult.data.content as unknown as Json;
    }
    
    const { data, error } = await supabase
      .from("page_blocks")
      .update(updateData)
      .eq("page_key", sanitizedPageKey)
      .eq("block_key", sanitizedBlockKey)
      .select()
      .single();
    
    return { data: data as PageBlock | null, error };
  },

  async delete(id: string): Promise<{ error: Error | null }> {
    // Validate UUID
    const idResult = uuidSchema.safeParse(id);
    if (!idResult.success) {
      return { error: new Error("Invalid page block ID format") };
    }

    const { error } = await supabase
      .from("page_blocks")
      .delete()
      .eq("id", id);
    
    return { error };
  },

  async reorder(pageKey: string, orderedIds: string[]): Promise<{ error: Error | null }> {
    // Validate page key
    const sanitizedPageKey = pageKey.trim().slice(0, 100);
    if (!sanitizedPageKey) {
      return { error: new Error("Page key is required") };
    }

    // Validate all IDs
    for (const id of orderedIds) {
      const idResult = uuidSchema.safeParse(id);
      if (!idResult.success) {
        return { error: new Error("Invalid page block ID format in reorder list") };
      }
    }

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

// Re-export types for backwards compatibility
export type { CreatePageBlockInput, UpdatePageBlockInput };
