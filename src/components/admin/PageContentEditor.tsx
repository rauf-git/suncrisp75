import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { pageContentService, ContentSection } from "@/services/pageContentService";
import { ContentSectionsEditor } from "./ContentSectionsEditor";
import { Loader2 } from "lucide-react";

interface PageContentEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pageKey: string;
  pageTitle: string;
}

export function PageContentEditor({ 
  open, 
  onOpenChange, 
  pageKey,
  pageTitle 
}: PageContentEditorProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [heroImage, setHeroImage] = useState("");
  const [contentSections, setContentSections] = useState<ContentSection[]>([]);
  
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchData();
    }
  }, [open, pageKey]);

  const fetchData = async () => {
    setIsLoading(true);
    
    const { data, error } = await pageContentService.getByKey(pageKey);
    
    if (error) {
      toast({ title: "Error", description: "Failed to load page content", variant: "destructive" });
    } else if (data) {
      setTitle(data.title || "");
      setSubtitle(data.subtitle || "");
      setHeroImage(data.hero_image || "");
      setContentSections(data.content_sections || []);
    } else {
      // No data exists, start with empty
      setTitle("");
      setSubtitle("");
      setHeroImage("");
      setContentSections([]);
    }

    setIsLoading(false);
  };

  const handleSave = async () => {
    setIsSaving(true);

    try {
      const { error } = await pageContentService.upsert(pageKey, {
        title: title || null,
        subtitle: subtitle || null,
        hero_image: heroImage || null,
        content_sections: contentSections,
      });

      if (error) throw error;

      toast({ title: "Saved", description: `${pageTitle} content updated successfully.` });
      onOpenChange(false);
    } catch {
      toast({ title: "Error", description: "Failed to save changes", variant: "destructive" });
    }

    setIsSaving(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 py-4 border-b border-border shrink-0">
          <DialogTitle className="font-serif text-2xl">Edit {pageTitle}</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-10 flex-1">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <ScrollArea className="flex-1 px-6">
            <div className="space-y-6 py-6">
              {/* Page Title & Subtitle */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="pageTitle">Page Title</Label>
                  <Input
                    id="pageTitle"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter page title..."
                  />
                </div>
                <div>
                  <Label htmlFor="subtitle">Subtitle</Label>
                  <Input
                    id="subtitle"
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    placeholder="Enter subtitle..."
                  />
                </div>
              </div>

              {/* Hero Image */}
              <div>
                <Label htmlFor="heroImage">Hero Image URL (Optional)</Label>
                <Input
                  id="heroImage"
                  value={heroImage}
                  onChange={(e) => setHeroImage(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                />
                {heroImage && (
                  <div className="mt-2 aspect-video w-full max-w-sm rounded-lg overflow-hidden border border-border">
                    <img 
                      src={heroImage} 
                      alt="Hero preview" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder.svg';
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Dynamic Content Sections */}
              <ContentSectionsEditor
                sections={contentSections}
                onChange={setContentSections}
              />
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
