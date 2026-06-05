## Plan: Customizable Inquiry Form for Portfolio Projects

Add an admin-configurable inquiry form to each Portfolio project's detail page. Submissions are saved to the database AND emailed to `suncrisphospitality@gmail.com`. The SunCrisp logo is displayed at the top of the form.

### 1. Database changes (migration)

**Extend `projects` table:**
- `inquiry_form_enabled` (boolean, default false)
- `inquiry_form_title` (text, nullable — e.g. "Enquire about this property")
- `inquiry_form_fields` (jsonb, default `[]`) — array of field definitions

Each field object:
```json
{ "id": "uuid", "label": "Check-in date", "type": "text|email|tel|number|date|textarea|select", "required": true, "placeholder": "", "options": ["..."] }
```

**New `inquiry_submissions` table:**
- `project_id` (uuid, references projects)
- `project_title` (text snapshot)
- `data` (jsonb — submitted field values)
- `submitter_name`, `submitter_email` (text, nullable — extracted for convenience)
- `email_status` (text: pending/sent/failed)
- `created_at`

RLS: admins can read/delete; anyone (anon + authenticated) can INSERT. GRANTs included.

### 2. Admin UI (`ProjectFormModal.tsx`)

New "Inquiry Form" section in the project edit modal:
- Toggle: Enable inquiry form
- Title input (defaults to "Enquire about this property")
- Field builder (orderable list):
  - Add field → choose type, label, required, placeholder, options (for select)
  - Edit / remove each field
- One-click "Load defaults" button: inserts preset fields (Name, Contact details, Check-in date, Check-out date, No. of guests, Message)

New admin tab "Inquiries" on the dashboard:
- List submissions, filter by project, view details, delete

### 3. Public form (`InquiryForm.tsx` on `PropertyDetail.tsx`)

When `inquiry_form_enabled` is true, render a styled card below the content:
- **SunCrisp logo at the top of the form** (centered)
- Configured form title
- Fields rendered dynamically based on admin config
- Submit button styled with brand primary

On submit:
1. Validate (zod, required fields, email/tel/date formats, length caps)
2. Insert into `inquiry_submissions`
3. Invoke edge function to email
4. Toast success / reset

### 4. Edge function `send-inquiry-email`

New function (verify_jwt=false, CORS, IP rate-limit mirroring `send-contact-email`). Receives `{ projectTitle, projectId, fields: [{label, value}] }`, renders HTML email with SunCrisp logo header + project title + label/value pairs, sends via existing Resend setup to `suncrisphospitality@gmail.com`. Updates `email_status` on the row.

### 5. Files touched

- `supabase/migrations/<new>.sql` (new)
- `supabase/functions/send-inquiry-email/index.ts` (new)
- `supabase/config.toml` (add `[functions.send-inquiry-email] verify_jwt = false`)
- `src/components/admin/ProjectFormModal.tsx` (add form builder section)
- `src/components/admin/InquiryFieldBuilder.tsx` (new)
- `src/components/admin/InquirySubmissionsList.tsx` (new)
- `src/pages/admin/Dashboard.tsx` (new "Inquiries" tab)
- `src/components/suncrisp/InquiryForm.tsx` (new, public form with logo header)
- `src/components/suncrisp/PropertyDetail.tsx` (render form when enabled)
- `src/services/projectService.ts` (include new columns)
- `src/services/inquiryService.ts` (new)
- `src/types/index.ts` (types for fields + submission)

### Notes
- Scope is **Portfolio (projects table)**. Hospitality items also live in `projects` (category="Hospitality") so they get this feature too via the same mechanism.
- Email uses the existing Resend setup from `send-contact-email`.
- Field types supported: text, email, tel, number, date, textarea, select.
- Logo source: existing SunCrisp logo asset already used in the navbar.
