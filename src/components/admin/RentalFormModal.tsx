import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { rentalService, Rental, RentalLocation, CreateRentalInput, UpdateRentalInput } from "@/services/rentalService";
import { Upload, X, Image as ImageIcon, Plus, Trash2 } from "lucide-react";

interface RentalFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rental?: Rental | null;
  locations: RentalLocation[];
  onSuccess: () => void;
}

export function RentalFormModal({ open, onOpenChange, rental, locations, onSuccess }: RentalFormModalProps) {
  const [title, setTitle] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [longDescription, setLongDescription] = useState("");
  const [selectedLocationIds, setSelectedLocationIds] = useState<string[]>([]);
  const [address, setAddress] = useState("");
  const [price, setPrice] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [bathrooms, setBathrooms] = useState("");
  const [area, setArea] = useState("");
  const [amenities, setAmenities] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [displayOrder, setDisplayOrder] = useState(0);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ title?: string }>({});
  
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const imagesInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const isEditMode = !!rental;

  const resetForm = () => {
    setTitle("");
    setShortDescription("");
    setLongDescription("");
    setSelectedLocationIds([]);
    setAddress("");
    setPrice("");
    setBedrooms("");
    setBathrooms("");
    setArea("");
    setAmenities("");
    setIsFeatured(false);
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
      toast({ title: "Invalid file", description: "Please select an image file", variant: "destructive" });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "File too large", description: "Image must be less than 5MB", variant: "destructive" });
      return;
    }

    setThumbnailFile(file);

    const reader = new FileReader();
    reader.onload = (e) => {
      setThumbnailPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveThumbnail = () => {
    setThumbnailFile(null);
    setThumbnailPreview(isEditMode ? rental?.thumbnail_url || null : null);
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
    const newErrors: { title?: string } = {};

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
      let thumbnailUrl = rental?.thumbnail_url || null;

      // Upload new thumbnail if selected
      if (thumbnailFile) {
        const { url, error: uploadError } = await rentalService.uploadImage(thumbnailFile);
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
        if (isEditMode && rental?.thumbnail_url) {
          await rentalService.deleteImage(rental.thumbnail_url);
        }
      }

      // Upload new gallery images
      const uploadedImageUrls: string[] = [];
      for (const file of newImageFiles) {
        const { url, error } = await rentalService.uploadImage(file);
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
      const amenitiesArray = amenities.split(",").map(a => a.trim()).filter(Boolean);

      if (isEditMode && rental) {
        const updates: UpdateRentalInput = {
          title: title.trim(),
          short_description: shortDescription.trim() || undefined,
          long_description: longDescription.trim() || undefined,
          location_ids: selectedLocationIds,
          address: address.trim() || undefined,
          price: price.trim() || undefined,
          bedrooms: bedrooms ? parseInt(bedrooms) : undefined,
          bathrooms: bathrooms ? parseInt(bathrooms) : undefined,
          area: area.trim() || undefined,
          amenities: amenitiesArray,
          is_featured: isFeatured,
          display_order: displayOrder,
          images: allImages,
        };
        
        if (thumbnailFile) {
          updates.thumbnail_url = thumbnailUrl || undefined;
        }

        const { error } = await rentalService.update(rental.id, updates);
        if (error) throw error;

        toast({
          title: "Rental updated",
          description: "Rental property has been updated successfully.",
        });
      } else {
        const newRental: CreateRentalInput = {
          title: title.trim(),
          short_description: shortDescription.trim() || undefined,
          long_description: longDescription.trim() || undefined,
          location_ids: selectedLocationIds,
          address: address.trim() || undefined,
          price: price.trim() || undefined,
          bedrooms: bedrooms ? parseInt(bedrooms) : undefined,
          bathrooms: bathrooms ? parseInt(bathrooms) : undefined,
          area: area.trim() || undefined,
          amenities: amenitiesArray,
          is_featured: isFeatured,
          display_order: displayOrder,
          thumbnail_url: thumbnailUrl || undefined,
          images: allImages,
        };

        const { error } = await rentalService.create(newRental);
        if (error) throw error;

        toast({
          title: "Rental created",
          description: "Rental property has been created successfully.",
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
    if (open && rental) {
      setTitle(rental.title);
      setShortDescription(rental.short_description || "");
      setLongDescription(rental.long_description || "");
      setSelectedLocationIds(rental.location_ids || []);
      setAddress(rental.address || "");
      setPrice(rental.price || "");
      setBedrooms(rental.bedrooms?.toString() || "");
      setBathrooms(rental.bathrooms?.toString() || "");
      setArea(rental.area || "");
      setAmenities(rental.amenities?.join(", ") || "");
      setIsFeatured(rental.is_featured);
      setDisplayOrder(rental.display_order);
      setThumbnailPreview(rental.thumbnail_url);
      setImages(rental.images || []);
      setThumbnailFile(null);
      setNewImageFiles([]);
      setErrors({});
    } else if (open && !rental) {
      resetForm();
    }
  }, [open, rental]);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-[90vw] md:max-w-2xl lg:max-w-3xl max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-4 sm:px-6 py-3 sm:py-4 border-b border-border shrink-0">
          <DialogTitle className="font-serif text-lg sm:text-xl">
            {isEditMode ? "Edit Rental Property" : "Add Rental Property"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <ScrollArea className="flex-1 min-h-0 h-[50vh] sm:h-[60vh] md:h-[65vh]">
            <div className="px-4 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-5 md:space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title" className="text-xs sm:text-sm font-medium">Title *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter property title"
                  className={`text-sm sm:text-base h-10 sm:h-11 ${errors.title ? "border-destructive" : ""}`}
                  disabled={isLoading}
                />
                {errors.title && (
                  <p className="text-xs sm:text-sm text-destructive">{errors.title}</p>
                )}
              </div>

              {/* Locations (Checkboxes) & Featured */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-2">
                  <Label className="text-xs sm:text-sm font-medium">Locations</Label>
                  <div className="border border-border rounded-lg p-3 space-y-2 max-h-32 sm:max-h-40 overflow-y-auto bg-background">
                    {locations.length === 0 ? (
                      <p className="text-xs sm:text-sm text-muted-foreground">No locations available</p>
                    ) : (
                      locations.map((loc) => (
                        <div key={loc.id} className="flex items-center gap-2 min-h-[36px] sm:min-h-0">
                          <Checkbox
                            id={`location-${loc.id}`}
                            checked={selectedLocationIds.includes(loc.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedLocationIds(prev => [...prev, loc.id]);
                              } else {
                                setSelectedLocationIds(prev => prev.filter(id => id !== loc.id));
                              }
                            }}
                            disabled={isLoading}
                            className="h-5 w-5 sm:h-4 sm:w-4"
                          />
                          <label 
                            htmlFor={`location-${loc.id}`} 
                            className="text-xs sm:text-sm cursor-pointer select-none"
                          >
                            {loc.name}
                          </label>
                        </div>
                      ))
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs sm:text-sm font-medium">Featured</Label>
                  <div className="flex items-center gap-2 h-10 min-h-[44px] sm:min-h-0">
                    <Switch checked={isFeatured} onCheckedChange={setIsFeatured} disabled={isLoading} />
                    <span className="text-xs sm:text-sm text-muted-foreground">{isFeatured ? "Yes" : "No"}</span>
                  </div>
                </div>
              </div>

              {/* Short Description */}
              <div className="space-y-2">
                <Label htmlFor="shortDescription" className="text-xs sm:text-sm font-medium">Short Description</Label>
                <Textarea
                  id="shortDescription"
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  placeholder="Brief description for listings"
                  rows={2}
                  disabled={isLoading}
                  className="text-sm sm:text-base min-h-[80px] sm:min-h-[100px]"
                />
              </div>

              {/* Long Description */}
              <div className="space-y-2">
                <Label htmlFor="longDescription" className="text-xs sm:text-sm font-medium">Full Description</Label>
                <Textarea
                  id="longDescription"
                  value={longDescription}
                  onChange={(e) => setLongDescription(e.target.value)}
                  placeholder="Detailed property description"
                  rows={4}
                  disabled={isLoading}
                  className="text-sm sm:text-base min-h-[100px] sm:min-h-[120px]"
                />
              </div>

              {/* Price, Address */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-2">
                  <Label htmlFor="price" className="text-xs sm:text-sm font-medium">Price</Label>
                  <Input
                    id="price"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="e.g., $2,500/month"
                    disabled={isLoading}
                    className="text-sm sm:text-base h-10 sm:h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address" className="text-xs sm:text-sm font-medium">Address</Label>
                  <Input
                    id="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Property address"
                    disabled={isLoading}
                    className="text-sm sm:text-base h-10 sm:h-11"
                  />
                </div>
              </div>

              {/* Beds, Baths, Area, Order */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bedrooms" className="text-xs sm:text-sm font-medium">Beds</Label>
                  <Input
                    id="bedrooms"
                    type="number"
                    value={bedrooms}
                    onChange={(e) => setBedrooms(e.target.value)}
                    placeholder="0"
                    disabled={isLoading}
                    className="text-sm sm:text-base h-10 sm:h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bathrooms" className="text-xs sm:text-sm font-medium">Baths</Label>
                  <Input
                    id="bathrooms"
                    type="number"
                    value={bathrooms}
                    onChange={(e) => setBathrooms(e.target.value)}
                    placeholder="0"
                    disabled={isLoading}
                    className="text-sm sm:text-base h-10 sm:h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="area" className="text-xs sm:text-sm font-medium">Area</Label>
                  <Input
                    id="area"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    placeholder="e.g., 1,500 sqft"
                    disabled={isLoading}
                    className="text-sm sm:text-base h-10 sm:h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="displayOrder" className="text-xs sm:text-sm font-medium">Order</Label>
                  <Input
                    id="displayOrder"
                    type="number"
                    value={displayOrder}
                    onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 0)}
                    placeholder="0"
                    disabled={isLoading}
                    className="text-sm sm:text-base h-10 sm:h-11"
                  />
                </div>
              </div>

              {/* Amenities */}
              <div className="space-y-2">
                <Label htmlFor="amenities" className="text-xs sm:text-sm font-medium">Amenities (comma-separated)</Label>
                <Input
                  id="amenities"
                  value={amenities}
                  onChange={(e) => setAmenities(e.target.value)}
                  placeholder="Pool, Gym, Parking, etc."
                  disabled={isLoading}
                  className="text-sm sm:text-base h-10 sm:h-11"
                />
              </div>

              {/* Thumbnail */}
              <div className="space-y-2">
                <Label className="text-xs sm:text-sm font-medium">Thumbnail Image</Label>

                {thumbnailPreview ? (
                  <div className="relative group">
                    <img
                      src={thumbnailPreview}
                      alt="Thumbnail preview"
                      className="w-full h-32 sm:h-40 object-cover rounded-lg border border-border"
                      loading="lazy"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveThumbnail}
                      className="absolute top-2 right-2 p-1.5 bg-background/90 rounded-full opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity hover:bg-destructive hover:text-destructive-foreground min-w-[36px] min-h-[36px] sm:min-w-0 sm:min-h-0 flex items-center justify-center"
                      disabled={isLoading}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => thumbnailInputRef.current?.click()}
                    className="w-full h-32 sm:h-40 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors hover:border-primary hover:bg-primary/5"
                  >
                    <ImageIcon className="w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground" />
                    <p className="text-xs sm:text-sm text-muted-foreground">Click to upload thumbnail</p>
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
                    className="h-9 sm:h-10 text-sm"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Replace Thumbnail
                  </Button>
                )}
              </div>

              {/* Gallery Images */}
              <div className="space-y-2">
                <Label className="text-xs sm:text-sm font-medium">Gallery Images</Label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-3">
                  {images.map((img, index) => (
                    <div key={`existing-${index}`} className="relative group aspect-square">
                      <img
                        src={img}
                        alt={`Gallery image ${index + 1}`}
                        className="w-full h-full object-cover rounded-lg border border-border"
                        loading="lazy"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveExistingImage(index)}
                        className="absolute top-1 right-1 p-1.5 sm:p-1 bg-destructive text-destructive-foreground rounded-full opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity min-w-[28px] min-h-[28px] sm:min-w-0 sm:min-h-0 flex items-center justify-center"
                        disabled={isLoading}
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}

                  {newImageFiles.map((file, index) => (
                    <div key={`new-${index}`} className="relative group aspect-square">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`New gallery image ${index + 1}`}
                        className="w-full h-full object-cover rounded-lg border-2 border-primary border-dashed"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveNewImage(index)}
                        className="absolute top-1 right-1 p-1.5 sm:p-1 bg-destructive text-destructive-foreground rounded-full opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity min-w-[28px] min-h-[28px] sm:min-w-0 sm:min-h-0 flex items-center justify-center"
                        disabled={isLoading}
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={() => imagesInputRef.current?.click()}
                    className="aspect-square border-2 border-dashed border-border rounded-lg flex items-center justify-center hover:border-primary hover:bg-primary/5 transition-colors"
                    disabled={isLoading}
                  >
                    <Plus className="w-5 h-5 sm:w-6 sm:h-6 text-muted-foreground" />
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
                "Update Rental"
              ) : (
                "Create Rental"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}