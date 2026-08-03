# Google Play launch checklist

## Fixed release identity

- App name: `PadelCompare`
- Android package: `com.padelcompare.app`
- Version name: `1.0.0`
- Initial version code: `1` (EAS remotely increments later production builds)
- Default language: Russian (`ru-RU`)
- App type: App
- Pricing: Free

The package name cannot be changed after the first Play Console artifact is uploaded. Confirm ownership of `com.padelcompare.app` before step 3.

## 1. One-time Expo setup

From `mobile/`:

```powershell
npx eas-cli@latest login
npx eas-cli@latest init
```

`eas init` writes the Expo project ID into app configuration. Commit that ID; it is not a secret.

## 2. Build the release artifacts

```powershell
npm run build:android:preview  # installable APK for direct device QA
npm run build:android:prod     # signed AAB for Google Play
```

The production profile is explicitly configured as an Android App Bundle. EAS manages the Android signing keystore; do not commit downloaded `.jks` or credentials.

## 3. Create the Play Console app and make the first upload

1. Create the app in Google Play Console with the identity above.
2. Complete App access, Ads, Content rating, Target audience, News apps, Data safety, Government apps, Financial features, Health, and privacy-policy declarations.
3. Use a public HTTPS privacy URL ending in `/privacy` on the production site.
4. Copy the Russian listing text from `listing/ru-RU/` and upload the PNG assets from `assets/`.
5. Create an Internal testing release and manually upload the first `.aab` produced by EAS.
6. Add testers, publish the internal release, and install it using the Play testing link.

Google requires the first Play submission to be uploaded manually before API-based submissions work.

## 4. Verify on physical Android devices

- clean install, launch, splash, icon, and predictive Back behavior
- Home, Catalog, Finder, Saved, racket details, brands, compare, and deals
- offline launch and offline catalog browsing
- restart persistence for saved rackets and comparison
- merchant links and privacy link
- small phone and large phone layouts, light and dark system settings
- no unexpected permissions requested
- production API refresh uses HTTPS only

## 5. Optional automated future submissions

After the first manual upload, create a Google Play service account with the minimum required Play Console permission, add its key to EAS credentials, and run:

```powershell
npm run submit:android:internal
```

Never commit the service-account JSON. `mobile/google-service-account.json` is ignored.

For the public rollout, first review the draft release created by:

```powershell
npm run submit:android:production
```

The production submit profile intentionally uses `draft`, so Play Console review is required before rollout.

## 6. Production-access rule for new personal accounts

Personal developer accounts created after 13 November 2023 normally need a closed test with at least 12 opted-in testers continuously for 14 days before production access can be requested. Follow the exact requirement shown in the account's Play Console because Google may update eligibility rules.
