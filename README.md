# Denim & Tailor Workshop Management System — Stage 1

A modular Next.js App Router foundation using TypeScript, Tailwind CSS, Lucide React, React Context, and browser localStorage.

## Requirements
- Node.js 18.17+ (Node 20 LTS recommended)
- npm

## Run locally
```bash
npm install
npm run dev
```
Open http://localhost:3000.

## Included
- Responsive desktop sidebar, mobile header, six-module bottom navigation, quick-order action.
- Typed domain models in `types/workshop.ts`.
- `WorkshopContext` with Indonesian sample data and persistence key `denim_workshop_store_v1`.
- Phone normalization (`08...` → `628...`), duplicate-phone validation, and currency formatter.
- Functional overview screens for Dashboard, Customers, Orders, Schedule, Cashbook, and Settings.

## Important Stage 1 notes
- The seed data is demonstration data. It is automatically used on first launch; clearing the browser's local storage resets the app to the seed data.
- Persistence is per browser/device. It is not yet a shared database or cloud backup.
- Google Apps Script URL and sync timestamp are modeled, but cloud sync is intentionally not implemented in this foundation.
- Order creation currently opens a navigation placeholder; the full order workflow is a later module.

## Suggested next stages
1. Build customer CRUD and measurement profile editor.
2. Build order intake, item rows, DP/settlement and printable receipt.
3. Build production scheduling and workload allocation.
4. Build cashbook posting rules and monthly reporting.
5. Add authenticated backend/database and reliable cloud sync (avoid treating localStorage as the source of truth for multi-device production use).
