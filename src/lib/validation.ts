import { z } from "zod";

// Common validation patterns
const MAX_TITLE_LENGTH = 200;
const MAX_SHORT_DESCRIPTION_LENGTH = 500;
const MAX_LONG_DESCRIPTION_LENGTH = 10000;
const MAX_ADDRESS_LENGTH = 500;
const MAX_CATEGORY_LENGTH = 100;
const MAX_URL_LENGTH = 2000;
const MAX_TEXT_FIELD_LENGTH = 1000;

// Utility to sanitize text input (trim and limit length)
export const sanitizeText = (text: string | undefined | null, maxLength: number): string | undefined => {
  if (!text) return undefined;
  return text.trim().slice(0, maxLength);
};

// Project validation schemas
export const createProjectSchema = z.object({
  title: z.string()
    .trim()
    .min(1, "Title is required")
    .max(MAX_TITLE_LENGTH, `Title must be less than ${MAX_TITLE_LENGTH} characters`),
  description: z.string()
    .trim()
    .max(MAX_LONG_DESCRIPTION_LENGTH, `Description must be less than ${MAX_LONG_DESCRIPTION_LENGTH} characters`)
    .optional(),
  short_description: z.string()
    .trim()
    .max(MAX_SHORT_DESCRIPTION_LENGTH, `Short description must be less than ${MAX_SHORT_DESCRIPTION_LENGTH} characters`)
    .optional(),
  long_description: z.string()
    .trim()
    .max(MAX_LONG_DESCRIPTION_LENGTH, `Long description must be less than ${MAX_LONG_DESCRIPTION_LENGTH} characters`)
    .optional(),
  location: z.string()
    .trim()
    .max(MAX_ADDRESS_LENGTH, `Location must be less than ${MAX_ADDRESS_LENGTH} characters`)
    .optional(),
  category: z.string()
    .trim()
    .max(MAX_CATEGORY_LENGTH, `Category must be less than ${MAX_CATEGORY_LENGTH} characters`)
    .optional(),
  image_url: z.string()
    .trim()
    .url("Invalid image URL")
    .max(MAX_URL_LENGTH, `Image URL must be less than ${MAX_URL_LENGTH} characters`),
  images: z.array(z.string().url().max(MAX_URL_LENGTH)).optional(),
  display_order: z.number().int().min(0).max(9999).optional(),
});

export const updateProjectSchema = z.object({
  title: z.string()
    .trim()
    .min(1, "Title is required")
    .max(MAX_TITLE_LENGTH, `Title must be less than ${MAX_TITLE_LENGTH} characters`)
    .optional(),
  description: z.string()
    .trim()
    .max(MAX_LONG_DESCRIPTION_LENGTH, `Description must be less than ${MAX_LONG_DESCRIPTION_LENGTH} characters`)
    .nullish(),
  short_description: z.string()
    .trim()
    .max(MAX_SHORT_DESCRIPTION_LENGTH, `Short description must be less than ${MAX_SHORT_DESCRIPTION_LENGTH} characters`)
    .nullish(),
  long_description: z.string()
    .trim()
    .max(MAX_LONG_DESCRIPTION_LENGTH, `Long description must be less than ${MAX_LONG_DESCRIPTION_LENGTH} characters`)
    .nullish(),
  location: z.string()
    .trim()
    .max(MAX_ADDRESS_LENGTH, `Location must be less than ${MAX_ADDRESS_LENGTH} characters`)
    .nullish(),
  category: z.string()
    .trim()
    .max(MAX_CATEGORY_LENGTH, `Category must be less than ${MAX_CATEGORY_LENGTH} characters`)
    .nullish(),
  image_url: z.string()
    .trim()
    .url("Invalid image URL")
    .max(MAX_URL_LENGTH, `Image URL must be less than ${MAX_URL_LENGTH} characters`)
    .optional(),
  images: z.array(z.string().url().max(MAX_URL_LENGTH)).nullish(),
  display_order: z.number().int().min(0).max(9999).nullish(),
  is_featured: z.boolean().nullish(),
  visit_url: z.string().trim().url().max(MAX_URL_LENGTH).nullish(),
  heading: z.string().trim().max(MAX_TITLE_LENGTH).nullish(),
  content_heading: z.string().trim().max(MAX_TITLE_LENGTH).nullish(),
});

