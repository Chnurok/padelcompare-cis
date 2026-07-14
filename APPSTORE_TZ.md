# PadelCompare App Store TZ

## Goal

Turn `padelcompare-cis` into an App Store-ready product direction by defining an app-style format first, then reflecting that format in the web version so it can be reviewed in-browser before native Expo work starts.

## Product direction

- Keep the current Next.js + Prisma project as the source of truth for catalog, recommendation, compare, deals, and leads.
- Do not ship a raw WebView wrapper to iOS.
- Use the web product as a design and flow proving ground for the future iPhone app.
- Make the web version feel like an app preview:
  - compact shell
  - app-like navigation
  - clear intake -> shortlist -> compare -> offer flow
  - less SEO-spread feeling on primary routes

## Scope for this pass

1. Create a shared app-style shell for the web experience.
2. Reframe primary discovery routes around mobile-app flows:
   - home
   - finder
   - similar
   - compare
   - deals
3. Keep existing data and route foundations reusable for the future Expo client.
4. Verify each phase with actual project checks.

## Out of scope for this pass

- Native Expo app implementation
- App Store assets submission
- Apple IAP integration
- Admin/auth hardening
- Backoffice mobile adaptation

## Phases

### Phase 1. Shell

- Introduce a reusable app-shell wrapper.
- Add top context and bottom-tab navigation.
- Ensure all primary pages render inside the same frame.

Verification:

- `npm run build`
- route smoke review of `/`, `/finder`, `/similar`, `/compare`, `/deals`

### Phase 2. Home as app preview

- Reframe homepage around app-first messaging, quick actions, and mobile decision flow.
- Keep existing recommendation and catalog logic.

Verification:

- `npm run build`
- homepage visual check in browser

### Phase 3. Primary tool routes alignment

- Align finder / similar / compare / deals with the same visual system.
- Preserve route behavior and data loading.

Verification:

- `npm run build`
- `npm test`

### Phase 4. Hardening

- Fix regressions.
- Clean copy and edge-state presentation.
- Confirm the web preview is reviewable as the future app format.

Verification:

- `npm run build`
- `npm test`

## Acceptance criteria

- The web product clearly looks like an app-preview format rather than a generic website.
- Primary buyer flow is easy to inspect from the browser.
- Existing catalog, compare, and recommendation behavior still works.
- Build and tests pass after the redesign.
