import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { constructionService, ConstructionProject, CreateConstructionInput, UpdateConstructionInput } from "@/services/constructionService";
import { Upload, X, Image as ImageIcon, Plus, Trash2 } from "lucide-react";

interface ConstructionFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  construction?: ConstructionProject | null;
  onSuccess: () => void;
}

const STATUS_OPTIONS = [
  "Under Construction",
  "Planning",
  "Completed",
  "On Hold",
];

export function ConstructionFormModal({ open, onOpenChange, construction, onSuccess }: ConstructionFormModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("Under Construction");
  const [address, setAddress] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [displayOrder, setDisplayOrder] = useState(0);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ title?: string; thumbnail?: string }>({});
  
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const imagesInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const isEditMode = !!construction;

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setStatus("Under Construction");
    setAddress("");
    setLatitude("");
    setLongitude("");
    setDisplayOrder(0);
    setThumbnailFile(null);
    setThumbnailPreview(null);
    setImages([]);
    setNewImageFiles([]);
    setErrors({});
  };

  const handleClose = () => {
    if (!isLoading) {
      resetForm();
      onOpenChange(false);
    }
  };

  const handleThumbnailSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrors({ ...errors, thumbnail: "Please select an image file" });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrors({ ...errors, thumbnail: "Image must be less than 5MB" });
      return;
    }

    setThumbnailFile(file);
    setErrors({ ...errors, thumbnail: undefined });

    const reader = new FileReader();
    reader.onload = (e) => {
      setThumbnailPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveThumbnail = () => {
    setThumbnailFile(null);
    setThumbnailPreview(isEditMode ? construction?.thumbnail_url || null : null);
    if (thumbnailInputRef.current) {
      thumbnailInputRef.current.value = "";
    }
  };

  const handleAddImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => 
      file.type.startsWith("image/") && file.size <= 5 * 1024 * 1024
    );
    setNewImageFiles(prev => [...prev, ...validFiles]);
    if (imagesInputRef.current) {
      imagesInputRef.current.value = "";
    }
  };

  const handleRemoveExistingImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleRemoveNewImage = (index: number) => {
    setNewImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = (): boolean => {
    const newErrors: { title?: string; thumbnail?: string } = {};

    if (!title.trim()) {
      newErrors.title = "Title is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      let thumbnailUrl = construction?.thumbnail_url || null;

      // Upload new thumbnail if selected
      if (thumbnailFile) {
        const { url, error: uploadError } = await constructionService.uploadImage(thumbnailFile);
        if (uploadError || !url) {
          toast({
            title: "Upload failed",
            description: uploadError?.message || "Failed to upload thumbnail",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }
        thumbnailUrl = url;

        // Delete old thumbnail if updating
        if (isEditMode && construction?.thumbnail_url) {
          await constructionService.deleteImage(construction.thumbnail_url);
        }
      }

      // Upload new gallery images
      const uploadedImageUrls: string[] = [];
      for (const file of newImageFiles) {
        const { url, error } = await constructionService.uploadImage(file);
        if (error || !url) {
          toast({
            title: "Upload failed",
            description: `Failed to upload ${file.name}`,
            variant: "destructive",
          });
          continue;
        }
        uploadedImageUrls.push(url);
      }

      const allImages = [...images, ...uploadedImageUrls];

      if (isEditMode && construction) {
        const updates: UpdateConstructionInput = {
          title: title.trim(),
          description: description.trim() || undefined,
          status,
          address: address.trim() || undefined,
          latitude: latitude ? parseFloat(latitude) : undefined,
          longitude: longitude ? parseFloat(longitude) : undefined,
          display_order: displayOrder,
          images: allImages,
        };
        
        if (thumbnailFile) {
          updates.thumbnail_url = thumbnailUrl || undefined;
        }

        const { error } = await constructionService.update(construction.id, updates);
        if (error) throw error;

        toast({
          title: "Project updated",
          description: "Construction project has been updated successfully.",
        });
      } else {
        const newProject: CreateConstructionInput = {
          title: title.trim(),
          description: description.trim() || undefined,
          status,
          address: address.trim() || undefined,
          latitude: latitude ? parseFloat(latitude) : undefined,
          longitude: longitude ? parseFloat(longitude) : undefined,
          display_order: displayOrder,
          thumbnail_url: thumbnailUrl || undefined,
          images: allImages,
        };

        const { error } = await constructionService.create(newProject);
        if (error) throw error;

        toast({
          title: "Project created",
          description: "Construction project has been created successfully.",
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
    if (open && construction) {
      setTitle(construction.title);
      setDescription(construction.description || "");
      setStatus(construction.status);
      setAddress(construction.address || "");
      setLatitude(construction.latitude?.toString() || "");
      setLongitude(construction.longitude?.toString() || "");
      setDisplayOrder(construction.display_order);
      setThumbnailPreview(construction.thumbnail_url);
      setImages(construction.images || []);
      setThumbnailFile(null);
      setNewImageFiles([]);
      setErrors({});
    } else if (open && !construction) {
      resetForm();
    }
  }, [open, construction]);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">
            {isEditMode ? "Edit Construction Project" : "Add Construction Project"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter project title"
              className={errors.title ? "border-destructive" : ""}
              disabled={isLoading}
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title}</p>
            )}
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={status} onValueChange={setStatus} disabled={isLoading}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((opt) => (
                  <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter project description"
              rows={3}
              disabled={isLoading}
            />
          </div>

          {/* Address */}
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter project address"
              disabled={isLoading}
            />
          </div>

          {/* Coordinates */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="latitude">Latitude</Label>
              <Input
                id="latitude"
                type="number"
                step="any"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                placeholder="e.g., 17.7275"
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="longitude">Longitude</Label>
              <Input
                id="longitude"
                type="number"
                step="any"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                placeholder="e.g., 83.2956"
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="displayOrder">Display Order</Label>
              <Input
                id="displayOrder"
                type="number"
                value={displayOrder}
                onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 0)}
                placeholder="0"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Thumbnail */}
          <div className="space-y-2">
            <Label>Thumbnail Image</Label>
            
            {thumbnailPreview ? (
              <div className="relative group">
                <img
                  src={thumbnailPreview}
                  alt="Preview"
                  className="w-full h-40 object-cover rounded-lg border border-border"
                />
                <button
                  type="button"
                  onClick={handleRemoveThumbnail}
                  className="absolute top-2 right-2 p-1.5 bg-background/90 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive hover:text-destructive-foreground"
                  disabled={isLoading}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div
                onClick={() => thumbnailInputRef.current?.click()}
                className={`w-full h-40 border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors hover:border-primary hover:bg-primary/5 ${
                  errors.thumbnail ? "border-destructive" : "border-border"
                }`}
              >
                <ImageIcon className="w-8 h-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Click to upload thumbnail</p>
              </div>
            )}

            <input
              ref={thumbnailInputRef}
              type="file"
              accept="image/*"
              onChange={handleThumbnailSelect}
              className="hidden"
              disabled={isLoading}
            />

            {thumbnailPreview && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => thumbnailInputRef.current?.click()}
                disabled={isLoading}
              >
                <Upload className="w-4 h-4 mr-2" />
                Replace Thumbnail
              </Button>
            )}

            {errors.thumbnail && (
              <p className="text-sm text-destructive">{errors.thumbnail}</p>
            )}
          </div>

          {/* Gallery Images */}
          <div className="space-y-2">
            <Label>Gallery Images</Label>
            <div className="grid grid-cols-4 gap-2">
              {/* Existing images */}
              {images.map((img, index) => (
                <div key={`existing-${index}`} className="relative group aspect-square">
                  <img
                    src={img}
                    alt={`Gallery ${index + 1}`}
                    className="w-full h-full object-cover rounded-lg border border-border"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveExistingImage(index)}
                    className="absolute top-1 right-1 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    disabled={isLoading}
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {/* New images preview */}
              {newImageFiles.map((file, index) => (
                <div key={`new-${index}`} className="relative group aspect-square">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`New ${index + 1}`}
                    className="w-full h-full object-cover rounded-lg border-2 border-primary border-dashed"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveNewImage(index)}
                    className="absolute top-1 right-1 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    disabled={isLoading}
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {/* Add button */}
              <button
                type="button"
                onClick={() => imagesInputRef.current?.click()}
                className="aspect-square border-2 border-dashed border-border rounded-lg flex items-center justify-center hover:border-primary hover:bg-primary/5 transition-colors"
                disabled={isLoading}
              >
                <Plus className="w-6 h-6 text-muted-foreground" />
              </button>
            </div>
            <input
              ref={imagesInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleAddImages}
              className="hidden"
              disabled={isLoading}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-primary hover:bg-primary/90"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
              ) : isEditMode ? (
                "Update Project"
              ) : (
                "Create Project"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
