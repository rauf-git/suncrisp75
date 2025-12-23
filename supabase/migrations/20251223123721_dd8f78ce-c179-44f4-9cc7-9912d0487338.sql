-- Add metadata fields for detail pages
ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS visit_url text,
  ADD COLUMN IF NOT EXISTS heading text,
  ADD COLUMN IF NOT EXISTS content_heading text;

ALTER TABLE public.construction_projects
  ADD COLUMN IF NOT EXISTS visit_url text,
  ADD COLUMN IF NOT EXISTS heading text,
  ADD COLUMN IF NOT EXISTS content_heading text;

ALTER TABLE public.rentals
  ADD COLUMN IF NOT EXISTS visit_url text,
  ADD COLUMN IF NOT EXISTS heading text,
  ADD COLUMN IF NOT EXISTS content_heading text;

ALTER TABLE public.hospitality_projects
  ADD COLUMN IF NOT EXISTS visit_url text,
  ADD COLUMN IF NOT EXISTS heading text,
  ADD COLUMN IF NOT EXISTS content_heading text;

-- Helpful indexes for common filtering
CREATE INDEX IF NOT EXISTS idx_projects_is_featured ON public.projects (is_featured);
CREATE INDEX IF NOT EXISTS idx_projects_display_order ON public.projects (display_order);