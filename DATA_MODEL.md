# PadelCompare CIS Data Model

This note describes a normalized production schema derived from [EXPANDED_TZ.md](./EXPANDED_TZ.md) and the current demo seed in [data/rackets.js](./data/rackets.js).

## Scope

Current demo state:

- 8 hardcoded rackets
- 1 price/shop row per racket
- mixed product, offer, and editorial fields in one object

Production goal:

- separate canonical racket data from merchant offers and editorial enrichment
- preserve source attribution for imported fields
- support multi-shop pricing, future price history, and admin normalization

## Normalized Production Schema

### 1. `brands`

Canonical manufacturer list.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | uuid | PK |
| `slug` | text | unique |
| `name` | text | unique display name |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | |

### 2. `rackets`

Stable product entity for a racket model/season/variant.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | uuid | PK |
| `external_key` | text | current seed id, unique |
| `brand_id` | uuid | FK -> `brands.id` |
| `slug` | text | unique |
| `model` | text | |
| `variant` | text | nullable, e.g. `18K`, `Ctrl`, `Soft` |
| `full_name` | text | display name |
| `season` | int | |
| `category` | text | nullable until taxonomy is defined |
| `shape` | text | normalized enum-like value |
| `skill_level` | text | normalized enum-like value |
| `play_style` | text | normalized enum-like value |
| `hardness` | text | normalized enum-like value |
| `weight_g` | int | single measured/default weight |
| `weight_min_g` | int | nullable |
| `weight_max_g` | int | nullable |
| `balance` | text | normalized enum-like value |
| `sweet_spot` | text | normalized enum-like value |
| `face_material` | text | |
| `frame_material` | text | |
| `core_material` | text | |
| `rough_surface` | boolean | nullable |
| `power_score` | numeric(4,2) | nullable |
| `control_score` | numeric(4,2) | nullable |
| `comfort_score` | numeric(4,2) | nullable |
| `maneuverability_score` | numeric(4,2) | nullable |
| `forgiveness_score` | numeric(4,2) | nullable |
| `description` | text | nullable |
| `verdict` | text | nullable |
| `who_it_fits` | text | nullable |
| `status` | text | `active`, `draft`, `archived` |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | |

### 3. `racket_images`

Image set for detail, cards, and SEO.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | uuid | PK |
| `racket_id` | uuid | FK -> `rackets.id` |
| `image_role` | text | `hero`, `thumb`, `gallery` |
| `source_url` | text | nullable |
| `storage_path` | text | nullable |
| `alt_text` | text | nullable |
| `sort_order` | int | default 0 |

### 4. `racket_pros`

Normalized strengths list.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | uuid | PK |
| `racket_id` | uuid | FK -> `rackets.id` |
| `position` | int | preserves display order |
| `text` | text | |

### 5. `racket_cons`

Normalized tradeoff list.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | uuid | PK |
| `racket_id` | uuid | FK -> `rackets.id` |
| `position` | int | preserves display order |
| `text` | text | |

### 6. `merchants`

Shop directory.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | uuid | PK |
| `slug` | text | unique |
| `name` | text | unique |
| `region` | text | nullable |
| `affiliate_template` | text | nullable |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | |

### 7. `offers`

Current buyable offer rows. This is where demo `currentPrice`, `shopName`, and `shopUrl` belong.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | uuid | PK |
| `racket_id` | uuid | FK -> `rackets.id` |
| `merchant_id` | uuid | FK -> `merchants.id` |
| `merchant_sku` | text | nullable |
| `product_url` | text | |
| `currency` | text | ISO code |
| `price_amount` | numeric(10,2) | |
| `availability` | text | nullable |
| `is_active` | boolean | default true |
| `last_seen_at` | timestamptz | |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | |

### 8. `offer_price_history`

Optional but directly aligned with the expanded spec.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | uuid | PK |
| `offer_id` | uuid | FK -> `offers.id` |
| `captured_at` | timestamptz | |
| `price_amount` | numeric(10,2) | |
| `availability` | text | nullable |

### 9. `sources`

Source registry for imports and manual research.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | uuid | PK |
| `source_type` | text | `merchant`, `brand`, `manual`, `editorial` |
| `name` | text | |
| `base_url` | text | nullable |
| `priority` | int | lower = more trusted |

