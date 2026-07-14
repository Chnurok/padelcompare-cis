# PadelCompare CIS — Architecture Direction

## Goal

Migrate the current static investor demo into a real product foundation without throwing away the existing catalog/compare UX.

## Recommended Stack

- frontend: SEO-capable React app
- backend: app-integrated API layer
- database: Postgres
- ORM/migrations: Prisma or equivalent relational migration tool
- background jobs: cron/worker layer for imports and price refresh
- admin: internal authenticated admin surface in the same app first

## Why This Direction

The current project is a static site with client-side state and hardcoded data. It is enough for demoing the thesis, but not enough for:

- persistent catalog growth
- admin editing
- offer tracking
- lead capture
- SEO page generation
- importer pipelines

So the best next move is not a redesign. It is an application skeleton with persistence and API-backed reads.

## Migration Principle

Preserve the current product thesis and interaction model:

- catalog
- detail
- compare
- lead capture

But move the source of truth from `data/rackets.js` into database-backed entities and API routes.

## Proposed App Surfaces

### Public product

- homepage
- catalog page
- racket detail pages
- compare pages
- intent/SEO pages
- later: finder flow

### Internal/admin

- racket CRUD
- brand CRUD
- shop CRUD
- offer CRUD
- source/import review
- lead inbox

### Background systems

- data import jobs
- offer refresh jobs
- price history snapshot jobs
- anomaly/conflict checks

## Initial API Shape

### Public API

- `GET /api/rackets`
- `GET /api/rackets/:slug`
- `GET /api/brands`
- `GET /api/compare?ids=...`
- `POST /api/leads`

### Internal API

- `GET /api/admin/rackets`
- `POST /api/admin/rackets`
- `PUT /api/admin/rackets/:id`
- `GET /api/admin/offers`
- `POST /api/admin/imports/run`
- `GET /api/admin/leads`

## Data Flow

### Current

- `data/rackets.js` -> browser memory -> render

### Target

1. sources/importers ingest raw product or offer data
2. normalized records are stored in Postgres
3. public pages read from API/DB
4. admin edits update canonical records
5. jobs refresh offers and append price snapshots

## Migration Path

### Step 1

- stand up app structure
- define DB schema
- seed current demo rackets into DB

### Step 2

- replace hardcoded catalog reads with API-backed reads
- persist leads

### Step 3

- add admin CRUD
- add shops/offers

### Step 4

- add import jobs and refresh pipeline
- expand to real catalog volume

### Step 5

- add SEO page generation and finder/recommendation layer

## Risks

- rebuilding design first would delay the real moat
- scraping before normalization would create schema debt
- adding SEO before persistent product data would create brittle pages

## Short-Term Build Rule

Every early change should answer:

"Does this move PadelCompare from demo UI to real decision engine?"

