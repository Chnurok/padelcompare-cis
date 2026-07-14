# PadelCompare CIS — Data Model

## Goal

Replace the current single `rackets[]` demo dataset with a normalized marketplace schema suitable for:

- catalog growth
- compare logic
- multi-shop offers
- price history
- lead routing
- SEO page generation

## Core Entities

### brands

- `id`
- `slug`
- `name`
- `country_code`
- `site_url`
- `is_active`

### rackets

- `id`
- `slug`
- `brand_id`
- `model_name`
- `full_name`
- `season_year`
- `shape`
- `skill_level`
- `play_style`
- `hardness`
- `balance`
- `sweet_spot`
- `weight_g_min`
- `weight_g_max`
- `weight_g_nominal`
- `face_material`
- `frame_material`
- `core_material`
- `surface_texture`
- `power_score`
- `control_score`
- `comfort_score`
- `maneuverability_score`
- `forgiveness_score`
- `category`
- `status`
- `release_date`
- `verdict_short`
- `who_it_fits`
- `description`
- `source_status`
- `published_at`
- `updated_at`

### racket_aliases

- `id`
- `racket_id`
- `alias`
- `alias_type`

### racket_media

- `id`
- `racket_id`
- `type`
- `url`
- `alt_text`
- `sort_order`
- `source_id`

### racket_strengths

- `id`
- `racket_id`
- `kind`
- `text`
- `sort_order`

### shops

- `id`
- `slug`
- `name`
- `country_code`
- `currency`
- `site_url`
- `affiliate_network`
- `affiliate_template`
- `is_partner`
- `is_active`
- `shipping_cis`
- `shipping_ru`
- `shipping_kz`
- `shipping_by`
- `trust_score`
- `last_checked_at`

### offers

- `id`
- `racket_id`
- `shop_id`
- `external_sku`
- `source_url`
- `deeplink_url`
- `title_raw`
- `condition`
- `availability_status`
- `stock_text`
- `price_amount`
- `price_currency`
- `price_amount_base`
- `list_price_amount`
- `discount_pct`
- `shipping_amount`
- `shipping_currency`
- `affiliate_tag`
- `is_featured`
- `first_seen_at`
- `last_seen_at`
- `last_price_checked_at`

### price_history

- `id`
- `offer_id`
- `captured_at`
- `price_amount`
- `price_currency`
- `price_amount_base`
- `list_price_amount`
- `availability_status`
- `stock_text`

### leads

- `id`
- `lead_type`
- `source_page`
- `locale`
- `utm_source`
- `utm_medium`
- `utm_campaign`
- `name`
- `telegram`
- `email`
- `phone`
- `budget_min`
- `budget_max`
- `skill_level`
- `play_style`
- `current_racket_text`
- `notes`
- `status`
- `owner_id`
- `created_at`

### lead_rackets

- `id`
- `lead_id`
- `racket_id`
- `relation_type`

### content_pages

- `id`
- `slug`
- `page_type`
- `title`
- `meta_title`
- `meta_description`
- `h1`
- `intro`
- `body`
- `status`
- `published_at`

### content_page_rackets

- `id`
- `content_page_id`
- `racket_id`
- `role`

### comparisons

- `id`
- `slug`
- `title`
- `compare_type`
- `created_at`

### comparison_items

- `id`
- `comparison_id`
- `racket_id`
- `sort_order`

### sources

- `id`
- `source_type`
- `name`
- `base_url`

### source_records

- `id`
- `source_id`
- `entity_type`
- `external_id`
- `source_url`
- `raw_payload`
- `fetched_at`
- `parse_status`

### field_attribution

- `id`
- `entity_type`
- `entity_id`
- `field_name`
- `source_record_id`
- `confidence`
- `review_status`

## What Can Be Seeded From Current Demo

Current [data/rackets.js](../data/rackets.js) can seed:

- brand names
- base racket identity
- season
- shape
- skill level
- play style
- hardness
- nominal weight
- balance
- sweet spot
- face/frame/core materials
- short verdict
- who-it-fits copy
- pros and cons
- one placeholder offer per racket
- one placeholder shop per `shopName`

## What Is Missing Today

Critical gaps:

- no real canonical slug strategy
- no real images
- no multi-shop offers
- no stock/availability
- no currency normalization
- no price history
- no source attribution
- no timestamps
- no lead persistence model
- no SEO page entities

Important racket enrichment still needed:

- weight range
- lineup/category
- surface texture
- normalized score dimensions
- release date
- richer descriptions
- moderation/source status

## Ingestion Priorities

### Priority 1

- brands
- rackets
- shops
- offers

### Priority 2

- sources
- source_records
- field_attribution

### Priority 3

- price_history
- leads

### Priority 4

- content_pages
- comparisons

## Practical Sequence

1. seed current demo into normalized tables
2. swap fake shops/offers for real ones
3. add raw import pipeline
4. add moderation for conflicting fields
5. add scheduled refresh and price snapshots
6. generate SEO/comparison pages from normalized data

