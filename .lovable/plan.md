

## Plan: Update Phone Numbers to 9997268880 / 0891-2726888

Replace the old number `9559665556` with both new numbers across 4 files.

### Changes

**1. `src/pages/Index.tsx` (line 32)**
- `phone: "+91 9997268880 / 0891-2726888"`

**2. `src/components/suncrisp/Footer.tsx` (lines 80-86)**
- Show two separate phone links, one for each number:
  - `+91 9997268880` (href: `tel:+919997268880`)
  - `0891-2726888` (href: `tel:+910891272688`)

**3. `src/components/suncrisp/FloatingCTA.tsx` (line 26)**
- Default WhatsApp: `'+919997268880'`

**4. `src/components/admin/HomePageEditor.tsx` (line 644)**
- Placeholder: `"+919997268880"`

Both numbers will be visible wherever phone numbers are displayed. WhatsApp and `tel:` links will use the mobile number `9997268880` as the primary clickable action.

