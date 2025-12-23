import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { projectService, Project, CreateProjectInput, UpdateProjectInput } from "@/services/projectService";
import { Upload, X, Image as ImageIcon } from "lucide-react";

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
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ title?: string; image?: string }>({});
  
  const fileInputRef = useRef<HTMLInputElement>(null);
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

      if (isEditMode && project) {
        const updates: UpdateProjectInput = {
          title: title.trim(),
          description: description.trim() || undefined,
          location: location.trim() || undefined,
          category: category.trim() || undefined,
          display_order: displayOrder,
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
      setImageFile(null);
      setErrors({});
    } else if (open && !project) {
      resetForm();
    }
  }, [open, project]);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">
            {isEditMode ? "Edit Project" : "Add New Project"}
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

          {/* Category */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g., commercial, residential"
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., Dubai, Abu Dhabi"
                disabled={isLoading}
              />
            </div>
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
            />
            <p className="text-xs text-muted-foreground">Lower numbers appear first</p>
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <Label>Image {!isEditMode && "*"}</Label>
            
            {imagePreview ? (
              <div className="relative group">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-lg border border-border"
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
                onClick={() => fileInputRef.current?.click()}
                className={`w-full h-48 border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors hover:border-primary hover:bg-primary/5 ${
                  errors.image ? "border-destructive" : "border-border"
                }`}
              >
                <ImageIcon className="w-10 h-10 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Click to upload image</p>
                <p className="text-xs text-muted-foreground">JPG, PNG, WEBP (max 5MB)</p>
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
              >
                <Upload className="w-4 h-4 mr-2" />
                Replace Image
              </Button>
            )}

            {errors.image && (
              <p className="text-sm text-destructive">{errors.image}</p>
            )}
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
