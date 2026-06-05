
-- Extend projects with inquiry form config
ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS inquiry_form_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS inquiry_form_title text,
  ADD COLUMN IF NOT EXISTS inquiry_form_fields jsonb NOT NULL DEFAULT '[]'::jsonb;

-- Submissions table
CREATE TABLE public.inquiry_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES public.projects(id) ON DELETE SET NULL,
  project_title text,
  submitter_name text,
  submitter_email text,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  email_status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.inquiry_submissions TO authenticated;
GRANT INSERT ON public.inquiry_submissions TO anon;
GRANT ALL ON public.inquiry_submissions TO service_role;

ALTER TABLE public.inquiry_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit inquiries"
  ON public.inquiry_submissions FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can view inquiries"
  ON public.inquiry_submissions FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update inquiries"
  ON public.inquiry_submissions FOR UPDATE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete inquiries"
  ON public.inquiry_submissions FOR DELETE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX inquiry_submissions_project_id_idx ON public.inquiry_submissions(project_id);
CREATE INDEX inquiry_submissions_created_at_idx ON public.inquiry_submissions(created_at DESC);
