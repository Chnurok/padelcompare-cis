# PadelCompare CIS — Implementation Plan

## Objective

Turn the current static investor demo into a real product foundation with:

- backend
- database
- normalized catalog schema
- admin-ready data flows
- real lead capture
- scalable catalog/compare architecture

## Current Baseline

Current repo contains:

- static landing/demo page in [index.html](./index.html)
- client-side catalog and compare logic in [src/app.js](./src/app.js)
- tiny hardcoded dataset in [data/rackets.js](./data/rackets.js)
- no persistence, no API, no importer, no admin, no analytics

## Delivery Strategy

Work should happen in this order:

1. preserve current demo value
2. add real application foundation underneath it
3. migrate demo data into a production schema
4. expose API routes and storage
5. only then scale catalog, SEO, and commerce features

## Phase 0 — Foundation Skeleton

Goal:

- move from static demo to real app foundation

Deliverables:

- choose product stack
- create app structure for frontend + backend
- define database schema
- define seed/import path from current `data/rackets.js`
- create first API routes
- create persistent lead capture

Concrete tasks:

- add `docs/architecture.md`
- add database schema definition
- add seed script that imports current demo rackets
- add API for:
  - `GET /api/rackets`
  - `GET /api/rackets/:slug`
  - `GET /api/compare`
  - `POST /api/leads`
- wire frontend lead form to real persistence

Exit criteria:

- app runs locally with persistent data
- current demo screens still work
- rackets are served from DB/API, not hardcoded JS only
- leads are saved in storage

## Phase 1 — Data MVP

Goal:

- make the catalog genuinely useful

Deliverables:

- production-ready racket schema
- 100-150 curated real rackets
- shop entity model
- offer model
- admin-editable product records

Concrete tasks:

- create normalization rules for:
  - shape
  - hardness
  - balance
  - skill level
  - play style
- create import pipeline for seed CSV/JSON/manual input
- create admin CRUD for rackets, shops, and offers
- add source attribution fields

Exit criteria:

- at least 100 real rackets in DB
- filters work on real data
- admin can edit records without touching code

## Phase 2 — Commerce MVP

Goal:

- prove business utility

Deliverables:

- outbound partner links
- click tracking
- lead routing
- shop offer blocks on detail pages

Concrete tasks:

- add offers table
- add per-racket buy CTAs
- track compare-to-shop and detail-to-shop events
- store dealer/lead requests with context

Exit criteria:

- user can go from discovery to compare to shop
- business can inspect captured leads and outbound intent

## Phase 3 — Finder + Recommendation

Goal:

- reduce choice paralysis and increase conversion

Deliverables:

- guided finder quiz
- recommendation engine
- recommendation explanation layer

Concrete tasks:

- define quiz inputs
- implement scoring model over normalized attributes
- output shortlist with rationale

Exit criteria:

- user can answer a short quiz and receive a useful shortlist

## Phase 4 — SEO Surface

Goal:

- expand inbound acquisition

Deliverables:

- brand pages
- category pages
- `X vs Y` pages
- best-for-intent pages

Concrete tasks:

- define page templates
- generate metadata and internal links
- add structured data

Exit criteria:

- app supports scalable SEO page generation with stable product data

## Phase 5 — Defensibility

Goal:

- become hard to replace with a generic affiliate site

Deliverables:

- price history
- saved compare lists
- alerts
- richer expert/review synthesis

Concrete tasks:

- store price snapshots
- add alert subscriptions
- add comparison summary intelligence

Exit criteria:

- repeat users have reasons to come back, not just convert once

## Immediate Build Order

This is the practical execution order for the next working sessions:

1. choose the real app stack and folder structure
2. create DB schema and seed importer from `data/rackets.js`
3. stand up first API routes
4. replace frontend hardcoded fetch path with API-backed catalog
5. persist leads
6. add admin CRUD
7. expand dataset

## Recommended First Technical Slice

The first code slice should implement:

- persistent racket storage
- persistent lead storage
- API-backed catalog read

Why:

- it converts the project from mockup to product foundation fast
- it preserves existing UX while unlocking later features
- it avoids premature work on SEO or design before the data layer exists

## Risks

- rebuilding UI before data architecture would waste time
- scraping/import before schema normalization would create garbage data
- scaling content before compare/commerce instrumentation would create traffic without monetization proof

## Working Rule

For now, every next change should be judged by one question:

"Does this make the product more like a real decision engine and less like a demo?"

