import { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Edit, Save, X, Calendar, Image as ImageIcon, Upload, Trash2, Plus, Star, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { ContentSectionsEditor, ContentSection } from "./ContentSectionsEditor";

interface ViewDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: Record<string, unknown> | null;
  type: "project" | "construction" | "rental" | "hospitality";
  onSave: (updates: Record<string, unknown>) => Promise<void>;
  onUploadImage?: (file: File) => Promise<string | null>;
  fields: Array<{
    key: string;
    label: string;
    type: "text" | "textarea" | "number" | "url";
  }>;
}

export function ViewDetailModal({
  open,
  onOpenChange,
  item,
  type,
  onSave,
  onUploadImage,
  fields,
}: ViewDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedValues, setEditedValues] = useState<Record<string, unknown>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [contentSections, setContentSections] = useState<ContentSection[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize content sections from item
  useEffect(() => {
    if (item?.content_sections) {
      const sections = item.content_sections as ContentSection[];
      setContentSections(Array.isArray(sections) ? sections : []);
    } else {
      setContentSections([]);
    }
  }, [item]);

  if (!item) return null;

  const getImageUrl = (): string | null => {
    if (type === "project") return (item.image_url as string) || null;
    return (item.thumbnail_url as string) || null;
  };

  const getGalleryImages = (): string[] => {
    if (galleryImages.length > 0) return galleryImages;
    return (item.images as string[]) || [];
  };

  const handleSave = async () => {
    const updates = { ...editedValues };
    if (galleryImages.length > 0) {
      updates.images = galleryImages;
    }
    // Include content sections
    updates.content_sections = contentSections;
    
    if (Object.keys(updates).length === 0) {
      setIsEditing(false);
      return;
    }
    setIsSaving(true);
    try {
      await onSave(updates);
      setIsEditing(false);
      setEditedValues({});
      setGalleryImages([]);
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !onUploadImage) return;

    setIsUploading(true);
    const currentImages = getGalleryImages();
    const newImages: string[] = [...currentImages];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const url = await onUploadImage(file);
        if (url) {
          newImages.push(url);
        }
      }
      setGalleryImages(newImages);
      toast.success(`${files.length} image(s) uploaded successfully`);
    } catch {
      toast.error("Failed to upload some images");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveImage = (index: number) => {
    const currentImages = getGalleryImages();
    const newImages = currentImages.filter((_, i) => i !== index);
    setGalleryImages(newImages);
  };

  const handleSetAsThumbnail = async (imageUrl: string) => {
    const thumbnailKey = type === "project" ? "image_url" : "thumbnail_url";
    setEditedValues(prev => ({ ...prev, [thumbnailKey]: imageUrl }));
    toast.success("Image set as thumbnail - save to apply");
  };

  const getValue = (key: string): unknown => {
    return key in editedValues ? editedValues[key] : item[key];
  };

  const typeLabels = {
    project: "Portfolio Project",
    construction: "Construction Project",
    rental: "Rental Property",
    hospitality: "Hospitality Project",
  };

  const mainImage = getImageUrl();
  const currentGallery = getGalleryImages();

  // Filter out fields we handle separately
  const filteredFields = fields.filter(f => 
    !['short_description', 'heading', 'content_heading', 'long_description', 'description'].includes(f.key)
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-[90vw] md:max-w-2xl lg:max-w-3xl h-[90vh] max-h-[90vh] flex flex-col p-0 gap-0 bg-gradient-to-br from-background via-background to-muted/20 overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />

        {/* Fixed Header */}
        <DialogHeader className="px-4 sm:px-6 py-3 sm:py-4 border-b border-border/50 bg-gradient-to-r from-muted/50 to-transparent relative z-10 shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-semibold tracking-[0.25em] text-primary uppercase mb-1.5">
                {typeLabels[type]}
              </p>
              <DialogTitle className="font-serif text-lg sm:text-xl md:text-2xl tracking-tight">
                {String(item.title || "Untitled")}
              </DialogTitle>
            </div>
          </div>
        </DialogHeader>

        {/* Scrollable Content */}
        <ScrollArea className="flex-1 min-h-0 pr-4">
          <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 relative z-10">
            {/* Hero Image with classy shape */}
            {mainImage && (
              <div className="relative">
                <div 
                  className="aspect-[16/9] sm:aspect-[21/9] overflow-hidden bg-muted shadow-2xl shadow-black/10 rounded-lg sm:rounded-xl"
                >
                  <img 
                    src={mainImage} 
                    alt={String(item.title || "")} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/40 via-transparent to-transparent" />
                </div>
              </div>
            )}

            {/* Gallery Section */}
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-[10px] sm:text-xs font-bold tracking-[0.2em] text-muted-foreground uppercase">
                  Gallery
                </h4>
                {isEditing && onUploadImage && (
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="border-dashed border-primary/40 hover:border-primary hover:bg-primary/5 h-9 sm:h-10 text-xs sm:text-sm"
                    >
                      {isUploading ? (
                        <>
                          <div className="w-3 h-3 sm:w-4 sm:h-4 mr-2 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                          Add Images
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>

              {currentGallery.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-4">
                  {currentGallery.map((img, idx) => (
                    <div 
                      key={idx} 
                      className="group relative aspect-square overflow-hidden bg-muted shadow-lg rounded-md sm:rounded-lg"
                    >
                      <img 
                        src={img} 
                        alt={`Gallery ${idx + 1}`} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      
                      {isEditing && (
                        <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300">
                          <Button
                            size="icon"
                            variant="secondary"
                            className="h-8 w-8 sm:h-8 sm:w-8 bg-background/90 hover:bg-background shadow-lg"
                            onClick={() => handleSetAsThumbnail(img)}
                            title="Set as thumbnail"
                          >
                            <Star className="w-3 h-3 sm:w-4 sm:h-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="destructive"
                            className="h-8 w-8 sm:h-8 sm:w-8 shadow-lg"
                            onClick={() => handleRemoveImage(idx)}
                            title="Remove image"
                          >
                            <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-6 sm:py-8 border-2 border-dashed border-muted-foreground/20 rounded-lg sm:rounded-xl bg-muted/30">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                    <ImageIcon className="w-5 h-5 sm:w-6 sm:h-6 text-muted-foreground/50" />
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground">No gallery images yet</p>
                  {isEditing && onUploadImage && (
                    <Button
                      variant="link"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      className="mt-2 text-primary h-9 text-xs sm:text-sm"
                    >
                      <Upload className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5" />
                      Upload images
                    </Button>
                  )}
                </div>
              )}
            </div>

            {/* Visit Link Section */}
            <div className="p-3 sm:p-4 rounded-lg sm:rounded-xl bg-primary/5 border border-primary/20">
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <Label className="text-[10px] sm:text-xs font-bold tracking-[0.2em] text-primary uppercase flex items-center gap-2">
                  <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4" />
                  Visit Link
                </Label>
              </div>
              {isEditing ? (
                <Input 
                  value={String(getValue("visit_url") || "")} 
                  onChange={(e) => setEditedValues(prev => ({ ...prev, visit_url: e.target.value || null }))} 
                  placeholder="https://example.com"
                  className="bg-background/50 border-border/50 focus:border-primary/50 text-sm sm:text-base h-10 sm:h-11" 
                />
              ) : (
                <span className="text-xs sm:text-sm text-muted-foreground">
                  {getValue("visit_url") ? String(getValue("visit_url")) : "No link set"}
                </span>
              )}
            </div>

            {/* Dynamic Content Sections */}
            {isEditing ? (
              <div className="p-3 sm:p-4 rounded-lg sm:rounded-xl bg-muted/30 border border-border/50">
                <ContentSectionsEditor
                  sections={contentSections}
                  onChange={setContentSections}
                  title="Content Sections"
                />
              </div>
            ) : contentSections.length > 0 ? (
              <div className="space-y-4 sm:space-y-6">
                <h4 className="text-[10px] sm:text-xs font-bold tracking-[0.2em] text-muted-foreground uppercase">
                  Content Sections
                </h4>
                {contentSections.map((section, index) => (
                  <div key={index} className="p-3 sm:p-4 rounded-lg sm:rounded-xl bg-muted/30 border border-border/50">
                    {/* Section Image */}
                    {section.image && (
                      <div className="mb-3 sm:mb-4 rounded-lg overflow-hidden">
                        <img 
                          src={section.image} 
                          alt={section.heading || `Section ${index + 1}`} 
                          className="w-full h-auto object-cover aspect-video"
                          loading="lazy"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                    {section.heading && (
                      <h5 className="font-serif text-base sm:text-lg font-medium mb-2">{section.heading}</h5>
                    )}
                    <p className="text-sm sm:text-base text-muted-foreground whitespace-pre-wrap">{section.content}</p>
                  </div>
                ))}
              </div>
            ) : null}

            {/* Basic Fields Grid */}
            {filteredFields.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {filteredFields.map((field) => {
                  const value = getValue(field.key);
                  return (
                    <div 
                      key={field.key} 
                      className={`${field.type === "textarea" ? "sm:col-span-2" : ""} p-3 sm:p-4 rounded-lg sm:rounded-xl bg-muted/30 border border-border/50 transition-all duration-300 hover:border-primary/20 hover:bg-muted/50`}
                    >
                      <Label className="text-[10px] sm:text-xs font-bold tracking-[0.2em] text-muted-foreground uppercase block mb-2 sm:mb-3">
                        {field.label}
                      </Label>
                      {isEditing ? (
                        field.type === "textarea" ? (
                          <Textarea 
                            value={String(value || "")} 
                            onChange={(e) => setEditedValues(prev => ({ ...prev, [field.key]: e.target.value }))} 
                            className="bg-background/50 border-border/50 focus:border-primary/50 resize-none text-sm sm:text-base min-h-[80px] sm:min-h-[100px]" 
                            rows={4} 
                          />
                        ) : field.type === "number" ? (
                          <Input 
                            type="number" 
                            value={String(value || "")} 
                            onChange={(e) => setEditedValues(prev => ({ ...prev, [field.key]: Number(e.target.value) }))} 
                            className="bg-background/50 border-border/50 focus:border-primary/50 text-sm sm:text-base h-10 sm:h-11" 
                          />
                        ) : field.type === "url" ? (
                          <Input 
                            type="url" 
                            value={String(value || "")} 
                            onChange={(e) => setEditedValues(prev => ({ ...prev, [field.key]: e.target.value }))} 
                            placeholder="https://"
                            className="bg-background/50 border-border/50 focus:border-primary/50 text-sm sm:text-base h-10 sm:h-11" 
                          />
                        ) : (
                          <Input 
                            value={String(value || "")} 
                            onChange={(e) => setEditedValues(prev => ({ ...prev, [field.key]: e.target.value }))} 
                            className="bg-background/50 border-border/50 focus:border-primary/50 text-sm sm:text-base h-10 sm:h-11" 
                          />
                        )
                      ) : (
                        field.type === "url" && value ? (
                          <a 
                            href={String(value)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline flex items-center gap-1 text-sm sm:text-base"
                          >
                            {String(value)}
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          <p className="text-sm sm:text-base text-foreground leading-relaxed whitespace-pre-wrap">
                            {value ? String(value) : <span className="text-muted-foreground/50 italic text-xs sm:text-sm">Not set</span>}
                          </p>
                        )
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Footer with elegant separator */}
            <div className="relative pt-4 sm:pt-6">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
              <div className="flex flex-wrap items-center gap-4 sm:gap-8 text-xs sm:text-sm text-muted-foreground">
                {item.created_at && (
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-muted/50 flex items-center justify-center">
                      <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                    </div>
                    <div>
                      <p className="text-[9px] sm:text-[10px] uppercase tracking-wider text-muted-foreground/70">Created</p>
                      <p className="text-foreground font-medium text-xs sm:text-sm">{format(new Date(String(item.created_at)), "MMM d, yyyy")}</p>
                    </div>
                  </div>
                )}
                {currentGallery.length > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-muted/50 flex items-center justify-center">
                      <ImageIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                    </div>
                    <div>
                      <p className="text-[9px] sm:text-[10px] uppercase tracking-wider text-muted-foreground/70">Gallery</p>
                      <p className="text-foreground font-medium text-xs sm:text-sm">{currentGallery.length} images</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* Sticky Footer with Actions */}
        <DialogFooter className="flex-col sm:flex-row gap-3 sm:gap-4 px-4 py-4 sm:px-6 border-t border-border/50 bg-background shrink-0">
          {/* Left side - Visit Link button */}
          <div className="w-full sm:w-auto order-2 sm:order-1 sm:mr-auto">
            {getValue("visit_url") && (
              <Button
                variant="outline"
                onClick={() => window.open(String(getValue("visit_url")), '_blank', 'noopener,noreferrer')}
                className="w-full sm:w-auto border-primary/30 hover:border-primary hover:bg-primary/5 h-9 sm:h-10 text-sm sm:text-base"
              >
                <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5" />
                Visit Link
              </Button>
            )}
          </div>
          
          {/* Right side - Edit/Save actions */}
          <div className="flex items-center gap-3 w-full sm:w-auto order-1 sm:order-2">
            {isEditing ? (
              <>
                <Button 
                  variant="outline" 
                  onClick={() => { 
                    setIsEditing(false); 
                    setEditedValues({}); 
                    setGalleryImages([]); 
                    // Reset content sections to original
                    if (item?.content_sections) {
                      setContentSections(item.content_sections as ContentSection[]);
                    }
                  }} 
                  disabled={isSaving}
                  className="flex-1 sm:flex-none h-9 sm:h-10 text-sm sm:text-base"
                >
                  <X className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5" />
                  Cancel
                </Button>
                <Button 
                  onClick={handleSave} 
                  disabled={isSaving}
                  className="flex-1 sm:flex-none bg-primary hover:bg-primary/90 h-9 sm:h-10 text-sm sm:text-base"
                >
                  <Save className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5" />
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </>
            ) : (
              <Button 
                variant="outline" 
                onClick={() => setIsEditing(true)}
                className="w-full sm:w-auto border-primary/30 hover:border-primary hover:bg-primary/5 h-9 sm:h-10 text-sm sm:text-base"
              >
                <Edit className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5" />
                Edit
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}