import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { pageBlockService, PageBlock } from "@/services/pageBlockService";
import { Loader2, Plus, Trash2 } from "lucide-react";

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

export function HomePageEditor({ open, onOpenChange }: HomePageEditorProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [trustedByTitle, setTrustedByTitle] = useState("Trusted By");
  const [trustedByLogos, setTrustedByLogos] = useState<string[]>([]);
  const [testimonialsBlock, setTestimonialsBlock] = useState<PageBlock | null>(null);
  const [trustedByBlock, setTrustedByBlock] = useState<PageBlock | null>(null);
  
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchData();
    }
  }, [open]);

  const fetchData = async () => {
    setIsLoading(true);
    
    const [testimonialsResult, trustedByResult] = await Promise.all([
      pageBlockService.getByKey("home", "testimonials"),
      pageBlockService.getByKey("home", "trusted_by"),
    ]);

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

  const handleSave = async () => {
    setIsSaving(true);

    try {
      if (testimonialsBlock) {
        await pageBlockService.update(testimonialsBlock.id, {
          content: { items: testimonials }
        });
      }

      if (trustedByBlock) {
        await pageBlockService.update(trustedByBlock.id, {
          content: { title: trustedByTitle, logos: trustedByLogos }
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
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">Edit Home Page</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-8">
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
                          className="text-destructive hover:text-destructive"
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

            {/* Save Button */}
            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isSaving} className="bg-primary">
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}