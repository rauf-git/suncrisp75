import { useState } from "react";
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
import { Edit, Save, X, Calendar, Image as ImageIcon } from "lucide-react";
import { format } from "date-fns";

interface ViewDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: Record<string, unknown> | null;
  type: "project" | "construction" | "rental" | "hospitality";
  onSave: (updates: Record<string, unknown>) => Promise<void>;
  fields: Array<{
    key: string;
    label: string;
    type: "text" | "textarea" | "number";
  }>;
}

export function ViewDetailModal({
  open,
  onOpenChange,
  item,
  type,
  onSave,
  fields,
}: ViewDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedValues, setEditedValues] = useState<Record<string, unknown>>({});
  const [isSaving, setIsSaving] = useState(false);

  if (!item) return null;

  const getImageUrl = (): string | null => {
    if (type === "project") return (item.image_url as string) || null;
    return (item.thumbnail_url as string) || null;
  };

  const getGalleryImages = (): string[] => {
    return (item.images as string[]) || [];
  };

  const handleSave = async () => {
    if (Object.keys(editedValues).length === 0) {
      setIsEditing(false);
      return;
    }
    setIsSaving(true);
    try {
      await onSave(editedValues);
      setIsEditing(false);
      setEditedValues({});
    } finally {
      setIsSaving(false);
    }
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
  const galleryImages = getGalleryImages();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b border-border bg-muted/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                {typeLabels[type]}
              </p>
              <DialogTitle className="font-serif text-xl">
                {String(item.title || "Untitled")}
              </DialogTitle>
            </div>
            <div className="flex items-center gap-2">
              {isEditing ? (
                <>
                  <Button variant="outline" size="sm" onClick={() => { setIsEditing(false); setEditedValues({}); }} disabled={isSaving}>
                    <X className="w-4 h-4 mr-1" />
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleSave} disabled={isSaving}>
                    <Save className="w-4 h-4 mr-1" />
                    {isSaving ? "Saving..." : "Save"}
                  </Button>
                </>
              ) : (
                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-80px)]">
          <div className="p-6 space-y-6">
            {mainImage && (
              <div className="aspect-video relative rounded-xl overflow-hidden bg-muted">
                <img src={mainImage} alt={String(item.title || "")} className="w-full h-full object-cover" />
              </div>
            )}

            {galleryImages.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Gallery</h4>
                <div className="grid grid-cols-4 gap-3">
                  {galleryImages.map((img, idx) => (
                    <div key={idx} className="aspect-square rounded-lg overflow-hidden bg-muted">
                      <img src={img} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {fields.map((field) => {
                const value = getValue(field.key);
                return (
                  <div key={field.key} className={field.type === "textarea" ? "md:col-span-2" : ""}>
                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{field.label}</Label>
                    {isEditing ? (
                      field.type === "textarea" ? (
                        <Textarea value={String(value || "")} onChange={(e) => setEditedValues(prev => ({ ...prev, [field.key]: e.target.value }))} className="mt-2" rows={4} />
                      ) : field.type === "number" ? (
                        <Input type="number" value={String(value || "")} onChange={(e) => setEditedValues(prev => ({ ...prev, [field.key]: Number(e.target.value) }))} className="mt-2" />
                      ) : (
                        <Input value={String(value || "")} onChange={(e) => setEditedValues(prev => ({ ...prev, [field.key]: e.target.value }))} className="mt-2" />
                      )
                    ) : (
                      <p className="mt-2 text-foreground whitespace-pre-wrap">{value ? String(value) : <span className="text-muted-foreground italic">Not set</span>}</p>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="pt-4 border-t border-border flex items-center gap-6 text-sm text-muted-foreground">
              {item.created_at && (
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  <span>Created {format(new Date(String(item.created_at)), "MMM d, yyyy")}</span>
                </div>
              )}
              {galleryImages.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4" />
                  <span>{galleryImages.length} images</span>
                </div>
              )}
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
