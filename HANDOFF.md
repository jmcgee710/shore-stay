# Shore Stay — Developer Handoff

> Last updated: 2026-05-15. Start here for any new session.

---

## What This Is

Shore Stay is a three-sided vacation rental PWA for Long Beach Island, NJ:
- **Side A** — Public listing browser (VRLBI competitor at `/browse`)
- **Side B** — Owner dashboard (`/homeowner`)
- **Side C** — Guest companion app (`/stay/:token`)

Plus a unified team dashboard for watchers + property managers (`/team`).

---

## How to Run

```bash
# Double-click this — starts both servers and opens browser:
C:\Users\Johnny\OneDrive\Desktop\shore-stay\start.bat

# Or manually:
cd backend  → npm run dev    (port 5000)
cd frontend → npm run dev    (port 5173, may shift to 4176 if ports taken)
```

**Seed demo data:**
```
POST http://localhost:5000/api/dev/seed
```

**Demo logins:**
| Role | Email | Password |
|------|-------|----------|
| Owner | sarah@calabrese.co | demo1234 |
| Watcher | ray.mitchell@shorestay.dev | watcher123 |
| Watcher | diane.pulaski@shorestay.dev | watcher123 |

**Guest link:** `http://localhost:5173/stay/tk-9f3a-22c1` — Trip Planner PIN: `1234`

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 19, Vite 5, TypeScript, Tailwind CSS, Framer Motion |
| Backend | Node.js, Express, Prisma 5.22, TypeScript |
| Database | **Supabase Postgres** (migrated from Neon) |
| Fonts | Fraunces (serif), Inter Tight (UI), Caveat (script accent) |

**Supabase connection** (`backend/.env`):
```
DATABASE_URL=postgresql://postgres:Shore69Stay420%24%24@db.yvcxrmbxvvplrjvbxeho.supabase.co:5432/postgres
DIRECT_URL=postgresql://postgres:Shore69Stay420%24%24@db.yvcxrmbxvvplrjvbxeho.supabase.co:5432/postgres
```

---

## Design System

Defined in `frontend/tailwind.config.js` and `frontend/src/index.css`.

| Token | Value | Use |
|-------|-------|-----|
| `ocean-deep` / `#0a3457` | Headers, sidebars, CTAs |
| `ocean` / `#0f4c75` | Primary brand colour |
| `seafoam` / `#56cfe1` | Accent, badges, active states |
| `cream` / `#fbf7ee` | Page + card backgrounds |
| `muted` / `#5b6b7a` | Secondary text |
| `line` / `rgba(15,76,117,0.12)` | Borders, dividers |
| `coral` / `oklch(0.74 0.13 38)` | Alerts, warnings |
| `green` / `#5a8a5e` | Success states |

**Typography:**
- Display: Fraunces, `letter-spacing: -0.03em`, `line-height: 1.02`
- Eyebrows: 11px, uppercase, `letter-spacing: 0.18em`
- Body: Inter Tight, 14–15px, `line-height: 1.55`

**Key CSS utilities:** `.glass-card`, `.glass-nav`, `.pill-btn-primary`, `.pill-btn-ghost`, `.section-label`

**Diagonal stripe pattern (property thumbnails):**
```css
background: repeating-linear-gradient(${deg}deg, #a8e3ec 0 6px, #f7e6c9 6px 12px);
```

**Logo:** `frontend/public/logo.png` (circular wave emblem, used in nav + dashboard sidebar)

---

## What's Built — Complete

### Landing page (`/`)
All 7 sections: Hero → Features → Roles (tabbed w/ UI peeks) → Showcase (QR fridge) → Testimonial → Pricing → Footer

### Side A — Public listing browser
- `/browse` — `SearchResultsPage` (filter sidebar + card grid)
- `/properties/:id` — `PropertyPage` (photo header, Fraunces title, availability calendar, contact form)
- `/lbi/:town` — `TownshipPage` (7 LBI towns)
- Components: `PropertyCard`, `SearchBar`, `FilterPanel`, `AvailabilityCalendar`

### Side B — Owner dashboard
- `/homeowner` — `Dashboard` (KPI strip, stripe thumbnail property rows)
- `/homeowner/properties/:id` — `PropertyDetail` with 10 tabs:
  `HouseInfo` · `Bookings` (FakeQR modal) · `Rooms` · `Appliances` · `Maintenance` · `Guide` · `OwnerPicks` · `Watchers` · `OwnerHub` · `Settings`

