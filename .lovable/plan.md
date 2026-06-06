## Problem

The public inquiry form fails on submit. Root cause: after inserting into `inquiry_submissions`, the client calls `.select().single()` to read back the row. RLS on that table only allows admins to SELECT, so for public visitors the insert succeeds but the returned row is filtered out, causing `single()` to throw and the whole submission to fail before the email is sent.

## Fix

1. **`src/services/inquiryService.ts`** — In `createSubmission`, remove `.select().single()`. Just insert and return `{ error }`. Public visitors don't need (and can't read) the new row.
2. **`src/components/suncrisp/InquiryForm.tsx`** — Stop relying on `submission?.id`. Call `sendEmail` without `submissionId` (the edge function already treats it as optional).

No DB/RLS/edge-function changes needed. Admin-only read of submissions stays intact.