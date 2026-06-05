import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import {
  InquiryField,
  InquiryFieldType,
  DEFAULT_INQUIRY_FIELDS,
} from "@/services/inquiryService";

interface Props {
  fields: InquiryField[];
  onChange: (fields: InquiryField[]) => void;
  disabled?: boolean;
}

const FIELD_TYPES: { value: InquiryFieldType; label: string }[] = [
  { value: "text", label: "Short text" },
  { value: "email", label: "Email" },
  { value: "tel", label: "Phone" },
  { value: "number", label: "Number" },
  { value: "date", label: "Date" },
  { value: "textarea", label: "Long text" },
  { value: "select", label: "Dropdown" },
];

const newId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `f-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export function InquiryFieldBuilder({ fields, onChange, disabled }: Props) {
  const update = (i: number, patch: Partial<InquiryField>) => {
    const next = [...fields];
    next[i] = { ...next[i], ...patch };
    onChange(next);
  };
  const remove = (i: number) => onChange(fields.filter((_, idx) => idx !== i));
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= fields.length) return;
    const next = [...fields];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };
  const add = () =>
    onChange([
      ...fields,
      { id: newId(), label: "New field", type: "text", required: false },
    ]);
  const loadDefaults = () =>
    onChange(DEFAULT_INQUIRY_FIELDS.map((f) => ({ ...f, id: newId() })));

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <Button type="button" size="sm" variant="outline" onClick={add} disabled={disabled}>
          <Plus className="w-4 h-4 mr-1" /> Add field
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={loadDefaults}
          disabled={disabled}
        >
          Load defaults
        </Button>
      </div>

      {fields.length === 0 ? (
        <p className="text-xs text-muted-foreground">
          No fields yet. Click "Load defaults" or "Add field".
        </p>
      ) : (
        <div className="space-y-3">
          {fields.map((f, i) => (
            <div
              key={f.id}
              className="border border-border rounded-lg p-3 space-y-3 bg-card"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-muted-foreground">Field {i + 1}</span>
                <div className="flex gap-1">
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    onClick={() => move(i, -1)}
                    disabled={disabled || i === 0}
                    className="h-7 w-7"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    onClick={() => move(i, 1)}
                    disabled={disabled || i === fields.length - 1}
                    className="h-7 w-7"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    onClick={() => remove(i)}
                    disabled={disabled}
                    className="h-7 w-7 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Label</Label>
                  <Input
                    value={f.label}
                    onChange={(e) => update(i, { label: e.target.value })}
                    disabled={disabled}
                    className="h-9 text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Type</Label>
                  <Select
                    value={f.type}
                    onValueChange={(v) =>
                      update(i, { type: v as InquiryFieldType })
                    }
                    disabled={disabled}
                  >
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FIELD_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
                <div className="space-y-1.5">
                  <Label className="text-xs">Placeholder</Label>
                  <Input
                    value={f.placeholder || ""}
                    onChange={(e) => update(i, { placeholder: e.target.value })}
                    disabled={disabled}
                    className="h-9 text-sm"
                  />
                </div>
                <div className="flex items-center gap-2 h-9">
                  <Switch
                    checked={f.required}
                    onCheckedChange={(c) => update(i, { required: c })}
                    disabled={disabled}
                  />
                  <Label className="text-xs">Required</Label>
                </div>
              </div>

              {f.type === "select" && (
                <div className="space-y-1.5">
                  <Label className="text-xs">
                    Options (comma separated)
                  </Label>
                  <Input
                    value={(f.options || []).join(", ")}
                    onChange={(e) =>
                      update(i, {
                        options: e.target.value
                          .split(",")
                          .map((s) => s.trim())
                          .filter(Boolean),
                      })
                    }
                    disabled={disabled}
                    placeholder="Option 1, Option 2"
                    className="h-9 text-sm"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
