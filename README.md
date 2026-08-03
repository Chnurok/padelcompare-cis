# PadelCompare CIS

Buyer-facing padel racket decision product for Russian-speaking users.

## Demo

- Product repo: <https://github.com/Chnurok/padelcompare-cis>
- Public GitHub Pages site: <https://chnurok.github.io/padelcompare-cis/> (responsive landing plus a static searchable catalog and client-side comparison)
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

- 150 rackets in the catalog
- 9 brands normalized into Prisma
- dedicated routes for `/finder`, `/similar`, `/compare`, `/deals`, `/brands`, `/brands/[slug]`, `/shops/[slug]`, `/collections/[slug]`, `/best-for/[slug]`, `/vs/[left]/[right]`
- hub routes for `/collections`, `/best-for`, and `/brands`
- collection routes for `beginner`, `control`, `power`, and `under-300`
- Prisma-backed event collection for compare opens, offer clicks, and lead submits

## Native Android and iOS app

The repository also contains a production-oriented Expo/React Native client in `mobile/`.
It includes the complete offline catalog, native finder, saved shortlist, comparison,
brand and deal screens, Google Play/App Store metadata, and EAS production profiles.

Android ships first. No local Android Studio, Mac, or Xcode installation is required for
cloud builds: EAS creates the signed `.aab` for Google Play and can later create the `.ipa`
for App Store Connect from Windows.

```bash
npm run mobile:install
npm run mobile:lint
npm run mobile:typecheck
npm run mobile:test
npm run mobile:export:android
```

The website presents the app at `/app` and collects Android-test signups through the
existing leads inbox. Google Play identity, first-upload steps, listing copy, and the
data-safety worksheet are documented in `mobile/google-play/`.

One-time Expo/Google authorization and release commands are documented in
`mobile/README.md`.

## Requirements

- Node.js 20.9 or newer
- npm 10 or newer

## Run from a clone or downloaded ZIP

```bash
npm install
npm run db:generate
cp .env.example .env
npm run dev
```

On PowerShell, use `Copy-Item .env.example .env` instead of `cp`.
Then open <http://localhost:3000>. The repository includes `prisma/dev.db` with the release catalog, so seeding is not required for the first launch.

Before exposing the app publicly, replace `ADMIN_PASSWORD` in `.env` with a long random value. The `/admin/*` pages and `/api/admin/*` routes fail closed when admin credentials are absent. Set `ANALYTICS_ENABLED=true` only when analytics persistence is intentionally enabled.

## Release checks

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

To verify the production server locally after a successful build:

```bash
npm start
```

## Database reset

The checked-in SQLite snapshot contains the release catalog. To recreate it from `data/rackets.js` and remove local leads, import history, and analytics events:

```bash
npm run db:push
npm run db:seed
```

Do not commit a root-level `dev.db`, SQLite journal/WAL files, `.env`, `.next`, or analytics generated during local testing.

## Tests

```bash
npm test
```

## Admin import

- configure `ADMIN_USERNAME` and `ADMIN_PASSWORD`
- open `/admin/import`
- paste a JSON array of racket objects with `offers`
- run `Dry run` first to validate structure
- run full import to upsert brands, rackets, pros/cons, offers, availability, and price history into Prisma

## Current publishing model

- `systemd` runs `next start` on `127.0.0.1:3301`
- `nginx` exposes that preview on `:8087`
- GitHub Pages publishes the static product landing and reference catalog; the full Next.js app, APIs, admin, imports, analytics, and live offer updates require a server deployment
- the self-hosted environment must provide `DATABASE_URL`, `SITE_URL`, `ADMIN_USERNAME`, and `ADMIN_PASSWORD`; analytics storage is opt-in via `ANALYTICS_ENABLED=true`
