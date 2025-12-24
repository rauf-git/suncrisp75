import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { pageBlockService, PageBlock } from "@/services/pageBlockService";
import { Loader2, Plus, Trash2, Video, AlertCircle } from "lucide-react";

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
}

const isValidYouTubeUrl = (url: string): boolean => {
  if (!url) return true; // Empty is valid (optional field)
  const patterns = [
    /^https?:\/\/(www\.)?youtube\.com\/watch\?v=[a-zA-Z0-9_-]{11}([&#?].*)?$/,
    /^https?:\/\/youtu\.be\/[a-zA-Z0-9_-]{11}([&#?].*)?$/,
    /^https?:\/\/(www\.)?youtube\.com\/embed\/[a-zA-Z0-9_-]{11}([&#?].*)?$/,
  ];
  return patterns.some((pattern) => pattern.test(url.trim()));
};

export function HomePageEditor({ open, onOpenChange }: HomePageEditorProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Hero state
  const [heroVideoUrl, setHeroVideoUrl] = useState("");
  const [heroBlock, setHeroBlock] = useState<PageBlock | null>(null);
  const [videoUrlError, setVideoUrlError] = useState("");
  
  // Testimonials state
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [testimonialsBlock, setTestimonialsBlock] = useState<PageBlock | null>(null);
  
  // Trusted By state
  const [trustedByTitle, setTrustedByTitle] = useState("Trusted By");
  const [trustedByLogos, setTrustedByLogos] = useState<string[]>([]);
  const [trustedByBlock, setTrustedByBlock] = useState<PageBlock | null>(null);
  
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchData();
    }
  }, [open]);

  const fetchData = async () => {
    setIsLoading(true);
    
    const [heroResult, testimonialsResult, trustedByResult] = await Promise.all([
      pageBlockService.getByKey("home", "hero"),
      pageBlockService.getByKey("home", "testimonials"),
      pageBlockService.getByKey("home", "trusted_by"),
    ]);

    if (heroResult.data) {
      setHeroBlock(heroResult.data);
      const content = heroResult.data.content as HeroContent;
      setHeroVideoUrl(content.video_url || "");
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

  const handleVideoUrlChange = (url: string) => {
    setHeroVideoUrl(url);
    if (url && !isValidYouTubeUrl(url)) {
      setVideoUrlError("Please enter a valid YouTube URL");
    } else {
      setVideoUrlError("");
    }
  };

  const handleSave = async () => {
    if (heroVideoUrl && !isValidYouTubeUrl(heroVideoUrl)) {
      toast({ title: "Error", description: "Invalid YouTube URL", variant: "destructive" });
      return;
    }

    setIsSaving(true);

    try {
      // Save / create hero block
      if (heroBlock) {
        const existingContent = heroBlock.content as HeroContent;
        await pageBlockService.update(heroBlock.id, {
          content: { ...existingContent, video_url: heroVideoUrl.trim() || null },
        });
      } else {
        const { data: createdHero, error: createError } = await pageBlockService.create({
          page_key: "home",
          block_key: "hero",
          block_type: "hero",
          content: { video_url: heroVideoUrl.trim() || null } as unknown as Record<string, unknown>,
          display_order: 1,
          is_active: true,
        });
        if (createError) throw createError;
        setHeroBlock(createdHero);
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

      toast({ title: "Saved", description: "Home page content updated successfully." });
      onOpenChange(false);
    } catch {
      toast({ title: "Error", description: "Failed to save changes", variant: "destructive" });
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
      <DialogContent className="w-[95vw] max-w-3xl max-h-[90vh] flex flex-col p-0 gap-0">
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
              {/* Hero Video Section */}
              <div className="p-4 rounded-lg border border-primary/20 bg-primary/5">
                <h3 className="font-serif text-lg font-semibold mb-4 flex items-center gap-2">
                  <Video className="w-5 h-5 text-primary" />
                  Hero Video
                </h3>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="heroVideoUrl">YouTube Video URL</Label>
                    <Input
                      id="heroVideoUrl"
                      value={heroVideoUrl}
                      onChange={(e) => handleVideoUrlChange(e.target.value)}
                      placeholder="https://www.youtube.com/watch?v=VIDEO_ID or https://youtu.be/VIDEO_ID"
                      className={videoUrlError ? "border-destructive" : ""}
                    />
                    {videoUrlError && (
                      <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {videoUrlError}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      Leave empty to show only the background image. Video will appear on the right side of the hero section.
                    </p>
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
