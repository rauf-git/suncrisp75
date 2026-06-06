import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { inquiryService, InquiryField } from "@/services/inquiryService";
import suncrespLogo from "@/assets/suncrisp-logo-orange.png";

interface Props {
  projectId: string;
  projectTitle: string;
  title?: string | null;
  fields: InquiryField[];
}

const guessNameKey = (fields: InquiryField[]) =>
  fields.find((f) => /name/i.test(f.label))?.id;
const guessEmailKey = (fields: InquiryField[]) =>
  fields.find((f) => f.type === "email" || /email/i.test(f.label))?.id;

const InquiryForm = ({ projectId, projectTitle, title, fields }: Props) => {
  const { toast } = useToast();
  const [values, setValues] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  if (!fields || fields.length === 0) return null;

  const set = (id: string, v: string) =>
    setValues((p) => ({ ...p, [id]: v }));

  const validate = (): string | null => {
    for (const f of fields) {
      const v = (values[f.id] || "").trim();
      if (f.required && !v) return `${f.label} is required`;
      if (v && f.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v))
        return `${f.label} must be a valid email`;
      if (v.length > 5000) return `${f.label} is too long`;
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate();
    if (err) {
      toast({ title: "Please check the form", description: err, variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const nameKey = guessNameKey(fields);
      const emailKey = guessEmailKey(fields);

      const { error: subErr } = await inquiryService.createSubmission({
        project_id: projectId,
        project_title: projectTitle,
        submitter_name: nameKey ? values[nameKey] || null : null,
        submitter_email: emailKey ? values[emailKey] || null : null,
        data: values,
      });

      if (subErr) throw subErr;

      const labeledFields = fields.map((f) => ({
        label: f.label,
        value: values[f.id] || "",
      }));

      await inquiryService.sendEmail({
        projectId,
        projectTitle,
        fields: labeledFields,
      });

      toast({
        title: "Inquiry sent",
        description: "Thank you — we'll get back to you shortly.",
      });
      setValues({});
    } catch (e) {
      console.error("Inquiry submit failed", e);
      toast({
        title: "Submission failed",
        description: "Please try again or contact us directly.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-card border border-border rounded-2xl shadow-elevated p-6 sm:p-10">
      <div className="flex flex-col items-center text-center mb-6 sm:mb-8">
        <img
          src={suncrespLogo}
          alt="SunCrisp Hospitality"
          className="h-14 sm:h-16 w-auto mb-4"
        />
        <h3 className="font-serif text-xl sm:text-2xl md:text-3xl text-foreground">
          {title || "Enquire about this property"}
        </h3>
        <p className="text-xs sm:text-sm text-muted-foreground mt-2">
          {projectTitle}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
        {fields.map((f) => {
          const v = values[f.id] || "";
          const common = {
            id: `inq-${f.id}`,
            value: v,
            placeholder: f.placeholder,
            disabled: submitting,
          };
          return (
            <div key={f.id} className="space-y-1.5">
              <Label htmlFor={`inq-${f.id}`} className="text-sm">
                {f.label}
                {f.required && <span className="text-primary ml-1">*</span>}
              </Label>
              {f.type === "textarea" ? (
                <Textarea
                  {...common}
                  onChange={(e) => set(f.id, e.target.value)}
                  rows={4}
                />
              ) : f.type === "select" ? (
                <Select
                  value={v}
                  onValueChange={(val) => set(f.id, val)}
                  disabled={submitting}
                >
                  <SelectTrigger id={`inq-${f.id}`}>
                    <SelectValue placeholder={f.placeholder || "Select..."} />
                  </SelectTrigger>
                  <SelectContent>
                    {(f.options || []).map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  {...common}
                  type={f.type}
                  onChange={(e) => set(f.id, e.target.value)}
                />
              )}
            </div>
          );
        })}

        <Button
          type="submit"
          disabled={submitting}
          className="w-full bg-primary hover:bg-primary/90 min-h-[48px] text-base"
        >
          {submitting ? "Sending..." : "Send inquiry"}
        </Button>
      </form>
    </div>
  );
};

export default InquiryForm;
