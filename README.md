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
- simple lead capture form
- early roadmap and monetization framing

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

## Current publishing model

- `systemd` runs `next start` on `127.0.0.1:3301`
- `nginx` exposes that preview on `:8087`
- GitHub Pages is kept only as a redirect entrypoint so there is one canonical product version
