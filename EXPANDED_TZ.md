# PadelCompare CIS — Expanded Product Spec

## 1. Product Goal

Build a strong CIS-focused padel gear decision platform that is closer to a structured marketplace intelligence layer than to a blog or simple review site.

Core outcome:

- user can quickly find the right racket for their level, style, and budget
- user can compare alternatives side by side
- user can see where to buy at the best available price
- business can monetize via affiliate, dealer leads, sponsored placements, and data partnerships

## 2. Current State

Current repo is an investor-facing static MVP demo, not a production-ready product.

What already exists:

- clear above-the-fold thesis and positioning in [README.md](./README.md)
- static landing + product demo in [index.html](./index.html)
- searchable/filterable catalog in [src/app.js](./src/app.js)
- compare flow with shareable URL for up to 4 rackets in [src/app.js](./src/app.js)
- normalized single-racket detail card in [src/app.js](./src/app.js)
- demo seed dataset in [data/rackets.js](./data/rackets.js)
- lead form UX stub in [src/app.js](./src/app.js)

What it is right now in practice:

- no backend
- no real database
- no importer pipeline
- no live price aggregation
- no admin panel
- no real lead capture storage
- no SEO content engine
- no real shop integrations

## 3. Evidence From Current Code

Product positioning is explicitly MVP/investor-demo only:

- [README.md](./README.md:3)
- [README.md](./README.md:12)

Data is hardcoded and tiny:

- 8 rackets only in [data/rackets.js](./data/rackets.js:1)

Filtering logic exists but runs fully on static in-memory data:

- state and filters in [src/app.js](./src/app.js:3)
- filter application in [src/app.js](./src/app.js:149)

Compare mechanics already exist:

- URL hydration in [src/app.js](./src/app.js:53)
- compare toggle in [src/app.js](./src/app.js:233)

Lead capture is only a local stub, not a real funnel:

- [src/app.js](./src/app.js:133)
- [src/app.js](./src/app.js:143)

## 4. Competitive Reality

As of June 22, 2026, the space already has strong patterns:

- `PadelCompare` emphasizes multi-shop price comparison, daily updates, compare, and a racket finder across 16 shops.
- `PadelFinder.io` emphasizes price comparison, finder, season freshness, and multi-shop price visibility.
- `PadelCompass` emphasizes independent data, 400+ analyzed rackets, and broader ecosystem data.
- `Padelful` emphasizes comparison plus recommendation tooling.
- `Extreme Tennis X-Compare` emphasizes lab-tested objective criteria and measured scoring.

Implication:

- a static catalog with editorial blurbs is not enough
- competitive moat must come from normalized data, localized buyer intent, commercial routing, and better UX for Russian-speaking users
- long-term moat can be strengthened by price history, trust layer, reviews synthesis, recommendation logic, and local market adaptation

## 5. Product Vision

PadelCompare CIS should become:

"The best Russian-language place to choose a padel racket, compare it objectively, and buy it through the best available route."

Positioning should combine 4 layers:

1. discovery layer
2. decision layer
3. commerce layer
4. data layer

## 6. Main User Jobs

### Primary users

- beginner buying first serious racket
- intermediate player upgrading for a clearer style
- advanced player comparing premium seasonal models
- buyer hunting for best available price
- dealer/partner wanting qualified demand

### Core jobs to be done

- understand what racket type fits me
- shortlist good options fast
- compare differences without reading 20 blog posts
- trust that specs are normalized and not random shop noise
- find where to buy
- leave a request if I want help choosing

## 7. Required Product Modules

### 7.1 Catalog

Must have:

- full racket catalog with brand, model, season, price, availability
- faceted filters
- search by brand/model/alias
- sorting by price, popularity, rating, release date, discount
- brand pages
- seasonal pages

Should have:

- stock status
- price drop badge
- new model badge
- “best for” groupings

### 7.2 Comparison Engine

Must have:

- compare 2-4 rackets side by side
- shareable compare URL
- clear difference highlights
- normalized criteria names

Should have:

- visual sliders for power/control/comfort/maneuverability
- “best choice for X” summary
- compare against current racket

### 7.3 Racket Detail Page

Must have:

- complete normalized specs
- verdict / who it fits / strengths / tradeoffs
- current prices by shop
- CTA to buy
- CTA to compare

Should have:

- price history
- season-to-season changes
- similar alternatives
- replacement suggestions

### 7.4 Finder / Quiz

Must have:

- guided questionnaire
- level, style, arm comfort, budget, preferred feel
- recommended shortlist

Should have:

- explanation of why each result was recommended
- save/share results
- “I currently play with X” entrypoint

### 7.5 Commerce Layer

Must have:

- outbound shop links
- affiliate attribution
- dealer lead routing
- event tracking for clicks and submits

Should have:

- multi-shop price table
- featured local sellers
- “notify me when price drops”

### 7.6 Content + SEO Layer

Must have:

- landing pages by intent
- comparison SEO pages like `X vs Y`
- category pages like `best beginner padel rackets`
- glossary pages for buyer education

Should have:

