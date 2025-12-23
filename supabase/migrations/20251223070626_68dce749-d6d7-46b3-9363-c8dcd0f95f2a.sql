-- ============================================
-- SUNCRISP FULL CMS DATABASE SCHEMA
-- ============================================

-- 1. EXTEND PROJECTS TABLE
-- Add new fields for portfolio projects
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS location text,
ADD COLUMN IF NOT EXISTS short_description text,
ADD COLUMN IF NOT EXISTS long_description text,
ADD COLUMN IF NOT EXISTS display_order integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS images text[] DEFAULT '{}';

-- Create index for ordering
CREATE INDEX IF NOT EXISTS idx_projects_display_order ON public.projects(display_order);

-- 2. PAGE BLOCKS TABLE (Block-based CMS)
CREATE TABLE IF NOT EXISTS public.page_blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_key text NOT NULL, -- e.g., 'home', 'about', 'contact', 'portfolio', etc.
  block_type text NOT NULL, -- e.g., 'hero', 'text', 'image', 'gallery', 'cta', 'section'
  block_key text NOT NULL, -- unique identifier within the page, e.g., 'hero_main', 'about_intro'
  content jsonb NOT NULL DEFAULT '{}', -- flexible content: { title, subtitle, text, image_url, images, etc. }
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL,
  UNIQUE(page_key, block_key)
);

-- Enable RLS
ALTER TABLE public.page_blocks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for page_blocks
CREATE POLICY "Anyone can view active page blocks"
ON public.page_blocks FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage page blocks"
ON public.page_blocks FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- Trigger for updated_at
CREATE TRIGGER update_page_blocks_updated_at
BEFORE UPDATE ON public.page_blocks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Index for faster lookups
CREATE INDEX idx_page_blocks_page_key ON public.page_blocks(page_key);
CREATE INDEX idx_page_blocks_display_order ON public.page_blocks(page_key, display_order);

-- 3. CONSTRUCTION PROJECTS TABLE
CREATE TABLE IF NOT EXISTS public.construction_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  status text DEFAULT 'Under Construction', -- e.g., 'Under Construction', 'Completed', 'Planning'
  address text,
  latitude decimal(10, 8),
  longitude decimal(11, 8),
  thumbnail_url text,
  images text[] DEFAULT '{}',
  display_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.construction_projects ENABLE ROW LEVEL SECURITY;

-- RLS Policies for construction_projects
CREATE POLICY "Anyone can view construction projects"
ON public.construction_projects FOR SELECT
USING (true);

CREATE POLICY "Admins can insert construction projects"
ON public.construction_projects FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update construction projects"
ON public.construction_projects FOR UPDATE
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete construction projects"
ON public.construction_projects FOR DELETE
USING (has_role(auth.uid(), 'admin'));

-- Trigger for updated_at
CREATE TRIGGER update_construction_projects_updated_at
BEFORE UPDATE ON public.construction_projects
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Index for ordering
CREATE INDEX idx_construction_projects_display_order ON public.construction_projects(display_order);

-- 4. RENTAL LOCATIONS TABLE (for grouping rentals)
CREATE TABLE IF NOT EXISTS public.rental_locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  image_url text,
  display_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.rental_locations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for rental_locations
CREATE POLICY "Anyone can view rental locations"
ON public.rental_locations FOR SELECT
USING (true);

CREATE POLICY "Admins can insert rental locations"
ON public.rental_locations FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update rental locations"
ON public.rental_locations FOR UPDATE
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete rental locations"
ON public.rental_locations FOR DELETE
USING (has_role(auth.uid(), 'admin'));

-- Trigger for updated_at
CREATE TRIGGER update_rental_locations_updated_at
BEFORE UPDATE ON public.rental_locations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Index for ordering
CREATE INDEX idx_rental_locations_display_order ON public.rental_locations(display_order);

-- 5. RENTALS TABLE (separate from portfolio)
CREATE TABLE IF NOT EXISTS public.rentals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  short_description text,
  long_description text,
  location_id uuid REFERENCES public.rental_locations(id) ON DELETE SET NULL,
  address text,
  price text, -- e.g., "$500/night", "From $2000/month"
  bedrooms integer,
  bathrooms integer,
  area text, -- e.g., "150 sqm"
  amenities text[] DEFAULT '{}',
  thumbnail_url text,
  images text[] DEFAULT '{}',
  is_featured boolean DEFAULT false,
  display_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.rentals ENABLE ROW LEVEL SECURITY;

-- RLS Policies for rentals
CREATE POLICY "Anyone can view rentals"
ON public.rentals FOR SELECT
USING (true);

CREATE POLICY "Admins can insert rentals"
ON public.rentals FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update rentals"
ON public.rentals FOR UPDATE
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete rentals"
ON public.rentals FOR DELETE
USING (has_role(auth.uid(), 'admin'));

-- Trigger for updated_at
CREATE TRIGGER update_rentals_updated_at
BEFORE UPDATE ON public.rentals
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Indexes
CREATE INDEX idx_rentals_location_id ON public.rentals(location_id);
CREATE INDEX idx_rentals_display_order ON public.rentals(display_order);
CREATE INDEX idx_rentals_featured ON public.rentals(is_featured);

-- 6. CREATE STORAGE BUCKET FOR GENERAL IMAGES
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('content-images', 'content-images', true, 10485760)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for content-images bucket
CREATE POLICY "Public read access for content images"
ON storage.objects FOR SELECT
USING (bucket_id = 'content-images');

CREATE POLICY "Admins can upload content images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'content-images' AND has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update content images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'content-images' AND has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete content images"
ON storage.objects FOR DELETE
USING (bucket_id = 'content-images' AND has_role(auth.uid(), 'admin'));

-- 7. INSERT DEFAULT PAGE BLOCKS FOR HOME PAGE
INSERT INTO public.page_blocks (page_key, block_key, block_type, content, display_order) VALUES
('home', 'hero', 'hero', '{"title": "SunCrisp", "subtitle": "CONSTRUCTIONS | RENTALS | HOSPITALITY", "description": "From groundbreaking construction to exquisite rentals and world-class experiences. We build the future and curate the present.", "background_image": ""}', 1),
('home', 'about_intro', 'section', '{"title": "About Us", "text": "We are a premier hospitality and construction company dedicated to excellence."}', 2),
('about', 'main', 'section', '{"title": "About SunCrisp Hospitality", "text": "Our story of excellence and dedication to quality."}', 1),
('contact', 'info', 'contact', '{"title": "Get in Touch", "email": "info@suncrisp.com", "phone": "+1 234 567 890", "address": "123 Business Ave, Dubai, UAE", "latitude": 25.2048, "longitude": 55.2708}', 1)
ON CONFLICT (page_key, block_key) DO NOTHING;