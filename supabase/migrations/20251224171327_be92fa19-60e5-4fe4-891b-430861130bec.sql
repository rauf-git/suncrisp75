-- Add content_sections column to rental_locations for rich text content
ALTER TABLE public.rental_locations
  ADD COLUMN IF NOT EXISTS content_sections jsonb DEFAULT '[]'::jsonb;