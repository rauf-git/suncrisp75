import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { rentalService, RentalLocation, LocationContentSection } from "@/services/rentalService";
import { X, Plus } from "lucide-react";
import { ContentSectionsEditor } from "./ContentSectionsEditor";

interface LocationFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  location?: RentalLocation | null;
  onSuccess: () => void;
}

export function LocationFormModal({ open, onOpenChange, location, onSuccess }: LocationFormModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [displayOrder, setDisplayOrder] = useState(0);
  const [images, setImages] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState<{ file: File; preview: string }[]>([]);
  const [contentSections, setContentSections] = useState<LocationContentSection[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ name?: string }>({});
  
  const imageInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const isEditMode = !!location;

  const resetForm = () => {
    setName("");
    setDescription("");
    setDisplayOrder(0);
    setImages([]);
    setUploadingImages([]);
    setContentSections([]);
    setErrors({});
  };

  const handleClose = () => {
    if (!isLoading) {
      // Revoke object URLs to prevent memory leaks
      uploadingImages.forEach(img => URL.revokeObjectURL(img.preview));
      resetForm();
      onOpenChange(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const validFiles: { file: File; preview: string }[] = [];

    for (const file of files) {
      if (!file.type.startsWith("image/")) {
        toast({ title: "Invalid file", description: `${file.name} is not an image file`, variant: "destructive" });
        continue;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast({ title: "File too large", description: `${file.name} must be less than 5MB`, variant: "destructive" });
        continue;
      }

      validFiles.push({
        file,
        preview: URL.createObjectURL(file)
      });
    }

    setUploadingImages(prev => [...prev, ...validFiles]);
    
    // Reset input
    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }
  };

  const handleRemoveExistingImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleRemoveNewImage = (index: number) => {
    setUploadingImages(prev => {
      const removed = prev[index];
      URL.revokeObjectURL(removed.preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const validateForm = (): boolean => {
    const newErrors: { name?: string } = {};

    if (!name.trim()) {
      newErrors.name = "Name is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // Upload new images
      const uploadedUrls: string[] = [];
      for (const img of uploadingImages) {
        const { url, error: uploadError } = await rentalService.uploadImage(img.file);
        if (uploadError || !url) {
          toast({
            title: "Upload failed",
            description: uploadError?.message || `Failed to upload ${img.file.name}`,
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }
        uploadedUrls.push(url);
      }

      // Combine existing images with newly uploaded ones
      const allImages = [...images, ...uploadedUrls];
      
      // Use first image as the main image_url for backwards compatibility
      const mainImageUrl = allImages.length > 0 ? allImages[0] : null;

      // Find images to delete (images that were in original but not in current)
      if (isEditMode && location) {
        const originalImages = location.images || (location.image_url ? [location.image_url] : []);
        const imagesToDelete = originalImages.filter(img => !images.includes(img));
        for (const imgUrl of imagesToDelete) {
          await rentalService.deleteImage(imgUrl);
        }
      }

      if (isEditMode && location) {
        const { error } = await rentalService.updateLocation(location.id, {
          name: name.trim(),
          description: description.trim() || undefined,
          image_url: mainImageUrl || undefined,
          images: allImages,
          display_order: displayOrder,
          content_sections: contentSections,
        });
        if (error) throw error;

        toast({
          title: "Location updated",
          description: "Rental location has been updated successfully.",
        });
      } else {
        const { error } = await rentalService.createLocation({
          name: name.trim(),
          description: description.trim() || undefined,
          image_url: mainImageUrl || undefined,
          images: allImages,
          display_order: displayOrder,
          content_sections: contentSections,
        });
        if (error) throw error;

        toast({
          title: "Location created",
          description: "Rental location has been created successfully.",
        });
      }

      handleClose();
      onSuccess();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "An error occurred";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (open && location) {
      setName(location.name);
      setDescription(location.description || "");
      setDisplayOrder(location.display_order);
      // Use images array, fall back to image_url if images is empty
      const existingImages = location.images?.length 
        ? location.images 
        : (location.image_url ? [location.image_url] : []);
      setImages(existingImages);
      setUploadingImages([]);
      setContentSections(location.content_sections || []);
      setErrors({});
    } else if (open && !location) {
      resetForm();
    }
  }, [open, location]);

  const allPreviewImages = [
    ...images.map((url, i) => ({ type: 'existing' as const, url, index: i })),
    ...uploadingImages.map((img, i) => ({ type: 'new' as const, url: img.preview, index: i }))
  ];

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-[90vw] md:max-w-2xl lg:max-w-3xl h-[90vh] max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-4 sm:px-6 py-3 sm:py-4 border-b border-border shrink-0">
          <DialogTitle className="font-serif text-lg sm:text-xl">
            {isEditMode ? "Edit Location" : "Add Location"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <ScrollArea className="flex-1 min-h-0 pr-4">
            <div className="px-4 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-5 md:space-y-6">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-xs sm:text-sm font-medium">Name *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter location name (e.g., Visakhapatnam)"
                  className={`text-sm sm:text-base h-10 sm:h-11 ${errors.name ? "border-destructive" : ""}`}
                  disabled={isLoading}
                />
                {errors.name && (
                  <p className="text-xs sm:text-sm text-destructive">{errors.name}</p>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-xs sm:text-sm font-medium">Short Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description of this location"
                  rows={2}
                  disabled={isLoading}
                  className="text-sm sm:text-base min-h-[80px] sm:min-h-[100px]"
                />
              </div>

              {/* Display Order */}
              <div className="space-y-2">
                <Label htmlFor="displayOrder" className="text-xs sm:text-sm font-medium">Display Order</Label>
                <Input
                  id="displayOrder"
                  type="number"
                  value={displayOrder}
                  onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 0)}
                  placeholder="0"
                  disabled={isLoading}
                  className="w-24 sm:w-32 text-sm sm:text-base h-10 sm:h-11"
                />
              </div>

              {/* Images */}
              <div className="space-y-2">
                <Label className="text-xs sm:text-sm font-medium">Location Images (for carousel)</Label>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Upload multiple images to display in a carousel on the rentals page
                </p>

                {/* Image Grid */}
                {allPreviewImages.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 mt-3">
                    {allPreviewImages.map((img, i) => (
                      <div key={`${img.type}-${img.index}`} className="relative group aspect-[4/3] sm:aspect-[3/2]">
                        <img
                          src={img.url}
                          alt={`Location image ${i + 1}`}
                          className="w-full h-full object-cover rounded-lg border border-border"
                          loading="lazy"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (img.type === 'existing') {
                              handleRemoveExistingImage(img.index);
                            } else {
                              handleRemoveNewImage(img.index);
                            }
                          }}
                          className="absolute top-1 right-1 p-1.5 sm:p-1 bg-background/90 rounded-full opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity hover:bg-destructive hover:text-destructive-foreground min-w-[32px] min-h-[32px] sm:min-w-0 sm:min-h-0 flex items-center justify-center"
                          disabled={isLoading}
                        >
                          <X className="w-3 h-3 sm:w-3 sm:h-3" />
                        </button>
                        {i === 0 && (
                          <span className="absolute bottom-1 left-1 text-[10px] sm:text-xs bg-primary text-primary-foreground px-1.5 py-0.5 rounded">
                            Main
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Add Image Button */}
                <div
                  onClick={() => imageInputRef.current?.click()}
                  className="w-full h-20 sm:h-24 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors hover:border-primary hover:bg-primary/5 mt-3"
                >
                  <Plus className="w-5 h-5 sm:w-6 sm:h-6 text-muted-foreground" />
                  <p className="text-xs sm:text-sm text-muted-foreground">Click to add images</p>
                </div>

                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageSelect}
                  className="hidden"
                  disabled={isLoading}
                />
              </div>

              {/* Rich Text Content Sections */}
              <div className="space-y-2">
                <ContentSectionsEditor
                  sections={contentSections.map(s => ({
                    heading: s.heading || '',
                    content: s.content || '',
                    image: s.image
                  }))}
                  onChange={(sections) => setContentSections(sections.map(s => ({
                    heading: s.heading,
                    content: s.content,
                    image: s.image
                  })))}
                  title="Location Content Sections"
                  pageKey="rental-locations"
                />
              </div>
            </div>
          </ScrollArea>

          <DialogFooter className="flex-col-reverse sm:flex-row gap-3 sm:gap-4 px-4 py-4 sm:px-6 border-t border-border shrink-0">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading} className="w-full sm:w-auto h-9 sm:h-10 text-sm sm:text-base">
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="w-full sm:w-auto h-9 sm:h-10 text-sm sm:text-base">
              {isLoading ? (
                <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : isEditMode ? "Update Location" : "Add Location"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}