# Shore Stay — CLAUDE.md

## What We're Building
Shore Stay is a premium, mobile-first Progressive Web App (PWA) for Long Beach Island, NJ.
It is a **three-sided platform**:

- **Side A — Public Listing Browser**: Renters search and browse LBI vacation rental properties. Modern competitor to vacationrentalslbi.com (VRLBI). No payment processing — renters contact owners directly.
- **Side B — Owner Dashboard**: Property owners manage their listing, guest companion content, compliance tracking, maintenance contacts, and subscription.
- **Side C — Guest Companion**: Guests access via QR code scan (no app download). Beautiful, Apple-inspired interface with property info, tides, weather, owner's picks, trip planner, and group tools.

Domain: shorestay.app
Brand: dark navy, seafoam, sand palette. Apple SF-style typography. Frosted glass UI. Premium feel.

---

## Tech Stack
- **Frontend**: React PWA (Vite), Tailwind CSS
- **Backend**: Node.js, Supabase (Postgres + Auth + Realtime + Storage)
- **Hosting**: Vercel
- **Payments**: Stripe (annual subscriptions)
- **Weather API**: Open-Meteo (free tier)
- **Tides API**: NOAA CO-OPS (Barnegat Inlet station — free)
- **QR Codes**: Generated in-house via qrcode.react or similar

---

## Commands
- Dev: `npm run dev`
- Build: `npm run build`
- DB migrate: `npx supabase db push`
- Test: `npm test`

---

## User Roles
1. **Renter / Public visitor** — browses listing browser, no account required
2. **Property Owner** — authenticated, manages listing + owner dashboard
3. **Trip Organizer** — the person who booked; plans itinerary, assigns rooms, invites group
4. **Guest** — read-only access via QR link; sees companion app for their specific property
5. **Property Manager** — manages multiple owner properties (Island tier only)

---

## Subscription Tiers (Annual Only)
| Tier | Price | Key Features |
|------|-------|--------------|
| **Sandy** | $179/yr | 1 property listing, QR guest companion, basic availability calendar, standard search placement |
| **Coastal** | $369/yr | Everything in Sandy + up to 3 properties, elevated search placement, guest analytics, trip planner, group access |
| **Island** | $749/yr | Everything in Coastal + unlimited properties, top search placement, virtual room map, compliance tracker, maintenance rolodex, document vault, white-label option |

---

## Build List — 20 Items Across 3 Sides

### Side A — Public Listing Browser
1. **Homepage & search** — hero, search bar, filter by town/dates/beds/pets, modern card grid
2. **Property listing page** — photo gallery, amenities, availability calendar, contact owner form
3. **Search filters & map view** — toggle between grid and map, filter by price/beds/baths/pets/bay vs ocean
4. **Township pages** — one page per LBI town (Barnegat Light, Harvey Cedars, Surf City, Ship Bottom, Brant Beach, Beach Haven, etc.) with local character + SEO value
5. **Availability calendar system** — owners mark their own dates, renters see real-time availability

### Side B — Owner Tools & Dashboard
6. **Owner dashboard** — manage listing, upload photos, view inquiries, QR generator, subscription management
7. **Property setup wizard** — step-by-step onboarding to get live fast
8. **Owner's Picks editor** — curated personal recommendations with owner's own notes (shown to guests in companion)
9. **Compliance tracker** — per-municipality STR checklists, ordinance reminders, permit storage (year-round retention driver)
10. **Maintenance rolodex** — saved vendors by trade, one-tap call, private per owner
11. **Document vault & tax calendar** — insurance, permits, inspection certs; NJ occupancy tax reminders, winterization checklist
12. **Stripe subscription billing** — Sandy / Coastal / Island annual tiers

### Side C — Guest Companion (QR Code Experience)
13. **Guest home screen** — check-in card, live weather bar, Barnegat tide strip, events preview, owner's picks preview
14. **My Stay tab** — WiFi tap-to-reveal, door code reveal, parking, check-in/out times, house rules by category
15. **Tides & Weather screen** — full Barnegat Inlet tide chart, 7-day forecast, live conditions (temp, surf height, wind, UV, water temp) all on one screen
16. **Owner's Picks** — owner's personal recommendations shown in their voice; the insider knowledge guests love
17. **Virtual room builder & assignment** — owner uploads room photos, Trip Organizer assigns guests before arrival
18. **Trip planner & group access** — day-by-day itinerary, group invite via link/QR, tiered permissions, shared trip board
19. **Smart alerts** — tide push alerts, weather warnings, garbage day reminders pushed to guests
20. **"Own a property?" referral prompt** — subtle CTA on every guest page, converts renters into owner leads

---

## Key Design Decisions
- **No payment processing** — renters contact owners directly (phone/email), same model as VRLBI but with far better UX
- **No generic explore/directory tab** — replaced by Owner's Picks (personal, curated, in the owner's voice)
- **No VRLBI integration** — Shore Stay is a direct competitor, not a partner
- **No business listings or experience marketplace** — saved for a future separate product
- **Tides and weather are one screen** — guests check both for the same reason (deciding what to do)
- **PWA via QR code** — no app download required; loads instantly in mobile browser

---

## Data Model (Core Tables)
- `properties` (id, owner_id, title, description, address, town, bedrooms, bathrooms, amenities, tier)
- `property_photos` (id, property_id, url, room_name, sort_order)
- `availability` (id, property_id, date, status: available/booked/blocked)
- `bookings` (id, property_id, renter_name, renter_email, start_date, end_date, qr_token)
- `users` (id, email, role: owner/manager, stripe_customer_id, tier)
- `owners_picks` (id, property_id, name, category, owner_note, link, photo_url)
- `rooms` (id, property_id, name, photo_url, notes, assigned_guest)
- `trip_events` (id, booking_id, title, datetime, notes, status)
- `trip_members` (id, booking_id, name, role: organizer/guest, invite_token)
- `maintenance_contacts` (id, owner_id, name, trade, phone, notes, rating)
- `documents` (id, owner_id, property_id, name, type, url, expiry_date)
- `compliance_items` (id, property_id, municipality, title, due_date, completed_at)

---

## Build Phase Order
**Phase 1** — Guest companion core (items 13–15): get something a real guest can use
**Phase 2** — Owner dashboard + property setup (items 6–7): get owners onboarded
**Phase 3** — Public listing browser (items 1–5): the VRLBI competitor side
**Phase 4** — Owner's Picks + room builder + trip planner (items 8, 16–18)
**Phase 5** — Compliance, maintenance, documents, billing, alerts (items 9–12, 19–20)

---

## LBI-Specific Context
- 18-mile barrier island, ~15,000 short-term rental units
- Towns north to south: Barnegat Light, Harvey Cedars, Surf City, Ship Bottom, Brant Beach, Spray Beach, Beach Haven Terrace, Holyoke, Bungalow Park, North Beach Haven, Beach Haven Crest, Haven Beach, Peahala Park, Beach Haven
- Tides: use NOAA station 8534720 (Barnegat Inlet)
- Garbage pickup varies by township — this is a real guest pain point
- Beach badges required in all towns; ages 12 and under free
- Peak season: Memorial Day through Labor Day (14 weeks)
- Primary competitor: vacationrentalslbi.com — annual fees only, no payment processing, dated UI
