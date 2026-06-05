# PadelCompare CIS

Mini MVP for a Russian-language padel racket comparison product.

## What is inside

- landing section with product framing
- searchable/filterable racket catalog
- comparison mode for 2-4 models
- single-racket detail panel
- shareable compare URL via query params
- seed dataset with normalized fields

## Run locally

Because this is a static app, any file server is enough.

```bash
python3 -m http.server 8080
```

Then open <http://localhost:8080> from the repo root.

## MVP scope

This implementation is intentionally small. It demonstrates product structure and interaction design, not production data pipelines, SEO routing, or admin imports.
