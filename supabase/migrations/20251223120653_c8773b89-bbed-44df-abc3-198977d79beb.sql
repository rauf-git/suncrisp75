-- Add is_featured column to projects table
ALTER TABLE public.projects 
ADD COLUMN is_featured boolean DEFAULT false;

-- Add index for faster queries on featured projects
CREATE INDEX idx_projects_is_featured ON public.projects(is_featured) WHERE is_featured = true;