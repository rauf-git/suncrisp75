import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { rentalService, RentalLocation, LocationContentSection } from "@/services/rentalService";
import { Upload, X, Image as ImageIcon } from "lucide-react";
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
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
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
    setImageFile(null);
    setImagePreview(null);
    setContentSections([]);
    setErrors({});
  };

  const handleClose = () => {
    if (!isLoading) {
      resetForm();
      onOpenChange(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({ title: "Invalid file", description: "Please select an image file", variant: "destructive" });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "File too large", description: "Image must be less than 5MB", variant: "destructive" });
      return;
    }

    setImageFile(file);

    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(isEditMode ? location?.image_url || null : null);
    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }
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
      let imageUrl = location?.image_url || null;

      // Upload new image if selected
      if (imageFile) {
        const { url, error: uploadError } = await rentalService.uploadImage(imageFile);
        if (uploadError || !url) {
          toast({
            title: "Upload failed",
            description: uploadError?.message || "Failed to upload image",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }
        imageUrl = url;

        // Delete old image if updating
        if (isEditMode && location?.image_url) {
          await rentalService.deleteImage(location.image_url);
        }
      }

      if (isEditMode && location) {
        const { error } = await rentalService.updateLocation(location.id, {
          name: name.trim(),
          description: description.trim() || undefined,
          image_url: imageUrl || undefined,
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
          image_url: imageUrl || undefined,
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
      setImagePreview(location.image_url);
      setContentSections(location.content_sections || []);
      setImageFile(null);
      setErrors({});
    } else if (open && !location) {
      resetForm();
    }
  }, [open, location]);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="w-[95vw] max-w-3xl max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b border-border shrink-0">
          <DialogTitle className="font-serif text-xl">
            {isEditMode ? "Edit Location" : "Add Location"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <ScrollArea className="flex-1 min-h-0">
            <div className="px-6 py-6 space-y-5">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter location name (e.g., Visakhapatnam)"
                  className={errors.name ? "border-destructive" : ""}
                  disabled={isLoading}
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name}</p>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Short Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description of this location"
                  rows={2}
                  disabled={isLoading}
                />
              </div>

              {/* Display Order */}
              <div className="space-y-2">
                <Label htmlFor="displayOrder">Display Order</Label>
                <Input
                  id="displayOrder"
                  type="number"
                  value={displayOrder}
                  onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 0)}
                  placeholder="0"
                  disabled={isLoading}
                  className="w-32"
                />
              </div>

              {/* Image */}
              <div className="space-y-2">
                <Label>Location Image (Optional)</Label>

                {imagePreview ? (
                  <div className="relative group">
                    <img
                      src={imagePreview}
                      alt="Location preview"
                      className="w-full h-40 object-cover rounded-lg border border-border"
                      loading="lazy"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute top-2 right-2 p-1.5 bg-background/90 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive hover:text-destructive-foreground"
                      disabled={isLoading}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => imageInputRef.current?.click()}
                    className="w-full h-40 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors hover:border-primary hover:bg-primary/5"
                  >
                    <ImageIcon className="w-8 h-8 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Click to upload image</p>
                  </div>
                )}

                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
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

          <DialogFooter className="px-6 py-4 border-t border-border shrink-0">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : isEditMode ? "Update Location" : "Add Location"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
