# Domain Launch

Checked on 2026-07-08.

## Current status

- `padelcompare.com` is taken.
- `padelcompare.io` looked available via `whois` at check time.
- `getpadelcompare.com` looked available via `whois` at check time.
- `.app` candidates were inconclusive from CLI checks and should be verified at the registrar before purchase.

## Recommendation

Best current order:

1. `padelcompare.io`
2. `getpadelcompare.com`
3. `padelcompare.app` if actually available

Why:

- `padelcompare.io` is short and product-like.
- `getpadelcompare.com` is less elegant but clear and brand-safe.
- `.app` is attractive for iPhone direction, but it forces HTTPS everywhere and was not fully verifiable from the current shell checks.

## What to configure after purchase

1. Point `A` record to the production server IP.
2. Add `www` CNAME if needed.
3. Set `SITE_URL=https://your-domain`.
4. Update nginx server_name.
5. Issue TLS certificate.
6. Rebuild and restart the app.
7. Check homepage, `/finder`, `/compare`, `/best-for/*`, `/vs/*`, `/for-shops`.
8. Submit sitemap / indexing once canonical domain is live.

## Product note

For PadelCompare, domain is not just branding. It is the trust layer for:

- SEO indexing
- lead capture conversion
- future affiliate approvals
- future App Store credibility and smart links
