import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Edit, Save, X, Calendar, Image as ImageIcon, Upload, Trash2, Plus, Star, ExternalLink, Type } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

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
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    } catch (error) {
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] p-0 overflow-hidden bg-gradient-to-br from-background via-background to-muted/20">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />
        
        <DialogHeader className="px-8 py-5 border-b border-border/50 bg-gradient-to-r from-muted/50 to-transparent relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-semibold tracking-[0.25em] text-primary uppercase mb-1.5">
                {typeLabels[type]}
              </p>
              <DialogTitle className="font-serif text-2xl tracking-tight">
                {String(item.title || "Untitled")}
              </DialogTitle>
            </div>
            <div className="flex items-center gap-3">
              {isEditing ? (
                <>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => { setIsEditing(false); setEditedValues({}); setGalleryImages([]); }} 
                    disabled={isSaving}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-4 h-4 mr-1.5" />
                    Cancel
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={handleSave} 
                    disabled={isSaving}
                    className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
                  >
                    <Save className="w-4 h-4 mr-1.5" />
                    {isSaving ? "Saving..." : "Save Changes"}
                  </Button>
                </>
              ) : (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setIsEditing(true)}
                  className="border-primary/30 hover:border-primary hover:bg-primary/5"
                >
                  <Edit className="w-4 h-4 mr-1.5" />
                  Edit
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-100px)]">
          <div className="p-8 space-y-8 relative z-10">
            {/* Hero Image with classy shape */}
            {mainImage && (
              <div className="relative">
                <div 
                  className="aspect-[21/9] overflow-hidden bg-muted shadow-2xl shadow-black/10"
                  style={{
                    clipPath: 'polygon(0 0, 100% 0, 100% 90%, 95% 100%, 5% 100%, 0 90%)'
                  }}
                >
                  <img 
                    src={mainImage} 
                    alt={String(item.title || "")} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/40 via-transparent to-transparent" />
                </div>
                {/* Elegant frame accent */}
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-transparent via-primary to-transparent rounded-full" />
              </div>
            )}

            {/* Gallery Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold tracking-[0.2em] text-muted-foreground uppercase">
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
                      className="border-dashed border-primary/40 hover:border-primary hover:bg-primary/5"
                    >
                      {isUploading ? (
                        <>
                          <div className="w-4 h-4 mr-2 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4 mr-2" />
                          Add Images
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>

              {currentGallery.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {currentGallery.map((img, idx) => (
                    <div 
                      key={idx} 
                      className="group relative aspect-square overflow-hidden bg-muted shadow-lg"
                      style={{
                        clipPath: idx % 4 === 0 ? 'polygon(0 0, 100% 0, 100% 100%, 0 85%)' :
                                  idx % 4 === 1 ? 'polygon(0 0, 100% 0, 100% 85%, 0 100%)' :
                                  idx % 4 === 2 ? 'polygon(0 15%, 100% 0, 100% 100%, 0 100%)' :
                                  'polygon(0 0, 100% 15%, 100% 100%, 0 100%)'
                      }}
                    >
                      <img 
                        src={img} 
                        alt={`Gallery ${idx + 1}`} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      
                      {isEditing && (
                        <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <Button
                            size="icon"
                            variant="secondary"
                            className="h-8 w-8 bg-background/90 hover:bg-background shadow-lg"
                            onClick={() => handleSetAsThumbnail(img)}
                            title="Set as thumbnail"
                          >
                            <Star className="w-4 h-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="destructive"
                            className="h-8 w-8 shadow-lg"
                            onClick={() => handleRemoveImage(idx)}
                            title="Remove image"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div 
                  className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-muted-foreground/20 rounded-2xl bg-muted/30"
                  style={{
                    clipPath: 'polygon(2% 0, 98% 0, 100% 5%, 100% 95%, 98% 100%, 2% 100%, 0 95%, 0 5%)'
                  }}
                >
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                    <ImageIcon className="w-8 h-8 text-muted-foreground/50" />
                  </div>
                  <p className="text-sm text-muted-foreground">No gallery images yet</p>
                  {isEditing && onUploadImage && (
                    <Button
                      variant="link"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      className="mt-2 text-primary"
                    >
                      <Upload className="w-4 h-4 mr-1.5" />
                      Upload images
                    </Button>
                  )}
                </div>
              )}
            </div>

            {/* Visit Link Section */}
            {(getValue("visit_url") || isEditing) && (
              <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                <div className="flex items-center justify-between mb-3">
                  <Label className="text-[10px] font-bold tracking-[0.2em] text-primary uppercase flex items-center gap-2">
                    <ExternalLink className="w-4 h-4" />
                    Visit Link
                  </Label>
                </div>
                {isEditing ? (
                  <Input 
                    value={String(getValue("visit_url") || "")} 
                    onChange={(e) => setEditedValues(prev => ({ ...prev, visit_url: e.target.value }))} 
                    placeholder="https://example.com"
                    className="bg-background/50 border-border/50 focus:border-primary/50" 
                  />
                ) : getValue("visit_url") ? (
                  <a 
                    href={String(getValue("visit_url"))}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium text-sm"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Visit
                  </a>
                ) : null}
              </div>
            )}

            {/* Heading Section */}
            {(getValue("heading") || isEditing) && (
              <div className="p-4 rounded-xl bg-accent/10 border border-accent/20">
                <div className="flex items-center justify-between mb-3">
                  <Label className="text-[10px] font-bold tracking-[0.2em] text-accent-foreground uppercase flex items-center gap-2">
                    <Type className="w-4 h-4" />
                    Custom Heading
                  </Label>
                </div>
                {isEditing ? (
                  <Input 
                    value={String(getValue("heading") || "")} 
                    onChange={(e) => setEditedValues(prev => ({ ...prev, heading: e.target.value }))} 
                    placeholder="Enter a custom heading"
                    className="bg-background/50 border-border/50 focus:border-primary/50" 
                  />
                ) : (
                  <p className="text-foreground font-serif text-lg">
                    {String(getValue("heading"))}
                  </p>
                )}
              </div>
            )}

            {/* Fields Grid with elegant styling */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {fields.map((field) => {
                const value = getValue(field.key);
                return (
                  <div 
                    key={field.key} 
                    className={`${field.type === "textarea" ? "md:col-span-2" : ""} p-4 rounded-xl bg-muted/30 border border-border/50 transition-all duration-300 hover:border-primary/20 hover:bg-muted/50`}
                  >
                    <Label className="text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase block mb-3">
                      {field.label}
                    </Label>
                    {isEditing ? (
                      field.type === "textarea" ? (
                        <Textarea 
                          value={String(value || "")} 
                          onChange={(e) => setEditedValues(prev => ({ ...prev, [field.key]: e.target.value }))} 
                          className="bg-background/50 border-border/50 focus:border-primary/50 resize-none" 
                          rows={4} 
                        />
                      ) : field.type === "number" ? (
                        <Input 
                          type="number" 
                          value={String(value || "")} 
                          onChange={(e) => setEditedValues(prev => ({ ...prev, [field.key]: Number(e.target.value) }))} 
                          className="bg-background/50 border-border/50 focus:border-primary/50" 
                        />
                      ) : field.type === "url" ? (
                        <Input 
                          type="url" 
                          value={String(value || "")} 
                          onChange={(e) => setEditedValues(prev => ({ ...prev, [field.key]: e.target.value }))} 
                          placeholder="https://"
                          className="bg-background/50 border-border/50 focus:border-primary/50" 
                        />
                      ) : (
                        <Input 
                          value={String(value || "")} 
                          onChange={(e) => setEditedValues(prev => ({ ...prev, [field.key]: e.target.value }))} 
                          className="bg-background/50 border-border/50 focus:border-primary/50" 
                        />
                      )
                    ) : (
                      field.type === "url" && value ? (
                        <a 
                          href={String(value)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline flex items-center gap-1"
                        >
                          {String(value)}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                          {value ? String(value) : <span className="text-muted-foreground/50 italic text-sm">Not set</span>}
                        </p>
                      )
                    )}
                  </div>
                );
              })}
            </div>

            {/* Footer with elegant separator */}
            <div className="relative pt-6">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
              <div className="flex items-center gap-8 text-sm text-muted-foreground">
                {item.created_at && (
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground/70">Created</p>
                      <p className="text-foreground font-medium">{format(new Date(String(item.created_at)), "MMM d, yyyy")}</p>
                    </div>
                  </div>
                )}
                {currentGallery.length > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center">
                      <ImageIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground/70">Gallery</p>
                      <p className="text-foreground font-medium">{currentGallery.length} images</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
