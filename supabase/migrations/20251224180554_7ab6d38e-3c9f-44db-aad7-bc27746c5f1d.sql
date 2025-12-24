-- Add location_ids column to store multiple locations
ALTER TABLE public.rentals ADD COLUMN location_ids uuid[] DEFAULT '{}';

-- Migrate existing location_id data to the new array column
UPDATE public.rentals 
SET location_ids = ARRAY[location_id]
WHERE location_id IS NOT NULL;