// Construction project validation schemas
export const createConstructionSchema = z.object({
  title: z.string()
    .trim()
    .min(1, "Title is required")
    .max(MAX_TITLE_LENGTH, `Title must be less than ${MAX_TITLE_LENGTH} characters`),
  description: z.string()
    .trim()
    .max(MAX_LONG_DESCRIPTION_LENGTH, `Description must be less than ${MAX_LONG_DESCRIPTION_LENGTH} characters`)
    .optional(),
  status: z.string()
    .trim()
    .max(MAX_CATEGORY_LENGTH, `Status must be less than ${MAX_CATEGORY_LENGTH} characters`)
    .optional(),
  address: z.string()
    .trim()
    .max(MAX_ADDRESS_LENGTH, `Address must be less than ${MAX_ADDRESS_LENGTH} characters`)
    .optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  thumbnail_url: z.string()
    .trim()
    .url("Invalid thumbnail URL")
    .max(MAX_URL_LENGTH, `Thumbnail URL must be less than ${MAX_URL_LENGTH} characters`)
    .optional(),
  images: z.array(z.string().url().max(MAX_URL_LENGTH)).optional(),
  display_order: z.number().int().min(0).max(9999).optional(),
});

export const updateConstructionSchema = z.object({
  title: z.string()
    .trim()
    .min(1, "Title is required")
    .max(MAX_TITLE_LENGTH, `Title must be less than ${MAX_TITLE_LENGTH} characters`)
    .optional(),
  description: z.string()
    .trim()
    .max(MAX_LONG_DESCRIPTION_LENGTH, `Description must be less than ${MAX_LONG_DESCRIPTION_LENGTH} characters`)
    .nullish(),
  status: z.string()
    .trim()
    .max(MAX_CATEGORY_LENGTH, `Status must be less than ${MAX_CATEGORY_LENGTH} characters`)
    .nullish(),
  address: z.string()
    .trim()
    .max(MAX_ADDRESS_LENGTH, `Address must be less than ${MAX_ADDRESS_LENGTH} characters`)
    .nullish(),
  latitude: z.number().min(-90).max(90).nullish(),
  longitude: z.number().min(-180).max(180).nullish(),
  thumbnail_url: z.string()
    .trim()
    .url("Invalid thumbnail URL")
    .max(MAX_URL_LENGTH, `Thumbnail URL must be less than ${MAX_URL_LENGTH} characters`)
    .nullish(),
  images: z.array(z.string().url().max(MAX_URL_LENGTH)).nullish(),
  display_order: z.number().int().min(0).max(9999).nullish(),
  visit_url: z.string().trim().url().max(MAX_URL_LENGTH).nullish(),
  heading: z.string().trim().max(MAX_TITLE_LENGTH).nullish(),
  content_heading: z.string().trim().max(MAX_TITLE_LENGTH).nullish(),
});

// Rental validation schemas
export const createRentalSchema = z.object({
  title: z.string()
    .trim()
    .min(1, "Title is required")
    .max(MAX_TITLE_LENGTH, `Title must be less than ${MAX_TITLE_LENGTH} characters`),
  short_description: z.string()
    .trim()
    .max(MAX_SHORT_DESCRIPTION_LENGTH, `Short description must be less than ${MAX_SHORT_DESCRIPTION_LENGTH} characters`)
    .optional(),
  long_description: z.string()
    .trim()
    .max(MAX_LONG_DESCRIPTION_LENGTH, `Long description must be less than ${MAX_LONG_DESCRIPTION_LENGTH} characters`)
    .optional(),
  location_id: z.string().uuid("Invalid location ID").optional().nullable(),
  address: z.string()
    .trim()
    .max(MAX_ADDRESS_LENGTH, `Address must be less than ${MAX_ADDRESS_LENGTH} characters`)
    .optional(),
  price: z.string()
    .trim()
    .max(MAX_TEXT_FIELD_LENGTH, `Price must be less than ${MAX_TEXT_FIELD_LENGTH} characters`)
    .optional(),
  bedrooms: z.number().int().min(0).max(100).optional(),
  bathrooms: z.number().int().min(0).max(100).optional(),
  area: z.string()
    .trim()
    .max(MAX_TEXT_FIELD_LENGTH, `Area must be less than ${MAX_TEXT_FIELD_LENGTH} characters`)
    .optional(),
  amenities: z.array(z.string().trim().max(MAX_TEXT_FIELD_LENGTH)).optional(),
  thumbnail_url: z.string()
    .trim()
    .url("Invalid thumbnail URL")
    .max(MAX_URL_LENGTH, `Thumbnail URL must be less than ${MAX_URL_LENGTH} characters`)
    .optional(),
  images: z.array(z.string().url().max(MAX_URL_LENGTH)).optional(),
  is_featured: z.boolean().optional(),
  display_order: z.number().int().min(0).max(9999).optional(),
  visit_url: z.string().trim().url().max(MAX_URL_LENGTH).nullish(),
  heading: z.string().trim().max(MAX_TITLE_LENGTH).nullish(),
  content_heading: z.string().trim().max(MAX_TITLE_LENGTH).nullish(),
});

