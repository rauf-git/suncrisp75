import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { hospitalityService, HospitalityProject } from "@/services/hospitalityService";
import { Upload, X, Image as ImageIcon, Plus } from "lucide-react";
import { validateFile } from "@/lib/validation";

interface HospitalityFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project?: HospitalityProject | null;
  onSuccess: () => void;
}

export function HospitalityFormModal({ open, onOpenChange, project, onSuccess }: HospitalityFormModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [longDescription, setLongDescription] = useState("");
  const [location, setLocation] = useState("");
  const [priceInfo, setPriceInfo] = useState("");
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ title?: string; thumbnail?: string }>({});

  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const isEditMode = !!project;

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setShortDescription("");
    setLongDescription("");
    setLocation("");
    setPriceInfo("");
    setThumbnailFile(null);
    setThumbnailPreview(null);
    setGalleryFiles([]);
    setGalleryPreviews([]);
    setErrors({});
  };

  useEffect(() => {
    if (open && project) {
      setTitle(project.title);
      setDescription(project.description || "");
      setShortDescription(project.short_description || "");
      setLongDescription(project.long_description || "");
      setLocation(project.location || "");
      setPriceInfo(project.price_info || "");
      setThumbnailPreview(project.thumbnail_url);
      setGalleryPreviews(project.images || []);
      setThumbnailFile(null);
      setGalleryFiles([]);
      setErrors({});
    } else if (open && !project) {
      resetForm();
    }
  }, [open, project]);

  const handleClose = () => {
    if (!isLoading) {
      resetForm();
      onOpenChange(false);
    }
  };

  const handleThumbnailSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateFile(file);
    if (!validation.valid) {
      setErrors({ ...errors, thumbnail: validation.error });
      return;
    }

    setThumbnailFile(file);
    setErrors({ ...errors, thumbnail: undefined });

    const reader = new FileReader();
    reader.onload = (e) => setThumbnailPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleGallerySelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles: File[] = [];
    const previews: string[] = [];

    files.forEach((file) => {
      const validation = validateFile(file);
      if (validation.valid) {
        validFiles.push(file);
        const reader = new FileReader();
        reader.onload = (e) => {
          previews.push(e.target?.result as string);
          if (previews.length === validFiles.length) {
            setGalleryFiles([...galleryFiles, ...validFiles]);
            setGalleryPreviews([...galleryPreviews, ...previews]);
          }
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const removeGalleryImage = (index: number) => {
    const isExisting = index < (project?.images?.length || 0) - galleryFiles.length;
    if (isExisting) {
      setGalleryPreviews(galleryPreviews.filter((_, i) => i !== index));
    } else {
      const adjustedIndex = index - ((project?.images?.length || 0) - galleryFiles.length);
      setGalleryFiles(galleryFiles.filter((_, i) => i !== adjustedIndex));
      setGalleryPreviews(galleryPreviews.filter((_, i) => i !== index));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { title?: string; thumbnail?: string } = {};
    if (!title.trim()) newErrors.title = "Title is required";
    if (!isEditMode && !thumbnailFile && !thumbnailPreview) {
      newErrors.thumbnail = "Thumbnail image is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      let thumbnailUrl = project?.thumbnail_url || "";
      const imageUrls: string[] = [...galleryPreviews.filter(p => p.startsWith("http"))];

      // Upload thumbnail
      if (thumbnailFile) {
        const { url, error } = await hospitalityService.uploadImage(thumbnailFile);
        if (error || !url) {
          toast({ title: "Upload failed", description: error?.message, variant: "destructive" });
          setIsLoading(false);
          return;
        }
        thumbnailUrl = url;
        if (isEditMode && project?.thumbnail_url) {
          await hospitalityService.deleteImage(project.thumbnail_url);
        }
      }

      // Upload gallery images
      for (const file of galleryFiles) {
        const { url, error } = await hospitalityService.uploadImage(file);
        if (error || !url) {
          toast({ title: "Gallery upload failed", description: error?.message, variant: "destructive" });
          continue;
        }
        imageUrls.push(url);
      }

      const projectData = {
        title: title.trim(),
        description: description.trim() || undefined,
        short_description: shortDescription.trim() || undefined,
        long_description: longDescription.trim() || undefined,
        location: location.trim() || undefined,
        price_info: priceInfo.trim() || undefined,
        thumbnail_url: thumbnailUrl,
        images: imageUrls,
      };

      if (isEditMode && project) {
        const { error } = await hospitalityService.update(project.id, projectData);
        if (error) throw error;
        toast({ title: "Project updated", description: "The hospitality project has been updated." });
      } else {
        const { error } = await hospitalityService.create(projectData);
        if (error) throw error;
        toast({ title: "Project created", description: "The hospitality project has been created." });
      }

      handleClose();
      onSuccess();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "An error occurred";
      toast({ title: "Error", description: errorMessage, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="w-[95vw] max-w-3xl max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b border-border shrink-0">
          <DialogTitle className="font-serif text-xl">
            {isEditMode ? "Edit Hospitality Project" : "Add Hospitality Project"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <ScrollArea className="flex-1 min-h-0">
            <div className="px-6 py-6 space-y-5">
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
                {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
              </div>

              {/* Short Description */}
              <div className="space-y-2">
                <Label htmlFor="shortDescription">Short Description</Label>
                <Textarea
                  id="shortDescription"
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  placeholder="Brief description for cards"
                  rows={2}
                  disabled={isLoading}
                />
              </div>

              {/* Long Description */}
              <div className="space-y-2">
                <Label htmlFor="longDescription">Long Description</Label>
                <Textarea
                  id="longDescription"
                  value={longDescription}
                  onChange={(e) => setLongDescription(e.target.value)}
                  placeholder="Detailed description for detail page"
                  rows={4}
                  disabled={isLoading}
                />
              </div>

              {/* Location & Price */}
              <div className="grid grid-cols-2 gap-4">
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
                <div className="space-y-2">
                  <Label htmlFor="priceInfo">Price Info</Label>
                  <Input
                    id="priceInfo"
                    value={priceInfo}
                    onChange={(e) => setPriceInfo(e.target.value)}
                    placeholder="e.g., From $500/night"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Thumbnail */}
              <div className="space-y-2">
                <Label>Thumbnail Image {!isEditMode && "*"}</Label>
                {thumbnailPreview ? (
                  <div className="relative group">
                    <img
                      src={thumbnailPreview}
                      alt="Thumbnail preview"
                      className="w-full h-48 object-cover rounded-lg border border-border"
                      loading="lazy"
                    />
                    <button
                      type="button"
                      onClick={() => { setThumbnailFile(null); setThumbnailPreview(isEditMode ? project?.thumbnail_url || null : null); }}
                      className="absolute top-2 right-2 p-1.5 bg-background/90 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive hover:text-destructive-foreground"
                      disabled={isLoading}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => thumbnailInputRef.current?.click()}
                    className={`w-full h-48 border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors hover:border-primary hover:bg-primary/5 ${errors.thumbnail ? "border-destructive" : "border-border"}`}
                  >
                    <ImageIcon className="w-10 h-10 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Click to upload thumbnail</p>
                  </div>
                )}
                <input ref={thumbnailInputRef} type="file" accept="image/*" onChange={handleThumbnailSelect} className="hidden" disabled={isLoading} />
                {errors.thumbnail && <p className="text-sm text-destructive">{errors.thumbnail}</p>}
              </div>

              {/* Gallery */}
              <div className="space-y-2">
                <Label>Gallery Images</Label>
                <div className="grid grid-cols-3 gap-3">
                  {galleryPreviews.map((preview, index) => (
                    <div key={index} className="relative group aspect-square">
                      <img src={preview} alt={`Gallery image ${index + 1}`} className="w-full h-full object-cover rounded-lg border border-border" loading="lazy" />
                      <button
                        type="button"
                        onClick={() => removeGalleryImage(index)}
                        className="absolute top-1 right-1 p-1 bg-background/90 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive hover:text-destructive-foreground"
                        disabled={isLoading}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  <div
                    onClick={() => galleryInputRef.current?.click()}
                    className="aspect-square border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors hover:border-primary hover:bg-primary/5"
                  >
                    <Plus className="w-6 h-6 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Add</span>
                  </div>
                </div>
                <input ref={galleryInputRef} type="file" accept="image/*" multiple onChange={handleGallerySelect} className="hidden" disabled={isLoading} />
              </div>
            </div>
          </ScrollArea>

          <DialogFooter className="px-6 py-4 border-t border-border shrink-0 bg-background flex flex-row items-center justify-end gap-3">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>Cancel</Button>
            <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={isLoading}>
              {isLoading ? <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" /> : isEditMode ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
