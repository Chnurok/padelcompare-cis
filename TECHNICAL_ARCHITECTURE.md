# PadelCompare CIS Technical Architecture

## Goal

Turn the current static investor MVP into a production foundation that can support:

- a real normalized racket catalog
- public SEO pages and compare flows
- lead capture and partner routing
- admin moderation and imports
- future offer/price intelligence

The right target is not a microservice system. It is a modular TypeScript monolith with clear boundaries, one primary database, and background jobs.

## Current Baseline

Today the repo is a static frontend:

- `index.html` renders the landing and demo shell
- `src/app.js` runs filters, compare state, detail rendering, and a local lead-form stub
- `data/rackets.js` is the only catalog source

This is good enough for investor demos, but it has no persistence, no source-of-truth data model, no API, no admin workflow, and no import pipeline.

## Recommended Stack

### Product stack

- Frontend: `Next.js` + TypeScript + App Router
- Styling: keep simple CSS or CSS modules first; avoid UI-framework lock-in
- Backend: Next.js route handlers plus server modules as a modular monolith
- Database: `PostgreSQL`
- ORM/migrations: `Prisma`
- Validation: `Zod`
- Auth for admin: `NextAuth` or provider-backed auth with email/passwordless login
- Background jobs: `Trigger.dev` or `BullMQ` only for imports, price refresh, and notifications
- Storage: `S3-compatible object storage` for import files and future media
- Analytics/events: `PostHog` or a lightweight event table first, then external analytics if needed
- Hosting: `Vercel` for web + managed `Postgres`; if infra control matters later, move to Docker on a VPS without changing app boundaries

### Why this stack

- SEO, comparison pages, and content pages benefit from server rendering
- one TypeScript codebase is faster to ship and easier to maintain than separate frontend/backend repos
- PostgreSQL is enough for catalog, offers, events, leads, and import workflows
- Prisma gives predictable schema migrations and seed tooling for the current `rackets.js` dataset

## Recommended Repository Layout

```text
apps/
  web/
    app/
    components/
    lib/
      catalog/
      compare/
      leads/
      seo/
      analytics/
    api/
packages/
  db/
    prisma/
    seeds/
  shared/
    schemas/
    types/
workers/
  imports/
  price-refresh/
docs/
```

If the team wants less restructuring at the start, the same boundaries can live inside one Next.js app first, then split into packages later.

## Backend and API Layout

Use a public REST API for the product and a separate internal/admin API surface. Keep both in the same deployable app.

### Public API

- `GET /api/catalog/rackets`
  - filter by brand, shape, level, style, hardness, season, price range
  - search by brand/model/alias
  - sort by price, release date, popularity, score
- `GET /api/catalog/rackets/:slug`
  - full normalized racket record
  - active offers
  - related models
- `GET /api/compare`
  - accepts 2-4 racket slugs or IDs
  - returns normalized comparison payload with field-level differences
- `POST /api/leads`
  - stores inquiry, source context, selected racket, compare context, contact channel
- `POST /api/events`
  - records compare click, outbound shop click, finder completion, lead submit

### Internal/Admin API

- `POST /api/admin/imports`
  - upload or register a source file/feed
- `POST /api/admin/imports/:id/run`
  - trigger parsing and normalization
- `GET /api/admin/moderation/queue`
  - unresolved or conflicting spec rows
- `PATCH /api/admin/rackets/:id`
  - edit normalized product data
- `PATCH /api/admin/offers/:id`
  - update shop offers, links, price, availability

### Service boundaries inside the monolith

- `catalog` owns rackets, brands, specs, filters, search
- `offers` owns shops, affiliate links, availability, pricing
- `leads` owns lead ingestion and routing
- `imports` owns source files, parsers, normalization, moderation
- `analytics` owns event capture and reporting-ready aggregates
- `seo` owns generated landing pages, slugs, metadata, internal links

## Core Data Model

Recommended first tables:

- `brands`
- `rackets`
- `racket_specs`
- `racket_aliases`
- `shops`
- `offers`
- `price_snapshots`
- `leads`
- `compare_events`
- `content_pages`
- `import_sources`
- `import_runs`
- `import_rows`
- `moderation_items`

Important modeling rule: keep raw imported values and normalized values separately.

Example:

- raw source says `medium-hard`
- normalized field stores `hard`
- provenance keeps original text and source URL

This is part of the moat. It prevents the catalog from collapsing into scraped noise.

## Data Flow

### Catalog ingestion

1. Source enters through CSV, manual admin input, or brand/shop parser.
2. Raw row is stored in `import_rows`.
3. Normalization maps brand names, specs, season, hardness, balance, and play style.
4. Confident rows auto-publish to canonical tables.
5. Ambiguous rows go to `moderation_items`.
6. Published products become available through public catalog APIs.

### Offer and pricing flow

1. Shop feed or manual entry updates `offers`.
2. Price changes append to `price_snapshots`.
3. Active best-price offer is materialized for the detail page.
4. Outbound clicks emit `shop_click` events tied to racket and offer.

### Lead flow

1. User submits lead form from catalog, compare page, or detail page.
2. API stores contact payload and decision context in `leads`.
3. Routing status is tracked internally.
4. Later integrations can push leads to Telegram, email, CRM, or dealer dashboard without changing the public UI contract.

## Frontend Rendering Strategy

Use SSR/ISR for indexable pages and client-side interactivity only where it helps.

- SSR/ISR: homepage, brand pages, category pages, racket detail pages, compare landing pages
- client components: filter controls, compare add/remove, share link copy, finder quiz

This keeps search pages crawlable while preserving the current fast MVP interaction style.

## Migration Path From Current MVP

### Phase 1: Foundation without product redesign

- create the new app skeleton in TypeScript
- create Prisma schema and Postgres database
- write a seed/import script that reads `data/rackets.js`
- expose `GET /api/catalog/rackets`, `GET /api/catalog/rackets/:slug`, and `POST /api/leads`
- keep current UI behavior as the acceptance baseline

Outcome:
The same demo becomes persistent and API-backed.

### Phase 2: Replace hardcoded reads

- move the catalog grid, detail card, and compare table to API-backed data
- preserve the existing `?compare=` URL contract
- store lead submissions in DB instead of local echo output

Outcome:
The MVP stops depending on bundled catalog data.

### Phase 3: Admin and import workflow

- add admin auth
- add manual CRUD for brands, rackets, shops, and offers
- add import runs and moderation queue

Outcome:
The business can expand the catalog without code edits.

### Phase 4: Commerce and SEO scale

- add offer tables and outbound click tracking
- generate brand/category/comparison pages
- add price snapshots and simple reporting

Outcome:
The product becomes commercially measurable and SEO-scalable.

## Architectural Principles

- Prefer one deployable system with modules over multiple services
- Separate canonical product data from imported raw data
- Treat normalization and provenance as first-class features
- Keep public API contracts stable even if internal ingestion changes
- Add queues only when import/refresh volume justifies them
- Preserve the current compare/share UX while changing the internals underneath it

## Recommended First Deliverable

Build the first production slice as:

- Next.js app
- Postgres + Prisma
- imported seed from `data/rackets.js`
- catalog read API
- real lead persistence

That is the smallest step that turns the project from a static demo into a real product foundation.
