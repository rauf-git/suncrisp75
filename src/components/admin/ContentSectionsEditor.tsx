import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, GripVertical, Upload, Image as ImageIcon, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/safeClient";
import { validateFile } from "@/lib/validation";
import { toast } from "sonner";

export interface ContentSection {
  heading: string;
  content: string;
  image?: string;
}

interface ContentSectionsEditorProps {
  sections: ContentSection[];
  onChange: (sections: ContentSection[]) => void;
  title?: string;
  pageKey?: string;
}

export function ContentSectionsEditor({ 
  sections, 
  onChange, 
  title = "Content Sections",
  pageKey = "general"
}: ContentSectionsEditorProps) {
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const fileInputRefs = useRef<Map<number, HTMLInputElement>>(new Map());

  const addSection = () => {
    onChange([...sections, { heading: "", content: "", image: undefined }]);
  };

  const updateSection = (index: number, field: keyof ContentSection, value: string | undefined) => {
    const updated = [...sections];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const removeSection = (index: number) => {
    onChange(sections.filter((_, i) => i !== index));
  };

  const moveSection = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= sections.length) return;
    const updated = [...sections];
    const [removed] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, removed);
    onChange(updated);
  };

  const handleImageUpload = async (index: number, file: File) => {
    const fileValidation = validateFile(file);
    if (!fileValidation.valid) {
      toast.error(fileValidation.error);
      return;
    }

    setUploadingIndex(index);
    try {
      const fileExt = file.name.split(".").pop()?.toLowerCase();
      const filePath = `pages/${pageKey}/sections/${crypto.randomUUID()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("content-images")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("content-images")
        .getPublicUrl(filePath);

      updateSection(index, "image", urlData.publicUrl);
      toast.success("Image uploaded successfully");
    } catch {
      toast.error("Failed to upload image");
    } finally {
      setUploadingIndex(null);
    }
  };

  const handleRemoveImage = (index: number) => {
    updateSection(index, "image", undefined);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">{title}</h4>
        <Button variant="outline" size="sm" onClick={addSection}>
          <Plus className="w-4 h-4 mr-1" />
          Add Section
        </Button>
      </div>

      {sections.length === 0 ? (
        <div className="text-center py-8 border-2 border-dashed border-muted-foreground/20 rounded-lg">
          <p className="text-muted-foreground text-sm">No content sections yet</p>
          <Button variant="link" size="sm" onClick={addSection} className="mt-2">
            Add your first section
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {sections.map((section, index) => (
            <div 
              key={index} 
              className="border border-border rounded-lg p-4 space-y-3 bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GripVertical className="w-4 h-4 text-muted-foreground cursor-move" />
                  <span className="text-sm font-medium text-muted-foreground">
                    Section {index + 1}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => moveSection(index, index - 1)}
                    disabled={index === 0}
                    className="h-8 w-8"
                  >
                    ↑
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => moveSection(index, index + 1)}
                    disabled={index === sections.length - 1}
                    className="h-8 w-8"
                  >
                    ↓
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeSection(index)}
                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div>
                <Label className="text-xs">Section Heading</Label>
                <Input
                  value={section.heading}
                  onChange={(e) => updateSection(index, "heading", e.target.value)}
                  placeholder="Enter section heading..."
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-xs">Content</Label>
                <Textarea
                  value={section.content}
                  onChange={(e) => updateSection(index, "content", e.target.value)}
                  placeholder="Enter section content..."
                  rows={4}
                  className="mt-1 resize-none"
                />
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}