export const updateRentalSchema = createRentalSchema.partial();

// Rental location validation schemas
export const createLocationSchema = z.object({
  name: z.string()
    .trim()
    .min(1, "Name is required")
    .max(MAX_TITLE_LENGTH, `Name must be less than ${MAX_TITLE_LENGTH} characters`),
  description: z.string()
    .trim()
    .max(MAX_LONG_DESCRIPTION_LENGTH, `Description must be less than ${MAX_LONG_DESCRIPTION_LENGTH} characters`)
    .optional(),
  image_url: z.string()
    .trim()
    .url("Invalid image URL")
    .max(MAX_URL_LENGTH, `Image URL must be less than ${MAX_URL_LENGTH} characters`)
    .optional(),
  display_order: z.number().int().min(0).max(9999).optional(),
});

export const updateLocationSchema = createLocationSchema.partial();

// Page block validation schemas
const pageBlockContentSchema = z.object({
  title: z.string().trim().max(MAX_TITLE_LENGTH).optional(),
  subtitle: z.string().trim().max(MAX_TITLE_LENGTH).optional(),
  description: z.string().trim().max(MAX_LONG_DESCRIPTION_LENGTH).optional(),
  text: z.string().trim().max(MAX_LONG_DESCRIPTION_LENGTH).optional(),
  image_url: z.string().trim().url().max(MAX_URL_LENGTH).optional(),
  background_image: z.string().trim().url().max(MAX_URL_LENGTH).optional(),
  images: z.array(z.string().url().max(MAX_URL_LENGTH)).optional(),
  email: z.string().trim().email().max(255).optional(),
  phone: z.string().trim().max(50).optional(),
  address: z.string().trim().max(MAX_ADDRESS_LENGTH).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
}).passthrough(); // Allow additional properties but validate known ones

export const createPageBlockSchema = z.object({
  page_key: z.string()
    .trim()
    .min(1, "Page key is required")
    .max(100, "Page key must be less than 100 characters"),
  block_type: z.string()
    .trim()
    .min(1, "Block type is required")
    .max(100, "Block type must be less than 100 characters"),
  block_key: z.string()
    .trim()
    .min(1, "Block key is required")
    .max(100, "Block key must be less than 100 characters"),
  content: pageBlockContentSchema,
  display_order: z.number().int().min(0).max(9999).optional(),
  is_active: z.boolean().optional(),
});

export const updatePageBlockSchema = z.object({
  content: pageBlockContentSchema.optional(),
  display_order: z.number().int().min(0).max(9999).optional(),
  is_active: z.boolean().optional(),
});

// UUID validation helper
export const uuidSchema = z.string().uuid("Invalid ID format");

// File validation
export const validateFile = (
  file: File,
  options: { 
    maxSizeBytes?: number; 
    allowedTypes?: string[];
  } = {}
): { valid: boolean; error?: string } => {
  const { 
    maxSizeBytes = 5 * 1024 * 1024, // 5MB default
    allowedTypes = ["image/jpeg", "image/png", "image/webp"]
  } = options;

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: `File type not allowed. Allowed types: ${allowedTypes.join(", ")}` };
  }

  if (file.size > maxSizeBytes) {
    const maxSizeMB = Math.round(maxSizeBytes / (1024 * 1024));
    return { valid: false, error: `File size must be less than ${maxSizeMB}MB` };
  }

  return { valid: true };
};

// Export types
export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type CreateConstructionInput = z.infer<typeof createConstructionSchema>;
export type UpdateConstructionInput = z.infer<typeof updateConstructionSchema>;
export type CreateRentalInput = z.infer<typeof createRentalSchema>;
export type UpdateRentalInput = z.infer<typeof updateRentalSchema>;
export type CreateLocationInput = z.infer<typeof createLocationSchema>;
export type UpdateLocationInput = z.infer<typeof updateLocationSchema>;
export type CreatePageBlockInput = z.infer<typeof createPageBlockSchema>;
export type UpdatePageBlockInput = z.infer<typeof updatePageBlockSchema>;