### 10. `field_sources`

Field-level provenance for normalization and conflict review.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | uuid | PK |
| `entity_type` | text | e.g. `racket`, `offer` |
| `entity_id` | uuid | referenced row id |
| `field_name` | text | e.g. `shape`, `weight_g` |
| `source_id` | uuid | FK -> `sources.id` |
| `source_value` | text | raw imported value |
| `normalized_value` | text | stored normalized value |
| `captured_at` | timestamptz | |

## Seed Mapping From `data/rackets.js`

The current seed object should be split as follows:

| Seed field | Target table.column | Notes |
| --- | --- | --- |
| `id` | `rackets.external_key` | keep as legacy import key |
| derived from `id` or name | `rackets.slug` | URL-safe canonical slug |
| `brand` | `brands.name` | upsert brand first |
| `model` | `rackets.model` | |
| parsed from `model` if needed | `rackets.variant` | optional cleanup field |
| `fullName` | `rackets.full_name` | |
| `season` | `rackets.season` | |
| `shape` | `rackets.shape` | normalize vocabulary |
| `skillLevel` | `rackets.skill_level` | normalize vocabulary |
| `playStyle` | `rackets.play_style` | normalize vocabulary |
| `hardness` | `rackets.hardness` | normalize vocabulary |
| `weight` | `rackets.weight_g` | |
| `balance` | `rackets.balance` | normalize vocabulary |
| `sweetSpot` | `rackets.sweet_spot` | normalize vocabulary |
| `faceMaterial` | `rackets.face_material` | |
| `frameMaterial` | `rackets.frame_material` | |
| `coreMaterial` | `rackets.core_material` | |
| `verdict` | `rackets.verdict` | editorial text |
| `whoItFits` | `rackets.who_it_fits` | editorial text |
| `pros[]` | `racket_pros.text` | one row per entry with order |
| `cons[]` | `racket_cons.text` | one row per entry with order |
| `shopName` | `merchants.name` | upsert merchant |
| `shopUrl` | `offers.product_url` | |
| `currentPrice` | `offers.price_amount` | demo implies EUR |
| implicit demo currency | `offers.currency='EUR'` | explicit in production |
| `image` | not production-safe as-is | demo initials only; replace with real image records |

## Recommended Normalization Rules

- Treat `rackets` as the canonical product layer and `offers` as the commercial layer.
- Keep enum-like vocabularies stable for `shape`, `skill_level`, `play_style`, `hardness`, `balance`, and `sweet_spot`.
- Store text lists like pros/cons outside the main racket row to support ordering and future localization.
- Do not derive `price_min` and `price_max` as stored source-of-truth columns; calculate them from active offers or materialize them later.
- Preserve raw imported values in `field_sources` whenever a source string does not match the normalized dictionary exactly.

## Ingestion Priorities

### P0: Required for first real catalog

1. `brands`
2. `rackets`
3. `merchants`
4. `offers`
5. `sources`
6. `field_sources` for key spec fields and price fields

Why:

- this is the minimum set needed for catalog, filters, compare, buy links, and source trust

### P1: Required for current demo parity plus cleaner detail pages

1. `racket_pros`
2. `racket_cons`
3. `racket_images`

Why:

- these preserve current verdict content while removing mixed arrays/placeholders from the core product row

### P2: Required for the expanded product vision

1. `offer_price_history`
2. score fields on `rackets`
3. taxonomy expansion for category/seasonal pages
4. future finder/recommendation inputs

Why:

- these unlock price history, richer comparisons, SEO landing pages, and recommendation logic mentioned in the expanded spec

## Initial Seed Import Order

1. Upsert `sources` with one seed source such as `demo_seed`.
2. Upsert all `brands`.
3. Upsert all `merchants`.
4. Insert `rackets`.
5. Insert `racket_pros` and `racket_cons`.
6. Insert one `offers` row per seed object.
7. Write `field_sources` for imported spec and offer fields.

## Notes on Gaps Between Demo and Production

- The demo has one offer per racket; production should assume many offers per racket.
- The demo has no availability field even though the spec requires it.
- The demo uses one `weight` value; production should allow future min/max ranges.
- The demo has no real images, no source references, and no objective score fields yet.
- `price_min` and `price_max` from the expanded spec are better represented as computed aggregates over `offers`.
