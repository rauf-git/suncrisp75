import { supabase } from "@/integrations/supabase/client";
import { Json } from "@/integrations/supabase/types";

export interface ContentSection {
  heading: string;
  content: string;
}

export interface PageContent {
  id: string;
  page_key: string;
  title: string | null;
  subtitle: string | null;
  hero_image: string | null;
  content_sections: ContentSection[];
  created_at: string;
  updated_at: string;
}

export interface UpdatePageContentInput {
  title?: string | null;
  subtitle?: string | null;
  hero_image?: string | null;
  content_sections?: ContentSection[];
}

// Helper to safely parse content sections
const parseContentSections = (data: Json | null | undefined): ContentSection[] => {
  if (!data) return [];
  if (Array.isArray(data)) {
    return data.map((item) => ({
      heading: String((item as Record<string, unknown>)?.heading || ''),
      content: String((item as Record<string, unknown>)?.content || ''),
    }));
  }
  return [];
};

export const pageContentService = {
  async getByKey(pageKey: string): Promise<{ data: PageContent | null; error: Error | null }> {
    const { data, error } = await supabase
      .from("page_content")
      .select("*")
      .eq("page_key", pageKey)
      .maybeSingle();

    if (error) {
      return { data: null, error };
    }

    if (data) {
      return {
        data: {
          id: data.id,
          page_key: data.page_key,
          title: data.title,
          subtitle: data.subtitle,
          hero_image: data.hero_image,
          content_sections: parseContentSections(data.content_sections),
          created_at: data.created_at,
          updated_at: data.updated_at,
        },
        error: null,
      };
    }

    return { data: null, error: null };
  },

  async update(pageKey: string, updates: UpdatePageContentInput): Promise<{ data: PageContent | null; error: Error | null }> {
    const updateData: Record<string, unknown> = {};
    
    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.subtitle !== undefined) updateData.subtitle = updates.subtitle;
    if (updates.hero_image !== undefined) updateData.hero_image = updates.hero_image;
    if (updates.content_sections !== undefined) {
      updateData.content_sections = updates.content_sections as unknown as Json;
    }

    const { data, error } = await supabase
      .from("page_content")
      .update(updateData)
      .eq("page_key", pageKey)
      .select()
      .single();

    if (error) {
      return { data: null, error };
    }

    return {
      data: {
        id: data.id,
        page_key: data.page_key,
        title: data.title,
        subtitle: data.subtitle,
        hero_image: data.hero_image,
        content_sections: parseContentSections(data.content_sections),
        created_at: data.created_at,
        updated_at: data.updated_at,
      },
      error: null,
    };
  },

  async upsert(pageKey: string, updates: UpdatePageContentInput): Promise<{ data: PageContent | null; error: Error | null }> {
    const { data, error } = await supabase
      .from("page_content")
      .upsert(
        {
          page_key: pageKey,
          title: updates.title,
          subtitle: updates.subtitle,
          hero_image: updates.hero_image,
          content_sections: (updates.content_sections || []) as unknown as Json,
        },
        { onConflict: 'page_key' }
      )
      .select()
      .single();

    if (error) {
      return { data: null, error };
    }

    return {
      data: {
        id: data.id,
        page_key: data.page_key,
        title: data.title,
        subtitle: data.subtitle,
        hero_image: data.hero_image,
        content_sections: parseContentSections(data.content_sections),
        created_at: data.created_at,
        updated_at: data.updated_at,
      },
      error: null,
    };
  },
};
