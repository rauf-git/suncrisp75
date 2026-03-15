

## Plan: Convert Query-Parameter Navigation to Proper Routes

Currently, all pages (portfolio, construction, rentals, hospitality, contact) are rendered inside `Index.tsx` using `?page=portfolio` query params. This plan converts them to proper routes like `/portfolio`, `/construction`, etc.

### Changes Overview

**1. Update `src/App.tsx` — Add dedicated routes**
- Add routes: `/portfolio`, `/construction`, `/rentals`, `/hospitality`, `/contact`
- Keep `/` for home, `/about-us`, `/our-brand-story` as they are
- Each route renders `Index` with a `page` prop (reusing existing component logic)

**2. Refactor `src/pages/Index.tsx`**
- Accept a `page` prop instead of reading from `searchParams`
- Remove `useSearchParams` usage
- Update `handleNavigation` to use `navigate()` with real paths instead of query params
- Map page names to routes: `home → /`, `portfolio → /portfolio`, etc.

**3. Update `src/components/suncrisp/Navbar.tsx`**
- Change `handleNavClick` to use `navigate()` with real paths for all links (not just `about-us`)
- Remove the `onNavigate` callback pattern — navigate directly via router

**4. Update `src/components/suncrisp/Footer.tsx`**
- Same change: use `navigate()` with real paths instead of `onNavigate` callback

**5. Update `src/components/suncrisp/Hero.tsx`**
- Update any `onNavigate` calls to use real paths

**6. Update `public/_redirects` and `vercel.json`**
- Already configured for SPA routing, so no changes needed

### Route Mapping
| Current | New Route |
|---------|-----------|
| `/?page=` or `/` | `/` |
| `/?page=portfolio` | `/portfolio` |
| `/?page=construction` | `/construction` |
| `/?page=rentals` | `/rentals` |
| `/?page=hospitality` | `/hospitality` |
| `/?page=contact` | `/contact` |
| `/about-us` | `/about-us` (unchanged) |
| `/our-brand-story` | `/our-brand-story` (unchanged) |

### Key Detail
- `Index.tsx` will still handle rendering all these pages but receive the page via prop from the router
- The `Navbar` and `Footer` will use `useNavigate()` directly instead of an `onNavigate` callback
- Property detail views will use URL state (e.g., `/portfolio` with local component state for selected item)