### Side C — Guest companion
- `/stay/:token` — `RenterHub` (photo header, Fraunces name, wave divider)
- Tabs: Rules · Info (WiFi tap-to-reveal) · Rooms (stripe thumbnails) · Plan (day-by-day itinerary) · Guide
- Live tides (NOAA station 8534720) + weather (Open-Meteo) via `WeatherTidesWidget`

### Auth pages
- `/login` — Split layout: ocean panel (logo + headline + Sarah quote) + form with demo credentials
- `/register` — Split layout: ocean panel (pricing tiers) + form

### Team dashboard (unified Watcher + PM)
- `/team` → `TeamDashboard` — works for both `HOME_WATCHER` and `PROPERTY_MANAGER` roles
- `/team/properties/:id` → `TeamPropertyView` — Submit Report + Log Alert + Dispatch
- `/watcher` and `/manager` both redirect to `/team`
- Backend: `/api/team/my-properties`, `/api/team/properties/:id/reports|alerts`, `/api/team/alerts/:id/dispatch`

---

## API Routes (key ones)

```
Public:
  GET  /api/public/listings          search with town/beds/pets/beachSide/dates
  GET  /api/public/listings/:id      full listing detail
  GET  /api/public/towns             town listing counts

Owner (HOMEOWNER role):
  GET/POST  /api/homeowner/properties
  PUT       /api/homeowner/properties/:id    (incl. town, bedrooms, isPublished, amenities, etc.)
  POST      /api/homeowner/properties/:id/bookings
  POST      /api/homeowner/properties/:id/picks
  POST      /api/watcher/properties/:id/invite   (generate watcher invite link)

Team (HOME_WATCHER | PROPERTY_MANAGER):
  GET   /api/team/my-properties
  POST  /api/team/properties/:id/reports
  POST  /api/team/properties/:id/alerts
  POST  /api/team/alerts/:alertId/dispatch

Dev only:
  POST  /api/dev/seed   (creates Sarah Calabrese + 3 LBI properties + watchers)
```

---

## Database Schema (Supabase Postgres)

Key models: `User`, `Property`, `PropertyPhoto`, `OwnersPick`, `Booking`, `TripPlanner`, `GroupEvent`, `Room`, `Appliance`, `MaintenanceTask`, `LocalGuideItem`, `WatcherAssignment`, `WatchReport`, `StormAlert`, `ContractorDispatch`, `ComplianceDocument`, `ComplianceState`, `PropertyManagerAccess`

New fields on `Property` (added this session):
`town`, `bedrooms`, `bathrooms`, `petFriendly`, `beachSide`, `amenities` (String[]), `isPublished`, `nightlyRate`, `coverPhotoUrl`, `ownerPhone`, `ownerEmail`

---

## Demo Data (from `/api/dev/seed`)

Owner: **Sarah Calabrese** (sarah@calabrese.co / demo1234)

| Property | Town | Beds | Side | Rate |
|----------|------|------|------|------|
| The Salt Box | Beach Haven | 4 | Ocean | $689/night |
| Dune Lullaby | Surf City | 3 | Bay | $459/night |
| Northeasterly | Loveladies | 5 | Ocean | $1,120/night |

Watchers: Ray Mitchell (Salt Box + Dune Lullaby, hands-off ON), Diane Pulaski (Northeasterly)

---

## What's Left to Build (Priority Order)

1. **Stripe billing** — Sandy $179 / Coastal $369 / Island $749 annual tiers. No Stripe code exists yet. Need: `stripe` npm package, `POST /api/billing/checkout` endpoint, webhook handler, `stripeCustomerId` + `tier` on `User` model.

2. **Supabase Auth migration** — Replace custom JWT (bcrypt + jsonwebtoken in `backend/src/routes/auth.ts`) with Supabase Auth. DB is already Supabase; just the auth layer remains.

3. **Photo uploads** — Real uploads via Supabase Storage. All photo fields currently accept URL strings only (`coverPhotoUrl`, `PropertyPhoto.url`). Need storage bucket + signed upload URLs.

4. **Map view** — Toggle grid/map on `/browse`. `latitude`/`longitude` already stored on every property.

5. **PM management features** — Property Managers hit `/team` but can't yet manage bookings or listing settings for their assigned properties (those routes are `HOMEOWNER`-only). Needs backend route updates.

---

## Dead Code (safe to delete)
- `frontend/src/features/watcher/WatcherDashboard.tsx` — superseded by TeamDashboard
- `frontend/src/features/watcher/WatcherPropertyView.tsx` — superseded by TeamPropertyView

## Do NOT build
- Smart alerts (tide/weather push notifications to guests) — deliberately cut
