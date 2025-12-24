import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { pageBlockService, PageBlock } from "@/services/pageBlockService";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Plus, Trash2, Image, Upload, X } from "lucide-react";

interface HomePageEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Testimonial {
  id: string;
  text: string;
  author: string;
  role: string;
}

interface HeroContent {
  title?: string;
  subtitle?: string;
  description?: string;
  background_image?: string;
  video_url?: string;
  hero_images?: string[];
}

interface BrandStorySectionContent {
  heading?: string;
  paragraph?: string;
  image?: string;
}

export function HomePageEditor({ open, onOpenChange }: HomePageEditorProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  // Hero state
  const [heroImages, setHeroImages] = useState<string[]>([]);
  const [heroBlock, setHeroBlock] = useState<PageBlock | null>(null);
  
  // Brand Story Section state
  const [brandStoryHeading, setBrandStoryHeading] = useState("Our Brand Story");
  const [brandStoryParagraph, setBrandStoryParagraph] = useState("");
  const [brandStoryImage, setBrandStoryImage] = useState("");
  const [brandStoryBlock, setBrandStoryBlock] = useState<PageBlock | null>(null);
  
  // Testimonials state
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [testimonialsBlock, setTestimonialsBlock] = useState<PageBlock | null>(null);
  
  // Trusted By state
  const [trustedByTitle, setTrustedByTitle] = useState("Trusted By");
  const [trustedByLogos, setTrustedByLogos] = useState<string[]>([]);
  const [trustedByBlock, setTrustedByBlock] = useState<PageBlock | null>(null);
  
  const heroImageInputRef = useRef<HTMLInputElement>(null);
  const brandStoryImageInputRef = useRef<HTMLInputElement>(null);
  
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchData();
    }
  }, [open]);

  const fetchData = async () => {
    setIsLoading(true);
    
    const [heroResult, brandStoryResult, testimonialsResult, trustedByResult] = await Promise.all([
      pageBlockService.getByKey("home", "hero"),
      pageBlockService.getByKey("home", "brand_story_section"),
      pageBlockService.getByKey("home", "testimonials"),
      pageBlockService.getByKey("home", "trusted_by"),
    ]);

    if (heroResult.data) {
      setHeroBlock(heroResult.data);
      const content = heroResult.data.content as HeroContent;
      setHeroImages(content.hero_images || []);
    }

    if (brandStoryResult.data) {
      setBrandStoryBlock(brandStoryResult.data);
      const content = brandStoryResult.data.content as BrandStorySectionContent;
      setBrandStoryHeading(content.heading || "Our Brand Story");
      setBrandStoryParagraph(content.paragraph || "");
      setBrandStoryImage(content.image || "");
    }

    if (testimonialsResult.data) {
      setTestimonialsBlock(testimonialsResult.data);
      const items = (testimonialsResult.data.content as { items?: Testimonial[] }).items || [];
      setTestimonials(items);
    }

    if (trustedByResult.data) {
      setTrustedByBlock(trustedByResult.data);
      const content = trustedByResult.data.content as { title?: string; logos?: string[] };
      setTrustedByTitle(content.title || "Trusted By");
      setTrustedByLogos(content.logos || []);
    }

    setIsLoading(false);
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `hero-images/${fileName}`;
    
    const { error } = await supabase.storage.from('content-images').upload(filePath, file);
    
    if (error) {
      console.error('Upload error:', error);
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
      return null;
    }
    
    const { data: urlData } = supabase.storage.from('content-images').getPublicUrl(filePath);
    return urlData.publicUrl;
  };

  const handleHeroImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    setIsUploading(true);
    
    const uploadPromises = Array.from(files).map(file => uploadImage(file));
    const urls = await Promise.all(uploadPromises);
    const validUrls = urls.filter(Boolean) as string[];
    
    if (validUrls.length > 0) {
      setHeroImages(prev => [...prev, ...validUrls]);
      toast({ title: "Success", description: `${validUrls.length} image(s) uploaded` });
    }
    
    setIsUploading(false);
    if (heroImageInputRef.current) {
      heroImageInputRef.current.value = '';
    }
  };

  const handleBrandStoryImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsUploading(true);
    const url = await uploadImage(file);
    
    if (url) {
      setBrandStoryImage(url);
      toast({ title: "Success", description: "Image uploaded" });
    }
    
    setIsUploading(false);
    if (brandStoryImageInputRef.current) {
      brandStoryImageInputRef.current.value = '';
    }
  };

  const removeHeroImage = (index: number) => {
    setHeroImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setIsSaving(true);

    try {
      // Save / create hero block
      if (heroBlock) {
        const existingContent = heroBlock.content as HeroContent;
        const normalizedHeroContent = {
          ...existingContent,
          // avoid failing validation on empty-string URLs
          background_image: existingContent.background_image?.trim() ? existingContent.background_image.trim() : undefined,
          hero_images: heroImages,
        };

        const { error: heroUpdateError } = await pageBlockService.update(heroBlock.id, {
          content: normalizedHeroContent as unknown as Record<string, unknown>,
        });
        if (heroUpdateError) throw heroUpdateError;
      } else {
        const { data: createdHero, error: createError } = await pageBlockService.create({
          page_key: "home",
          block_key: "hero",
          block_type: "hero",
          content: { hero_images: heroImages } as unknown as Record<string, unknown>,
          display_order: 1,
          is_active: true,
        });
        if (createError) throw createError;
        setHeroBlock(createdHero);
      }

      // Save / create brand story section
      const brandStoryContent = {
        heading: brandStoryHeading,
        paragraph: brandStoryParagraph,
        image: brandStoryImage,
      };
      
      if (brandStoryBlock) {
        const { error: brandStoryUpdateError } = await pageBlockService.update(brandStoryBlock.id, {
          content: brandStoryContent as unknown as Record<string, unknown>,
        });
        if (brandStoryUpdateError) throw brandStoryUpdateError;
      } else {
        const { data: createdBrandStory, error: brandStoryError } = await pageBlockService.create({
          page_key: "home",
          block_key: "brand_story_section",
          block_type: "content",
          content: brandStoryContent as unknown as Record<string, unknown>,
          display_order: 2,
          is_active: true,
        });
        if (brandStoryError) throw brandStoryError;
        setBrandStoryBlock(createdBrandStory);
      }

      // Save testimonials
      if (testimonialsBlock) {
        await pageBlockService.update(testimonialsBlock.id, {
          content: { items: testimonials },
        });
      }

      // Save trusted by
      if (trustedByBlock) {
        await pageBlockService.update(trustedByBlock.id, {
          content: { title: trustedByTitle, logos: trustedByLogos },
        });
      }

      // Notify the site to re-fetch latest blocks
      window.dispatchEvent(
        new CustomEvent("page-block-updated", {
          detail: { page_key: "home", block_key: "hero" },
        })
      );
      window.dispatchEvent(
        new CustomEvent("page-block-updated", {
          detail: { page_key: "home", block_key: "brand_story_section" },
        })
      );

      toast({ title: "Saved", description: "Home page content updated successfully." });
      onOpenChange(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save changes";
      toast({ title: "Error", description: message, variant: "destructive" });
    }

    setIsSaving(false);
  };

  const updateTestimonial = (index: number, field: keyof Testimonial, value: string) => {
    const updated = [...testimonials];
    updated[index] = { ...updated[index], [field]: value };
    setTestimonials(updated);
  };

  const addTestimonial = () => {
    setTestimonials([
      ...testimonials,
      { id: `t${Date.now()}`, text: "", author: "", role: "" }
    ]);
  };

  const removeTestimonial = (index: number) => {
    setTestimonials(testimonials.filter((_, i) => i !== index));
  };

  const updateLogo = (index: number, value: string) => {
    const updated = [...trustedByLogos];
    updated[index] = value;
    setTrustedByLogos(updated);
  };

  const addLogo = () => {
    setTrustedByLogos([...trustedByLogos, ""]);
  };

  const removeLogo = (index: number) => {
    setTrustedByLogos(trustedByLogos.filter((_, i) => i !== index));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-3xl h-[90vh] max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b border-border shrink-0">
          <DialogTitle className="font-serif text-2xl">Edit Home Page</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-10 flex-1">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <ScrollArea className="flex-1 min-h-0">
            <div className="px-6 py-6 space-y-8">
              {/* Hero Images Section */}
              <div className="p-4 rounded-lg border border-primary/20 bg-primary/5">
                <h3 className="font-serif text-lg font-semibold mb-4 flex items-center gap-2">
                  <Image className="w-5 h-5 text-primary" />
                  Hero Images (Rotating)
                </h3>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Upload images to display on the right side of the hero section. Images will rotate automatically.
                  </p>
                  
                  {/* Image Grid */}
                  {heroImages.length > 0 && (
                    <div className="grid grid-cols-3 gap-3">
                      {heroImages.map((img, index) => (
                        <div key={index} className="relative group aspect-video rounded-lg overflow-hidden border border-border">
                          <img src={img} alt={`Hero ${index + 1}`} className="w-full h-full object-cover" />
                          <button
                            onClick={() => removeHeroImage(index)}
                            className="absolute top-1 right-1 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Upload Button */}
                  <div>
                    <input
                      ref={heroImageInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleHeroImageUpload}
                      className="hidden"
                    />
                    <Button
                      variant="outline"
                      onClick={() => heroImageInputRef.current?.click()}
                      disabled={isUploading}
                      className="w-full"
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-2" />
                          Upload Images
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Brand Story Section */}
              <div className="p-4 rounded-lg border border-primary/20 bg-primary/5">
                <h3 className="font-serif text-lg font-semibold mb-4">Brand Story Section</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="brandStoryHeading">Section Heading</Label>
                    <Input
                      id="brandStoryHeading"
                      value={brandStoryHeading}
                      onChange={(e) => setBrandStoryHeading(e.target.value)}
                      placeholder="Our Brand Story"
                    />
                  </div>
                  <div>
                    <Label htmlFor="brandStoryParagraph">Paragraph</Label>
                    <Textarea
                      id="brandStoryParagraph"
                      value={brandStoryParagraph}
                      onChange={(e) => setBrandStoryParagraph(e.target.value)}
                      placeholder="Write a brief description about your brand story..."
                      rows={4}
                    />
                  </div>
                  <div>
                    <Label>Section Image</Label>
                    {brandStoryImage && (
                      <div className="relative mt-2 mb-3 aspect-video max-w-xs rounded-lg overflow-hidden border border-border">
                        <img src={brandStoryImage} alt="Brand Story" className="w-full h-full object-cover" />
                        <button
                          onClick={() => setBrandStoryImage("")}
                          className="absolute top-1 right-1 p-1 bg-destructive text-destructive-foreground rounded-full"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                    <input
                      ref={brandStoryImageInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleBrandStoryImageUpload}
                      className="hidden"
                    />
                    <Button
                      variant="outline"
                      onClick={() => brandStoryImageInputRef.current?.click()}
                      disabled={isUploading}
                      size="sm"
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-2" />
                          {brandStoryImage ? "Change Image" : "Upload Image"}
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Testimonials Section */}
              <div>
                <h3 className="font-serif text-lg font-semibold mb-4">Scrolling Testimonials</h3>
                <div className="space-y-4">
                  {testimonials.map((testimonial, index) => (
                    <div key={testimonial.id} className="border border-border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-muted-foreground">
                          Testimonial {index + 1}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeTestimonial(index)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <div>
                        <Label>Quote Text</Label>
                        <Textarea
                          value={testimonial.text}
                          onChange={(e) => updateTestimonial(index, "text", e.target.value)}
                          placeholder="Enter testimonial quote..."
                          rows={2}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label>Author Name</Label>
                          <Input
                            value={testimonial.author}
                            onChange={(e) => updateTestimonial(index, "author", e.target.value)}
                            placeholder="John D."
                          />
                        </div>
                        <div>
                          <Label>Role/Title</Label>
                          <Input
                            value={testimonial.role}
                            onChange={(e) => updateTestimonial(index, "role", e.target.value)}
                            placeholder="Developer"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" onClick={addTestimonial} className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Testimonial
                  </Button>
                </div>
              </div>

              {/* Trusted By Section */}
              <div>
                <h3 className="font-serif text-lg font-semibold mb-4">Trusted By Marquee</h3>
                <div className="space-y-4">
                  <div>
                    <Label>Section Title</Label>
                    <Input
                      value={trustedByTitle}
                      onChange={(e) => setTrustedByTitle(e.target.value)}
                      placeholder="Trusted By"
                    />
                  </div>
                  <div>
                    <Label className="mb-2 block">Brand Names (scrolling text)</Label>
                    <div className="space-y-2">
                      {trustedByLogos.map((logo, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Input
                            value={logo}
                            onChange={(e) => updateLogo(index, e.target.value)}
                            placeholder="Brand name..."
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeLogo(index)}
                            className="text-destructive hover:text-destructive shrink-0"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                      <Button variant="outline" onClick={addLogo} className="w-full">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Brand
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>
        )}

        {/* Sticky Footer */}
        <DialogFooter className="px-6 py-4 border-t border-border shrink-0 bg-background">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving || isLoading} className="bg-primary">
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
