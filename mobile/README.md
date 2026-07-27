# PadelCompare for iOS

Native Expo/React Native client prepared for EAS Build, TestFlight, and the Apple App Store.

## Included in v1

- native iOS navigation with Home, Catalog, Finder, and Saved tabs
- offline release snapshot: 150 rackets, 9 brands, and store offers
- catalog search plus brand and shape filters
- explainable finder based on budget, priority, skill level, and feel
- persistent shortlist stored locally on the device
- comparison of 2-4 rackets across six gameplay metrics
- racket detail, brand, deal, and merchant offer screens
- App Store icon, splash screen, metadata, privacy copy, and EAS profiles

## Local checks on Windows

```powershell
npm install
Copy-Item .env.example .env
npm run lint
npm run typecheck
npm test
npm run doctor
npm run export
```

`EXPO_PUBLIC_API_URL` is optional. Without it the complete bundled catalog is used. Set it to an HTTPS production host to enable pull-to-refresh from `/api/catalog/rackets`. Client code never accepts a production HTTP API URL.

To inspect the universal render in a browser:

```powershell
npm run web
```

## EAS setup (one time)

No local Mac or Xcode installation is required.

```powershell
npx eas-cli@latest login
npx eas-cli@latest init
npx eas-cli@latest credentials --platform ios
```

The first `eas init` writes the Expo `projectId` to app configuration. Keep the configured bundle identifier `com.padelcompare.app` only if that identifier belongs to the Apple team; otherwise change it before creating the App Store Connect record.

Create an App Store Connect app using:

- Name: `PadelCompare`
- Bundle ID: `com.padelcompare.app`
- Primary language: Russian
- SKU: for example `padelcompare-ios`

## Build and submit from Windows

```powershell
npm run build:ios:prod
npm run submit:ios
```

Or build and submit in one command:

```powershell
npm run build:ios:submit
```

EAS builds the `.ipa` on hosted macOS infrastructure and uploads it to App Store Connect. The submitted build then appears in TestFlight.

For unattended submission, configure an App Store Connect API key in EAS credentials. Do not commit `.p8` keys, Apple passwords, `.env`, `.expo`, or `dist`.

## Catalog refresh

The checked-in snapshot is generated from the release Prisma database:

```powershell
npm run mobile:catalog
```

Run the command from the repository root whenever release catalog data changes, then rerun the mobile tests and export.
