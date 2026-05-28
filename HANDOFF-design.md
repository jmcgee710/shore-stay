# Shore Stay — Design Handoff (Visual Prototype)

> Written for a fresh designer or new Claude session picking up where this one left off. All file paths are exact.

---

## 1. What This Project Is

A high-fidelity **HTML/React prototype** for Shore Stay — a short-term vacation rental platform with a coastal/beach-house aesthetic, focused exclusively on **Long Beach Island, NJ** (no OBX). This is the visual/UX layer; the production codebase (Neon + Prisma + Express, see prior `HANDOFF.md`) is a separate concern.

The prototype lives at the project root and runs by opening any of the three top-level HTML files directly in a browser — no build step.

### Scope of this prototype
- Marketing landing page for Shore Stay itself
- Renter Hub (guest-facing QR-scan experience) — mobile + desktop variants
- Homeowner Dashboard (full sidebar + 9-tab portal)

---

## 2. File Map

```
/
├── Shore Stay Landing.html             # Marketing site
├── Shore Stay Renter Hub.html          # Guest-facing hub (mobile + desktop synced)
├── Shore Stay Homeowner Dashboard.html # Owner portal (browser-framed)
├── tweaks-panel.jsx                    # Starter — Tweaks panel scaffold
├── assets/
│   └── logo.png                        # Circular wave emblem
├── landing/
│   ├── icons.jsx                       # Stroke icon set (window.Icon)
│   ├── wordmark.jsx                    # 3 lockups: serif / script / sans
│   ├── hero.jsx                        # Hero with wave SVG + card overlays
│   ├── features.jsx                    # 6-card capability grid
│   ├── roles.jsx                       # Tabs for Owners / Watchers / Guests + UI peeks
│   ├── showcase.jsx                    # How-it-works + QR-on-fridge illustration
│   ├── testimonial.jsx                 # Quote card
│   ├── pricing.jsx                     # 3-tier pricing
│   ├── footer.jsx                      # Final CTA + footer
│   └── app.jsx                         # Composes sections + Tweaks
├── renter/
│   ├── browser-window.jsx              # ChromeWindow component (also used by dashboard)
│   ├── data.jsx                        # Property, rooms, rules, guide, planner state
│   ├── mobile.jsx                      # iPhone-framed renter hub
│   ├── desktop.jsx                     # Desktop browser-framed variant
│   ├── tabs.jsx                        # Rules / Info / Rooms / Plan / Guide content
│   ├── pin-modal.jsx                   # Trip Planner PIN auth (1234)
│   └── app.jsx                         # State + side-by-side layout
└── owner/
    ├── data.jsx                        # OWNER, PROPERTIES, BOOKINGS, WATCHERS, COMPLIANCE_ITEMS, TAX_QUARTERS, DOCUMENTS
    ├── shell.jsx                       # Sidebar, TopBar (property switcher), PageHeader, TABS
    ├── tab-overview.jsx                # KPI strip + property list + activity + compliance snapshot
    ├── tab-bookings.jsx                # Calendar grid + booking list + QR generator modal
    ├── tab-watchers.jsx                # Watcher list + reports feed + dispatch + invite modal
    ├── tab-ownerhub.jsx                # Compliance checklist + tax calendar + document vault
    ├── tab-stubs.jsx                   # Rooms / Appliances / Maintenance / Guide / Settings
    └── app.jsx                         # ChromeWindow shell + tab routing via #hash
```

---

## 3. Design System

