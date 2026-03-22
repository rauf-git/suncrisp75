

## Plan: Add URL Routes for Individual Detail Pages

Currently, clicking a project/rental/construction item shows a detail view via component state (`selectedItem`). This plan adds proper URL routes so each item gets a shareable URL like `/portfolio/out-of-the-blue`.

### Approach

Generate URL slugs from item titles (e.g., "Out of the Blue" → `out-of-the-blue`). Use route params to load items by slug, fetching from the database by ID after matching.

### Changes

**1. Add a `slugify` utility**
- File: `src/lib/utils.ts`
- Add a simple `slugify(title: string)` function that converts titles to URL-safe slugs

**2. Create a new `ItemDetailPage.tsx` page component**
- File: `src/pages/ItemDetailPage.tsx`
- Accepts route params: `section` (portfolio/construction/rentals/hospitality) and `slug`
- On mount, fetches all items for that section, finds the one matching the slug
- Renders `PropertyDetail` with the found item
- Shows a loading state while fetching, and a 404 if not found

**3. Add routes in `App.tsx`**
- Add parameterized routes:
  - `/portfolio/:slug` → `ItemDetailPage` with section="portfolio"
  - `/construction/:slug` → `ItemDetailPage` with section="construction"
  - `/rentals/:slug` → `ItemDetailPage` with section="rentals"
  - `/hospitality/:slug` → `ItemDetailPage` with section="hospitality"

**4. Update `Index.tsx` — navigate to detail URL instead of setting state**
- In `handleItemClick`, instead of `setSelectedItem(item)`, navigate to `/${section}/${slugify(item.title)}`
- Remove `selectedItem` state and the detail rendering logic from Index
- Remove `handleBack` and `selectedSection` state

**5. Update `PropertyDetail.tsx` — use router for back navigation**
- Change `onBack` to use `navigate(-1)` or navigate to the parent section route

**6. Update link components**
- In `FeaturedProjects.tsx`, `Properties.tsx`, `RentalsByLocation.tsx` — ensure item clicks navigate to the new URL routes

### Technical Details

- Slug generation: `title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')`
- Item lookup: fetch all items for the section, then match by comparing `slugify(item.title) === slug`
- No database migration needed — slugs are derived from titles at runtime
- The Navbar and Footer remain unchanged

