import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { pageContentService, ContentSection } from "@/services/pageContentService";
import { ContentSectionsEditor } from "./ContentSectionsEditor";
import { Loader2, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { validateFile } from "@/lib/validation";

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
  const [isUploadingHero, setIsUploadingHero] = useState(false);

  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [heroImage, setHeroImage] = useState("");
  const [contentSections, setContentSections] = useState<ContentSection[]>([]);

  const heroFileInputRef = useRef<HTMLInputElement>(null);

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

      // Notify pages currently open to refetch content
      window.dispatchEvent(
        new CustomEvent("page-content-updated", {
          detail: { page_key: pageKey },
        })
      );

      toast({ title: "Saved", description: `${pageTitle} content updated successfully.` });
      onOpenChange(false);
    } catch {
      toast({ title: "Error", description: "Failed to save changes", variant: "destructive" });
    }

    setIsSaving(false);
  };

  const handleUploadHeroImage = async (file: File) => {
    const fileValidation = validateFile(file);
    if (!fileValidation.valid) {
      toast({ title: "Invalid file", description: fileValidation.error, variant: "destructive" });
      return;
    }

    setIsUploadingHero(true);
    try {
      const fileExt = file.name.split(".").pop()?.toLowerCase();
      const filePath = `pages/${pageKey}/${crypto.randomUUID()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("content-images")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("content-images")
        .getPublicUrl(filePath);

      setHeroImage(urlData.publicUrl);
      toast({ title: "Uploaded", description: "Hero image uploaded." });
    } catch {
      toast({ title: "Error", description: "Failed to upload hero image", variant: "destructive" });
    } finally {
      setIsUploadingHero(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-[90vw] md:max-w-2xl lg:max-w-3xl h-[90vh] max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-4 sm:px-6 py-3 sm:py-4 border-b border-border shrink-0">
          <DialogTitle className="font-serif text-lg sm:text-xl md:text-2xl">Edit {pageTitle}</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-10 flex-1">
            <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin text-primary" />
          </div>
        ) : (
          <ScrollArea className="flex-1 min-h-0 pr-4">
            <div className="px-4 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-5 md:space-y-6">
              {/* Page Title & Subtitle */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-2">
                  <Label htmlFor="pageTitle" className="text-xs sm:text-sm font-medium">Page Title</Label>
                  <Input
                    id="pageTitle"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter page title..."
                    className="text-sm sm:text-base h-10 sm:h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subtitle" className="text-xs sm:text-sm font-medium">Subtitle</Label>
                  <Input
                    id="subtitle"
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    placeholder="Enter subtitle..."
                    className="text-sm sm:text-base h-10 sm:h-11"
                  />
                </div>
              </div>

              {/* Hero Image */}
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <Label htmlFor="heroImage" className="text-xs sm:text-sm font-medium">Hero Image (Optional)</Label>
                  <div className="flex items-center gap-2">
                    <input
                      ref={heroFileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleUploadHeroImage(file);
                        if (heroFileInputRef.current) heroFileInputRef.current.value = "";
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => heroFileInputRef.current?.click()}
                      disabled={isUploadingHero}
                      className="h-9 sm:h-10 px-3 sm:px-4 text-sm"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {isUploadingHero ? "Uploading..." : "Upload"}
                    </Button>
                  </div>
                </div>

                <Input
                  id="heroImage"
                  value={heroImage}
                  onChange={(e) => setHeroImage(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="text-sm sm:text-base h-10 sm:h-11"
                />

                {heroImage && (
                  <div className="mt-2 aspect-[4/3] sm:aspect-video w-full max-w-sm rounded-lg overflow-hidden border border-border">
                    <img
                      src={heroImage}
                      alt={`${pageTitle} hero image preview`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/placeholder.svg";
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Dynamic Content Sections */}
              <ContentSectionsEditor sections={contentSections} onChange={setContentSections} pageKey={pageKey} />
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