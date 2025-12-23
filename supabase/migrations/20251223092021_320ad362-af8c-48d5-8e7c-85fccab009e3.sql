-- Create hospitality_projects table for proper data separation
CREATE TABLE public.hospitality_projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  short_description TEXT,
  long_description TEXT,
  location TEXT,
  thumbnail_url TEXT,
  images TEXT[] DEFAULT '{}',
  price_info TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.hospitality_projects ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Anyone can view hospitality projects"
  ON public.hospitality_projects
  FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert hospitality projects"
  ON public.hospitality_projects
  FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update hospitality projects"
  ON public.hospitality_projects
  FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete hospitality projects"
  ON public.hospitality_projects
  FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_hospitality_projects_updated_at
  BEFORE UPDATE ON public.hospitality_projects
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();