### Colors (CSS variables)
| Token            | Value                     | Use                                     |
|------------------|---------------------------|-----------------------------------------|
| `--ocean`        | `#0f4c75`                 | Primary — links, accents                |
| `--ocean-deep`   | `#0a3457`                 | Headers, dark sections, primary CTA     |
| `--wave`         | `#1565a0`                 | Secondary ocean shade                   |
| `--seafoam`      | `#56cfe1`                 | Accent — badges, highlights             |
| `--seafoam-soft` | `#a8e3ec`                 | Patterned backgrounds                   |
| `--sand`         | `#fef3e2`                 | Warm soft background                    |
| `--sand-warm`    | `#f7e6c9`                 | Card patterns, tape, status pills       |
| `--cream`        | `#fbf7ee`                 | Card surface, body bg on light          |
| `--bg`           | `#fbf7ee`                 | Page background                         |
| `--coral`        | `oklch(0.74 0.13 38)`     | Alerts, warm accent                     |
| `--green`        | `#5a8a5e`                 | Success, "Filed", "Good"                |
| `--ink`          | `#0a1f33`                 | Body text                               |
| `--muted`        | `#5b6b7a`                 | Secondary text                          |
| `--line`         | `rgba(15, 76, 117, 0.12)` | Borders, dividers                       |

### Type
- **Display:** Fraunces (300/400/500), `--serif`. Italic used for emphasis in headlines.
- **UI:** Inter Tight (400/500/600/700), `--sans`.
- **Script accent:** Caveat (Tweaks-only alternate wordmark), `--script`.
- **Mono:** `ui-monospace` for tracking numbers, URLs, timestamps.

### Type rules
- Display headlines: Fraunces 56–80px, `letter-spacing: -0.03em`, `line-height: 1.02`
- Section eyebrows: 11–12px, `letter-spacing: 0.18–0.22em`, uppercase
- Body: 14–15.5px, `line-height: 1.55`, `--muted` color for secondary copy
- Status pills: 10–11px, weight 700, `letter-spacing: 0.05em`, uppercase

### Components
- **Property cards** — striped diagonal pattern (`repeating-linear-gradient`) as photo placeholder
- **Status pills** — `color-mix(in oklab, <color> 18-30%, transparent)` bg + matching fg
- **Photo placeholders** — `repeating-linear-gradient` in sand/seafoam with monospace caption `[ ... ]`
- **Section dark band** — `--ocean-deep` bg with subtle SVG wave decoration (≤0.18 opacity)
- **QR code** — deterministic grid via `FakeQR`

---

## 4. Three Surfaces

### Landing page sections (in order)
1. **Hero** — deep-ocean wave bg, layered property + watcher report cards, email capture
2. **Features** — 6-card grid
3. **Roles** — TABBED: Owners / Watchers / Guests with mock UI peeks incl. iPhone-framed renter hub
4. **Showcase** — 4-step how-it-works + QR-on-fridge illustration
5. **Testimonial** — quote card
6. **Pricing** — 3 tiers (Sandy $179 / Coastal $369 / Island $749), Coastal featured
7. **Final CTA + Footer**

### Renter Hub
Side-by-side iPhone-framed mobile + desktop browser-framed views with shared state. Five tabs: Rules, Info, Rooms, Plan, Guide. Trip Planner PIN: `1234`.

### Homeowner Dashboard
ChromeWindow shell. Sidebar with 9 tabs. Property switcher: All / Salt Box / Dune Lullaby / Northeasterly. Full UI: Overview, Bookings (calendar + QR modal), Watchers, Owner Hub. Polished stubs: Rooms, Appliances, Maintenance, Guide, Settings.

---

## 5. Demo Data

| Owner | Properties | Watchers | Bookings |
|-------|------------|----------|----------|
| Sarah Calabrese | The Salt Box (Beach Haven, 92%) · Dune Lullaby (Surf City, 78%) · Northeasterly (Loveladies, 64%) | Ray Mitchell, Diane Pulaski | Henderson Family, Murphy Group, Park Family, O'Connell, Hawkins, Kim & Friends |

Trip Planner PIN: `1234`. QR tokens: `tk-9f3a-22c1` format.

---

## 6. Suggested Next Tasks

1. **Watcher Dashboard** — full standalone view for `/watcher` role
2. **Property Manager surface** — fourth top-level surface (missing UI)
3. **Polish stub tabs** — Rooms, Appliances, Maintenance, Guide
4. **Real photography** — swap `repeating-linear-gradient` placeholders with `<img>` tags
5. **Wave logo animation** — layered wave animation on wordmark
6. **Tweaks panel** — expose density/accent tweaks on dashboard and renter hub
