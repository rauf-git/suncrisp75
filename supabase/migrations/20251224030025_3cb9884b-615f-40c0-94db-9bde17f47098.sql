-- Add content_sections column to projects table for dynamic content blocks
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS content_sections jsonb DEFAULT '[]'::jsonb;

-- Add content_sections column to construction_projects table
ALTER TABLE public.construction_projects 
ADD COLUMN IF NOT EXISTS content_sections jsonb DEFAULT '[]'::jsonb;

-- Add content_sections column to rentals table
ALTER TABLE public.rentals 
ADD COLUMN IF NOT EXISTS content_sections jsonb DEFAULT '[]'::jsonb;

-- Add content_sections column to hospitality_projects table  
ALTER TABLE public.hospitality_projects 
ADD COLUMN IF NOT EXISTS content_sections jsonb DEFAULT '[]'::jsonb;

-- Create page_content table for About Us and Brand Story pages
CREATE TABLE IF NOT EXISTS public.page_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_key text NOT NULL UNIQUE,
  title text,
  subtitle text,
  hero_image text,
  content_sections jsonb DEFAULT '[]'::jsonb,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Enable RLS on page_content
ALTER TABLE public.page_content ENABLE ROW LEVEL SECURITY;

-- RLS policies for page_content
CREATE POLICY "Anyone can view page content" 
ON public.page_content 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can insert page content" 
ON public.page_content 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update page content" 
ON public.page_content 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete page content" 
ON public.page_content 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Insert default content for About Us and Brand Story pages
INSERT INTO public.page_content (page_key, title, subtitle, content_sections) VALUES
('about-us', 'About SunCrisp', 'Our Story of Excellence', '[{"heading": "Our Vision", "content": "At Suncrisp Hospitality, we believe that true luxury lies in the integrity of construction and the art of service."}]'::jsonb),
('brand-story', 'Our Brand Story', 'The Journey of Excellence', '[{"heading": "Where It All Began", "content": "Our journey started with a simple vision - to create exceptional spaces that inspire and delight."}]'::jsonb)
ON CONFLICT (page_key) DO NOTHING;

-- Update trigger for page_content
CREATE TRIGGER update_page_content_updated_at
BEFORE UPDATE ON public.page_content
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();