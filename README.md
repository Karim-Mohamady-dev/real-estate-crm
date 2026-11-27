# Real Estate CRM — Haven & Key Realty

An original property-sales CRM for a fictional agency, **Haven & Key
Realty**, written from scratch in React 19 + TypeScript + Vite + Tailwind
CSS v4. All code, copy, and demo content in this project is original.

## Honest note on the source

This project was inspired by a Code & Chill Facebook reel whose partial
title was "Real Estate CRM Dashboard". Only the partial title was visible —
Facebook's login wall blocked watching the video itself — so this is **not a
frame-by-frame copy**. It is a faithful interpretation of that kind of
dashboard (a real-estate sales CRM: listings, buyers, viewings, sales
pipeline) rebuilt in a clean modern house style. It is distinct from the
sibling batch-6 project `mortgage-crm`: that one is loan/broker focused,
while this one is property **sales** focused.

## What it does

- **Sales pipeline $3,869,000** — live-computed from the 9 demo listings in
  `src/data/realestate.ts`: Available $2,234,000 + Under offer $1,635,000.
  Sold value ($1,585,000) is shown separately; verified by script.
- **Stats row** — pipeline value, listings count (9), sold this month
  ($1,585,000), active leads (5 of 6), viewings this week (3, Mon 23 – Sun
  29 Nov 2026) — all recomputed live from the underlying data, plus a
  pipeline split bar (Available / Under offer / Sold).
- **Property listings** — 9 homes with price, beds, baths, sq ft, address,
  area and type (House / Apartment / Condo), each as a coloured gradient
  tile with a house icon (no real photos, no map). Clicking a property
  opens a detail panel with a description, features and its viewings.
  Each listing has a working status control (Available → Under offer →
  Sold) that updates the pipeline totals live.
- **Filters** — text search by address/area, status, type, and min/max
  price range.
- **Leads** — 6 buyers with budget, preferred area and status (New /
  Contacted / Viewing / Offer / Closed). Each lead has a working
  **Log call** action: a note input appends a timestamped call note to
  that lead's activity log and moves the lead to Contacted.
- **Viewings scheduler** — pick a property + lead + date + time slot and
  **Book viewing** adds it to the list and to a Mon–Sun week calendar
  strip. Viewings can be cancelled (removed from the calendar) or marked
  done (moves the lead toward Offer). Booking a viewing moves the lead to
  Viewing.
- **Add-listing form** (address, price, beds, baths, type) and **add-lead
  form** (name, budget, area) with basic validation; both add real entries
  immediately.
- **Bilingual EN / عربي** — full language toggle (saved in `localStorage`
  under `real-estate-crm-lang`); switches the whole UI to Arabic with RTL
  layout. Currency is USD throughout, in both languages.
- Statuses, call logs, viewings, added listings and added leads persist in
  `localStorage` (keys prefixed `real-estate-crm-`); a "Reset demo data"
  button restores the original demo state.

## Demo data

All properties, buyers, prices and viewings are **fictional sample data**
for a made-up agency ("Haven & Key Realty"), covering the week of
23–29 November 2026. The footer labels the page as demo data, and changes
are stored only in the visitor's own browser — nothing is sent anywhere.

## Run it

```bash
npm run build   # tsc + vite build -> dist/
npm run dev     # local dev server
npm run preview # serve the production build
```

## Tech

- React 19, TypeScript (strict), Vite 8
- Tailwind CSS v4 (`@tailwindcss/vite`)
- Phosphor icons (`@phosphor-icons/react`)
- Hand-rolled JSON i18n (`src/i18n.ts`, `locales/en/common.json`,
  `locales/ar/common.json`) — no i18n library