- editorial buying guides
- review summaries
- seasonal launch pages

### 7.7 Admin + Data Ops

Must have:

- admin CRUD for products
- source management
- normalization workflow
- price refresh jobs
- moderation queue for conflicting data

Should have:

- field-level source attribution
- change history
- anomaly alerts

## 8. Data Model Requirements

Minimum racket entity fields:

- id
- slug
- brand
- model
- season
- category
- shape
- weight range
- balance
- hardness
- sweet spot
- player level
- play style
- face material
- frame material
- core material
- rough surface
- power score
- control score
- comfort score
- maneuverability score
- forgiveness score
- price_min
- price_max
- availability
- image set
- description
- verdict
- pros
- cons
- source references
- updated_at

Separate entities needed:

- brands
- shops
- offers
- price snapshots
- user leads
- content pages
- comparisons
- recommendation sessions

## 9. Data Acquisition Requirements

The project needs a real pipeline, not manual JS arrays.

Sources:

- official brand product pages
- dealer/shop product pages
- distributor catalogs
- seasonal launch pages
- editorial/manual moderation

Pipeline steps:

1. ingest raw source data
2. normalize fields into internal schema
3. detect conflicts and missing values
4. route uncertain fields into moderation
5. publish approved product records
6. refresh prices on schedule

## 10. Localization Requirements

This project should not be a mere translation of EU competitors.

Needed localization:

- Russian-first copy
- ruble display option if useful
- shipping/import context for CIS buyers
- local dealer pages
- explanation-friendly terminology
- adapted beginner education because CIS audience may be newer to padel

## 11. Monetization Requirements

Primary monetization:

- affiliate clicks to EU/global shops
- lead capture for partner dealers
- premium placements for shops/brands

Secondary monetization:

- price alerts / email capture
- sponsored category pages
- B2B data partnerships

Metrics to track:

- catalog CTR to detail
- detail CTR to compare
- compare CTR to shop
- lead form conversion
- finder completion rate
- revenue per visit

## 12. Non-Functional Requirements

Must have:

- mobile-first UX
- fast filtering under large catalog sizes
- SEO-friendly routing
- structured metadata
- analytics instrumentation
- maintainable admin workflow

Performance target:

- catalog interactions should feel instant on 1k+ rackets

## 13. Technical Gap vs Current MVP

### Already present

- decent investor narrative
- basic front-end interaction model
- first-pass filter taxonomy
- first-pass compare UX

### Missing for real product

- backend/API
- database
- importer jobs
- real images/media
- real offers/prices
- analytics
- auth/admin
- content system
- recommendation engine
- notification system
- partner management

## 14. Recommended Build Phases

### Phase 0 — Product Foundation

Goal:

- convert static demo into actual application skeleton

Deliverables:

- backend
- database schema
- seed import system
- admin auth
- API for catalog, detail, compare, leads

### Phase 1 — Data MVP

Goal:

- become useful with a real but curated database

Deliverables:

- 100-150 rackets
- normalized schema
- manual admin editing
- first live shop links
- real lead storage

### Phase 2 — Commerce MVP

Goal:

- prove buyer intent and monetization

Deliverables:

- multi-shop offers
- affiliate tracking
- compare-to-shop funnel
- dealer lead routing
- event analytics

### Phase 3 — SEO + Finder

Goal:

- scale inbound traffic and self-serve recommendations

Deliverables:

- finder/quiz
- programmatic SEO pages
- content templates
- internal linking system

### Phase 4 — Defensibility

Goal:

- become hard to copy

Deliverables:

- price history
- recommendation logic
- review aggregation
- possibly lab/objective scoring or trusted expert scoring
- alerts and saved lists

## 15. Priority Stack

### P0

- backend + DB
- normalized schema
- admin CRUD
- import pipeline
- 100+ real rackets
- real shop links
- analytics

### P1

- finder quiz
- comparison improvements
- SEO pages
- lead workflow
- price refresh

### P2

- price history
- saved lists
- alerts
- richer review layer
- partner dashboards

## 16. Recommended Architecture Direction

Suggested stack direction:

- frontend app with SSR/SEO capability
- API backend
- relational DB
- scraping/import workers
- admin panel
- scheduled refresh jobs

Good practical direction:

- `Next.js` or similar SEO-capable frontend
- `Postgres`
- background jobs for imports/price refresh
- simple admin UI first, not overbuilt CMS

## 17. What “Excellent Competitor” Means Here

For this product, “excellent competitor” does not mean “prettier landing page”.

It means:

- larger and cleaner database
- clearer decision UX
- better localized buyer guidance
- more trustworthy normalized specs
- stronger comparison experience
- better commercial routing
- repeatable data ingestion and refresh

## 18. Final Conclusion

Current `padelcompare-cis` is a strong concept demo.

To become a serious competitor, it must evolve from:

- static showcase with 8 demo rackets

into:

- real data product with catalog scale, live offers, finder logic, admin workflow, and SEO/commercial engine

The key moat should be:

- normalized racket intelligence for Russian-speaking buyers
- not just content, and not just affiliate links

