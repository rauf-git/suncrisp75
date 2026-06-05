import { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { projectService, Project, CreateProjectInput, UpdateProjectInput } from "@/services/projectService";
import { Upload, X, Image as ImageIcon, Plus, Trash2 } from "lucide-react";
import { InquiryFieldBuilder } from "./InquiryFieldBuilder";
import { InquiryField } from "@/services/inquiryService";

interface ProjectFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project?: Project | null;
  onSuccess: () => void;
}

export function ProjectFormModal({ open, onOpenChange, project, onSuccess }: ProjectFormModalProps) {
  const [title, setTitle] = useState(project?.title || "");
  const [description, setDescription] = useState(project?.description || "");
  const [location, setLocation] = useState(project?.location || "");
  const [category, setCategory] = useState(project?.category || "");
  const [displayOrder, setDisplayOrder] = useState(project?.display_order || 0);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(project?.image_url || null);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [newGalleryFiles, setNewGalleryFiles] = useState<File[]>([]);
  const [inquiryEnabled, setInquiryEnabled] = useState<boolean>(false);
  const [inquiryTitle, setInquiryTitle] = useState<string>("");
  const [inquiryFields, setInquiryFields] = useState<InquiryField[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ title?: string; image?: string }>({});
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const isEditMode = !!project;

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setLocation("");
    setCategory("");
    setDisplayOrder(0);
    setImageFile(null);
    setImagePreview(null);
    setGalleryImages([]);
    setNewGalleryFiles([]);
    setInquiryEnabled(false);
    setInquiryTitle("");
    setInquiryFields([]);
    setErrors({});
  };

  const handleClose = () => {
    if (!isLoading) {
      resetForm();
      onOpenChange(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = projectService.validateFile(file);
    if (!validation.valid) {
      setErrors({ ...errors, image: validation.error });
      return;
    }

    setImageFile(file);
    setErrors({ ...errors, image: undefined });

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(isEditMode ? project?.image_url || null : null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleAddGalleryImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => {
      const validation = projectService.validateFile(file);
      return validation.valid;
    });
    setNewGalleryFiles(prev => [...prev, ...validFiles]);
    if (galleryInputRef.current) {
      galleryInputRef.current.value = "";
    }
  };

  const handleRemoveExistingGalleryImage = (index: number) => {
    setGalleryImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleRemoveNewGalleryImage = (index: number) => {
    setNewGalleryFiles(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = (): boolean => {
    const newErrors: { title?: string; image?: string } = {};

    if (!title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!isEditMode && !imageFile && !imagePreview) {
      newErrors.image = "Image is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      let imageUrl = project?.image_url || "";

      // Upload new image if selected
      if (imageFile) {
        const { url, error: uploadError } = await projectService.uploadImage(imageFile);
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
        if (isEditMode && project?.image_url) {
          await projectService.deleteImage(project.image_url);
        }
      }

      // Upload new gallery images
      const uploadedGalleryUrls: string[] = [];
      for (const file of newGalleryFiles) {
        const { url, error } = await projectService.uploadImage(file);
        if (error || !url) {
          toast({
            title: "Upload failed",
            description: `Failed to upload ${file.name}`,
            variant: "destructive",
          });
          continue;
        }
        uploadedGalleryUrls.push(url);
      }

      const allGalleryImages = [...galleryImages, ...uploadedGalleryUrls];

      if (isEditMode && project) {
        const updates: UpdateProjectInput = {
          title: title.trim(),
          description: description.trim() || undefined,
          location: location.trim() || undefined,
          category: category.trim() || undefined,
          display_order: displayOrder,
          images: allGalleryImages,
          inquiry_form_enabled: inquiryEnabled,
          inquiry_form_title: inquiryTitle.trim() || null,
          inquiry_form_fields: inquiryFields,
        };
        
        if (imageFile) {
          updates.image_url = imageUrl;
        }

        const { error } = await projectService.update(project.id, updates);
        if (error) throw error;

        toast({
          title: "Project updated",
          description: "The project has been updated successfully.",
        });
      } else {
        const newProject: CreateProjectInput = {
          title: title.trim(),
          description: description.trim() || undefined,
          location: location.trim() || undefined,
          category: category.trim() || undefined,
          display_order: displayOrder,
          image_url: imageUrl,
          images: allGalleryImages,
          inquiry_form_enabled: inquiryEnabled,
          inquiry_form_title: inquiryTitle.trim() || undefined,
          inquiry_form_fields: inquiryFields,
        };

        const { error } = await projectService.create(newProject);
        if (error) throw error;

        toast({
          title: "Project created",
          description: "The project has been created successfully.",
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

  // Update form when project changes or modal opens
  useEffect(() => {
    if (open && project) {
      setTitle(project.title);
      setDescription(project.description || "");
      setLocation(project.location || "");
      setCategory(project.category || "");
      setDisplayOrder(project.display_order || 0);
      setImagePreview(project.image_url);
      setGalleryImages(project.images || []);
      setImageFile(null);
      setNewGalleryFiles([]);
      setErrors({});
    } else if (open && !project) {
      resetForm();
    }
  }, [open, project]);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-[90vw] md:max-w-2xl lg:max-w-3xl h-[90vh] max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-4 sm:px-6 py-3 sm:py-4 border-b border-border shrink-0">
          <DialogTitle className="font-serif text-lg sm:text-xl">
            {isEditMode ? "Edit Project" : "Add New Project"}
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm text-muted-foreground">
            {isEditMode ? "Update project details." : "Create a new project."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <ScrollArea className="flex-1 min-h-0 pr-4">
            <div className="px-4 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-5 md:space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title" className="text-xs sm:text-sm font-medium">Title *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter project title"
                  className={`text-sm sm:text-base h-10 sm:h-11 ${errors.title ? "border-destructive" : ""}`}
                  disabled={isLoading}
                />
                {errors.title && <p className="text-xs sm:text-sm text-destructive">{errors.title}</p>}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-xs sm:text-sm font-medium">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter project description"
                  rows={3}
                  disabled={isLoading}
                  className="text-sm sm:text-base min-h-[80px] sm:min-h-[100px]"
                />
              </div>

              {/* Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-2">
                  <Label htmlFor="category" className="text-xs sm:text-sm font-medium">Category</Label>
                  <Input
                    id="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="e.g., commercial, residential"
                    disabled={isLoading}
                    className="text-sm sm:text-base h-10 sm:h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location" className="text-xs sm:text-sm font-medium">Location</Label>
                  <Input
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g., Dubai, Abu Dhabi"
                    disabled={isLoading}
                    className="text-sm sm:text-base h-10 sm:h-11"
                  />
                </div>
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
                <p className="text-[10px] sm:text-xs text-muted-foreground">Lower numbers appear first</p>
              </div>

              {/* Main Image Upload */}
              <div className="space-y-2">
                <Label className="text-xs sm:text-sm font-medium">Main Image {!isEditMode && "*"}</Label>

                {imagePreview ? (
                  <div className="relative group">
                    <img
                      src={imagePreview}
                      alt="Project image preview"
                      className="w-full h-36 sm:h-48 object-cover rounded-lg border border-border"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute top-2 right-2 p-1.5 bg-background/90 rounded-full opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity hover:bg-destructive hover:text-destructive-foreground min-w-[36px] min-h-[36px] sm:min-w-0 sm:min-h-0 flex items-center justify-center"
                      disabled={isLoading}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className={`w-full h-36 sm:h-48 border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors hover:border-primary hover:bg-primary/5 ${
                      errors.image ? "border-destructive" : "border-border"
                    }`}
                  >
                    <ImageIcon className="w-8 h-8 sm:w-10 sm:h-10 text-muted-foreground" />
                    <p className="text-xs sm:text-sm text-muted-foreground">Click to upload image</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">JPG, PNG, WEBP (max 5MB)</p>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept={projectService.getAcceptedFileTypes()}
                  onChange={handleFileSelect}
                  className="hidden"
                  disabled={isLoading}
                />

                {imagePreview && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isLoading}
                    className="h-9 sm:h-10 text-sm"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Replace Image
                  </Button>
                )}

                {errors.image && <p className="text-xs sm:text-sm text-destructive">{errors.image}</p>}
              </div>

              {/* Gallery Images */}
              <div className="space-y-2">
                <Label className="text-xs sm:text-sm font-medium">Gallery Images</Label>
                <p className="text-[10px] sm:text-xs text-muted-foreground mb-2">Add additional images for the project gallery</p>
                
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-3">
                  {/* Existing gallery images */}
                  {galleryImages.map((img, index) => (
                    <div key={`existing-${index}`} className="relative group aspect-square">
                      <img
                        src={img}
                        alt={`Gallery image ${index + 1}`}
                        className="w-full h-full object-cover rounded-lg border border-border"
                        loading="lazy"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveExistingGalleryImage(index)}
                        className="absolute top-1 right-1 p-1.5 sm:p-1 bg-destructive text-destructive-foreground rounded-full opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity min-w-[28px] min-h-[28px] sm:min-w-0 sm:min-h-0 flex items-center justify-center"
                        disabled={isLoading}
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}

                  {/* New gallery images (not yet uploaded) */}
                  {newGalleryFiles.map((file, index) => (
                    <div key={`new-${index}`} className="relative group aspect-square">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`New gallery image ${index + 1}`}
                        className="w-full h-full object-cover rounded-lg border-2 border-primary border-dashed"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveNewGalleryImage(index)}
                        className="absolute top-1 right-1 p-1.5 sm:p-1 bg-destructive text-destructive-foreground rounded-full opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity min-w-[28px] min-h-[28px] sm:min-w-0 sm:min-h-0 flex items-center justify-center"
                        disabled={isLoading}
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}

                  {/* Add more button */}
                  <button
                    type="button"
                    onClick={() => galleryInputRef.current?.click()}
                    className="aspect-square border-2 border-dashed border-border rounded-lg flex items-center justify-center hover:border-primary hover:bg-primary/5 transition-colors"
                    disabled={isLoading}
                  >
                    <Plus className="w-5 h-5 sm:w-6 sm:h-6 text-muted-foreground" />
                  </button>
                </div>

                <input
                  ref={galleryInputRef}
                  type="file"
                  accept={projectService.getAcceptedFileTypes()}
                  onChange={handleAddGalleryImages}
                  className="hidden"
                  multiple
                  disabled={isLoading}
                />
              </div>
            </div>
          </ScrollArea>

          <DialogFooter className="flex-col-reverse sm:flex-row gap-3 sm:gap-4 px-4 py-4 sm:px-6 border-t border-border shrink-0 bg-background">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading} className="w-full sm:w-auto h-9 sm:h-10 text-sm sm:text-base">
              Cancel
            </Button>
            <Button type="submit" className="w-full sm:w-auto h-9 sm:h-10 text-sm sm:text-base bg-primary hover:bg-primary/90" disabled={isLoading}>
              {isLoading ? (
                <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
              ) : isEditMode ? (
                "Update Project"
              ) : (
                "Create Project"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}