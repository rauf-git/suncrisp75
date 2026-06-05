import { supabase } from "@/integrations/supabase/safeClient";

export type InquiryFieldType =
  | "text"
  | "email"
  | "tel"
  | "number"
  | "date"
  | "textarea"
  | "select";

export interface InquiryField {
  id: string;
  label: string;
  type: InquiryFieldType;
  required: boolean;
  placeholder?: string;
  options?: string[]; // for select
}

export interface InquirySubmission {
  id: string;
  project_id: string | null;
  project_title: string | null;
  submitter_name: string | null;
  submitter_email: string | null;
  data: Record<string, string>;
  email_status: string;
  created_at: string;
}

export const DEFAULT_INQUIRY_FIELDS: InquiryField[] = [
  { id: "name", label: "Name", type: "text", required: true, placeholder: "Your full name" },
  { id: "contact", label: "Contact details", type: "tel", required: true, placeholder: "Phone or email" },
  { id: "checkin", label: "Check-in date", type: "date", required: true },
  { id: "checkout", label: "Check-out date", type: "date", required: true },
  { id: "guests", label: "No. of guests", type: "number", required: true, placeholder: "e.g. 4" },
  { id: "message", label: "Message", type: "textarea", required: false, placeholder: "Anything else we should know?" },
];

export const inquiryService = {
  async createSubmission(input: {
    project_id: string | null;
    project_title: string;
    submitter_name?: string | null;
    submitter_email?: string | null;
    data: Record<string, string>;
  }) {
    const { data, error } = await supabase
      .from("inquiry_submissions")
      .insert({
        project_id: input.project_id,
        project_title: input.project_title.slice(0, 300),
        submitter_name: input.submitter_name?.slice(0, 200) ?? null,
        submitter_email: input.submitter_email?.slice(0, 255) ?? null,
        data: input.data,
        email_status: "pending",
      })
      .select()
      .single();
    return { data, error };
  },

  async sendEmail(payload: {
    submissionId?: string;
    projectId?: string;
    projectTitle: string;
    fields: { label: string; value: string }[];
  }) {
    return supabase.functions.invoke("send-inquiry-email", { body: payload });
  },

  async listAll() {
    const { data, error } = await supabase
      .from("inquiry_submissions")
      .select("*")
      .order("created_at", { ascending: false });
    return { data: data as InquirySubmission[] | null, error };
  },

  async delete(id: string) {
    return supabase.from("inquiry_submissions").delete().eq("id", id);
  },
};
