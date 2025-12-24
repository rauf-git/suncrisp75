-- Add images array column to rental_locations for carousel
ALTER TABLE public.rental_locations 
ADD COLUMN images text[] DEFAULT '{}';

-- Copy existing image_url to images array if it exists
UPDATE public.rental_locations 
SET images = ARRAY[image_url] 
WHERE image_url IS NOT NULL AND image_url != '';