# PadelCompare CIS

Investor-facing MVP demo for a Russian-language padel racket comparison product.

## Demo

- Product repo: <https://github.com/Chnurok/padelcompare-cis>
- Live preview: <http://185.205.246.169:8087/>
- GitHub Pages entrypoint: <https://chnurok.github.io/padelcompare-cis/> (redirects to the live preview)

## What this demo shows

- product thesis above the fold, not just a raw prototype
- searchable/filterable racket catalog
- compare flow for 2-4 rackets with shareable URL
- normalized product detail view
- collection pages for major buyer intents
- simple lead capture form
- basic analytics events for compare, offer clicks, and lead submits
- internal admin import console for bulk catalog upserts
- early roadmap and monetization framing

## Current snapshot

- 20 curated rackets in the demo catalog
- collection routes for `beginner`, `control`, `power`, and `under-300`
- Prisma-backed event collection for compare opens, offer clicks, and lead submits

## Why this matters

The core idea is not "another review site". The value is a normalized data layer that turns fragmented specs, pricing, and buyer confusion into a decision tool with commercial intent.

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
- run full import to upsert brands, rackets, pros/cons, and offers into Prisma

## Current publishing model

- `systemd` runs `next start` on `127.0.0.1:3301`
- `nginx` exposes that preview on `:8087`
- GitHub Pages is kept only as a redirect entrypoint so there is one canonical product version
