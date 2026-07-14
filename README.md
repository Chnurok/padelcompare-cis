# PadelCompare CIS

Buyer-facing padel racket decision product for Russian-speaking users.

## Demo

- Product repo: <https://github.com/Chnurok/padelcompare-cis>
- Live preview: <http://185.205.246.169:8087/>
- GitHub Pages entrypoint: <https://chnurok.github.io/padelcompare-cis/> (redirects to the live preview)
- Domain-ready config: set `SITE_URL` before production launch

## What the product already does

- buyer-facing home with quick entrypoints into `finder`, `similar`, and `compare`
- searchable/filterable racket catalog
- explainable racket finder based on budget, priority, level, and feel
- lead capture directly from finder with saved shortlist context
- compare flow for 2-4 rackets with shareable URL
- separate deals marketplace entrypoint for price-sensitive discovery
- normalized product detail view
- similar-rackets tool for alternative-first discovery
- brand and collection pages for deeper browsing
- dedicated brand index and merchant pages for entity-based discovery
- collection pages for major buyer intents
- basic analytics events for compare, offer clicks, and lead submits
- internal admin import console for bulk catalog upserts
- import run history with source labels for auditability
- per-racket and per-offer source labels/import timestamps for provenance
- admin leads inbox for product-generated follow-ups
- offer availability, previous price, and price history snapshots
- Prisma-backed catalog and offer data

## Current snapshot

- 120 rackets in the catalog
- 8 brands normalized into Prisma
- dedicated routes for `/finder`, `/similar`, `/compare`, `/deals`, `/brands`, `/brands/[slug]`, `/shops/[slug]`, `/collections/[slug]`, `/best-for/[slug]`, `/vs/[left]/[right]`
- hub routes for `/collections`, `/best-for`, and `/brands`
- collection routes for `beginner`, `control`, `power`, and `under-300`
- Prisma-backed event collection for compare opens, offer clicks, and lead submits

## Local run

```bash
npm install
npm run dev
```

Then open the local Next.js URL, usually <http://localhost:3000>.

## Build check

```bash
npm run build
```

## Tests

```bash
npm test
```

## Admin import

- open `/admin/import`
- paste a JSON array of racket objects with `offers`
- run `Dry run` first to validate structure
- run full import to upsert brands, rackets, pros/cons, offers, availability, and price history into Prisma

## Current publishing model

- `systemd` runs `next start` on `127.0.0.1:3301`
- `nginx` exposes that preview on `:8087`
- GitHub Pages is kept only as a redirect entrypoint so there is one canonical product version
