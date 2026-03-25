import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { pageBlockService, PageBlock } from "@/services/pageBlockService";
import { supabase } from "@/integrations/supabase/safeClient";
import { Loader2, Plus, Trash2, Image, Upload, X, Instagram, Facebook, Youtube } from "lucide-react";

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
  backgroundImage?: string;
  videoUrl?: string;
  heroImages?: string[];
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
  
  // Social Links state
  const [instagramUrl, setInstagramUrl] = useState("");
  const [facebookUrl, setFacebookUrl] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [socialLinksBlock, setSocialLinksBlock] = useState<PageBlock | null>(null);
  
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
    
    const [heroResult, brandStoryResult, testimonialsResult, trustedByResult, socialLinksResult] = await Promise.all([
      pageBlockService.getByKey("home", "hero"),
      pageBlockService.getByKey("home", "brand_story_section"),
      pageBlockService.getByKey("home", "testimonials"),
      pageBlockService.getByKey("home", "trusted_by"),
      pageBlockService.getByKey("home", "social_links"),
    ]);

    if (heroResult.data) {
      setHeroBlock(heroResult.data);
      const content = heroResult.data.content as HeroContent & { hero_images?: string[] };
      // Support both heroImages and hero_images for backwards compatibility
      setHeroImages(content.heroImages || content.hero_images || []);
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

    if (socialLinksResult.data) {
      setSocialLinksBlock(socialLinksResult.data);
      const content = socialLinksResult.data.content as { instagram?: string; facebook?: string; youtube?: string; whatsapp?: string };
      setInstagramUrl(content.instagram || "");
      setFacebookUrl(content.facebook || "");
      setYoutubeUrl(content.youtube || "");
      setWhatsappNumber(content.whatsapp || "");
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
          backgroundImage: existingContent.backgroundImage?.trim() ? existingContent.backgroundImage.trim() : undefined,
          heroImages: heroImages,
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
          content: { heroImages: heroImages } as unknown as Record<string, unknown>,
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

      // Save social links
      const socialLinksContent = {
        instagram: instagramUrl.trim() || undefined,
        facebook: facebookUrl.trim() || undefined,
        youtube: youtubeUrl.trim() || undefined,
        whatsapp: whatsappNumber.trim() || undefined,
      };
      
      if (socialLinksBlock) {
        await pageBlockService.update(socialLinksBlock.id, {
          content: socialLinksContent as unknown as Record<string, unknown>,
        });
      } else {
        const { data: createdSocialLinks, error: socialError } = await pageBlockService.create({
          page_key: "home",
          block_key: "social_links",
          block_type: "social",
          content: socialLinksContent as unknown as Record<string, unknown>,
          display_order: 10,
          is_active: true,
        });
        if (socialError) throw socialError;
        setSocialLinksBlock(createdSocialLinks);
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
      window.dispatchEvent(
        new CustomEvent("page-block-updated", {
          detail: { page_key: "home", block_key: "social_links" },
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
      <DialogContent className="max-w-[95vw] sm:max-w-[90vw] md:max-w-2xl lg:max-w-3xl h-[90vh] max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-4 sm:px-6 py-3 sm:py-4 border-b border-border shrink-0">
          <DialogTitle className="font-serif text-lg sm:text-xl md:text-2xl">Edit Home Page</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-10 flex-1">
            <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin text-primary" />
          </div>
        ) : (
          <ScrollArea className="flex-1 min-h-0 pr-4">
            <div className="px-4 sm:px-6 py-4 sm:py-6 space-y-6 sm:space-y-8">
              {/* Hero Images Section */}
              <div className="p-3 sm:p-4 rounded-lg border border-primary/20 bg-primary/5">
                <h3 className="font-serif text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center gap-2">
                  <Image className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                  Hero Images (Rotating)
                </h3>
                <div className="space-y-3 sm:space-y-4">
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Upload images to display on the right side of the hero section. Images will rotate automatically.
                  </p>
                  
                  {/* Image Grid */}
                  {heroImages.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                      {heroImages.map((img, index) => (
                        <div key={index} className="relative group aspect-video rounded-lg overflow-hidden border border-border">
                          <img src={img} alt={`Hero ${index + 1}`} className="w-full h-full object-cover" />
                          <button
                            onClick={() => removeHeroImage(index)}
                            className="absolute top-1 right-1 p-1.5 sm:p-1 bg-destructive text-destructive-foreground rounded-full opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity min-w-[28px] min-h-[28px] sm:min-w-0 sm:min-h-0 flex items-center justify-center"
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
                      className="w-full h-10 sm:h-11 text-sm sm:text-base"
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
              <div className="p-3 sm:p-4 rounded-lg border border-primary/20 bg-primary/5">
                <h3 className="font-serif text-base sm:text-lg font-semibold mb-3 sm:mb-4">Brand Story Section</h3>
                <div className="space-y-3 sm:space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="brandStoryHeading" className="text-xs sm:text-sm font-medium">Section Heading</Label>
                    <Input
                      id="brandStoryHeading"
                      value={brandStoryHeading}
                      onChange={(e) => setBrandStoryHeading(e.target.value)}
                      placeholder="Our Brand Story"
                      className="text-sm sm:text-base h-10 sm:h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="brandStoryParagraph" className="text-xs sm:text-sm font-medium">Paragraph</Label>
                    <Textarea
                      id="brandStoryParagraph"
                      value={brandStoryParagraph}
                      onChange={(e) => setBrandStoryParagraph(e.target.value)}
                      placeholder="Write a brief description about your brand story..."
                      rows={4}
                      className="text-sm sm:text-base min-h-[100px] sm:min-h-[120px]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs sm:text-sm font-medium">Section Image</Label>
                    {brandStoryImage && (
                      <div className="relative mt-2 mb-3 aspect-video max-w-xs rounded-lg overflow-hidden border border-border">
                        <img src={brandStoryImage} alt="Brand Story" className="w-full h-full object-cover" />
                        <button
                          onClick={() => setBrandStoryImage("")}
                          className="absolute top-1 right-1 p-1.5 sm:p-1 bg-destructive text-destructive-foreground rounded-full min-w-[28px] min-h-[28px] sm:min-w-0 sm:min-h-0 flex items-center justify-center"
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
                      className="h-9 sm:h-10 text-sm"
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
                <h3 className="font-serif text-base sm:text-lg font-semibold mb-3 sm:mb-4">Scrolling Testimonials</h3>
                <div className="space-y-3 sm:space-y-4">
                  {testimonials.map((testimonial, index) => (
                    <div key={testimonial.id} className="border border-border rounded-lg p-3 sm:p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs sm:text-sm font-medium text-muted-foreground">
                          Testimonial {index + 1}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeTestimonial(index)}
                          className="text-destructive hover:text-destructive h-9 sm:h-10 min-w-[44px]"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs sm:text-sm font-medium">Quote Text</Label>
                        <Textarea
                          value={testimonial.text}
                          onChange={(e) => updateTestimonial(index, "text", e.target.value)}
                          placeholder="Enter testimonial quote..."
                          rows={2}
                          className="text-sm sm:text-base min-h-[80px] sm:min-h-[100px]"
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label className="text-xs sm:text-sm font-medium">Author Name</Label>
                          <Input
                            value={testimonial.author}
                            onChange={(e) => updateTestimonial(index, "author", e.target.value)}
                            placeholder="John D."
                            className="text-sm sm:text-base h-10 sm:h-11"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs sm:text-sm font-medium">Role/Title</Label>
                          <Input
                            value={testimonial.role}
                            onChange={(e) => updateTestimonial(index, "role", e.target.value)}
                            placeholder="Developer"
                            className="text-sm sm:text-base h-10 sm:h-11"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" onClick={addTestimonial} className="w-full h-10 sm:h-11 text-sm sm:text-base">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Testimonial
                  </Button>
                </div>
              </div>

              {/* Trusted By Section */}
              <div>
                <h3 className="font-serif text-base sm:text-lg font-semibold mb-3 sm:mb-4">Trusted By Marquee</h3>
                <div className="space-y-3 sm:space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs sm:text-sm font-medium">Section Title</Label>
                    <Input
                      value={trustedByTitle}
                      onChange={(e) => setTrustedByTitle(e.target.value)}
                      placeholder="Trusted By"
                      className="text-sm sm:text-base h-10 sm:h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs sm:text-sm font-medium mb-2 block">Brand Names (scrolling text)</Label>
                    <div className="space-y-2">
                      {trustedByLogos.map((logo, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Input
                            value={logo}
                            onChange={(e) => updateLogo(index, e.target.value)}
                            placeholder="Brand name..."
                            className="text-sm sm:text-base h-10 sm:h-11"
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeLogo(index)}
                            className="text-destructive hover:text-destructive shrink-0 h-10 w-10 sm:h-11 sm:w-11"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                      <Button variant="outline" onClick={addLogo} className="w-full h-10 sm:h-11 text-sm sm:text-base">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Brand
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Social Media Links Section */}
              <div className="p-3 sm:p-4 rounded-lg border border-primary/20 bg-primary/5">
                <h3 className="font-serif text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center gap-2">
                  Social Media Links
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground mb-4">
                  Add your social media profile URLs. These will appear in the footer.
                </p>
                <div className="space-y-3 sm:space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs sm:text-sm font-medium flex items-center gap-2">
                      <Instagram className="w-4 h-4 text-pink-500" />
                      Instagram URL
                    </Label>
                    <Input
                      value={instagramUrl}
                      onChange={(e) => setInstagramUrl(e.target.value)}
                      placeholder="https://instagram.com/yourprofile"
                      className="text-sm sm:text-base h-10 sm:h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs sm:text-sm font-medium flex items-center gap-2">
                      <Facebook className="w-4 h-4 text-blue-600" />
                      Facebook URL
                    </Label>
                    <Input
                      value={facebookUrl}
                      onChange={(e) => setFacebookUrl(e.target.value)}
                      placeholder="https://facebook.com/yourpage"
                      className="text-sm sm:text-base h-10 sm:h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs sm:text-sm font-medium flex items-center gap-2">
                      <Youtube className="w-4 h-4 text-red-600" />
                      YouTube URL
                    </Label>
                    <Input
                      value={youtubeUrl}
                      onChange={(e) => setYoutubeUrl(e.target.value)}
                      placeholder="https://youtube.com/@yourchannel"
                      className="text-sm sm:text-base h-10 sm:h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs sm:text-sm font-medium flex items-center gap-2">
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-[#25D366]">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                      </svg>
                      WhatsApp Number
                    </Label>
                    <Input
                      value={whatsappNumber}
                      onChange={(e) => setWhatsappNumber(e.target.value)}
                      placeholder="+919997268880"
                      className="text-sm sm:text-base h-10 sm:h-11"
                    />
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>
        )}

        {/* Sticky Footer */}
        <DialogFooter className="flex-col-reverse sm:flex-row gap-3 sm:gap-4 px-4 py-4 sm:px-6 border-t border-border shrink-0 bg-background">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving} className="w-full sm:w-auto h-9 sm:h-10 text-sm sm:text-base">
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving || isLoading} className="w-full sm:w-auto h-9 sm:h-10 text-sm sm:text-base bg-primary">
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2 animate-spin" />
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