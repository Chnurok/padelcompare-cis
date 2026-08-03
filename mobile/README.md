# PadelCompare mobile

Native Expo/React Native client prepared for Android/Google Play first, with iOS/App Store profiles kept ready for the next release.

## Included in v1

- native Home, Catalog, Finder, and Saved tabs
- offline release snapshot: 150 rackets, 9 brands, and store offers
- catalog search plus brand and shape filters
- explainable finder based on budget, priority, skill level, and feel
- persistent shortlist stored locally on the device
- comparison of 2–4 rackets across six gameplay metrics
- racket detail, brand, deal, and merchant offer screens
- Android adaptive/monochrome icons, splash screen, Play listing copy, and EAS profiles
- iOS icon, App Store metadata, and EAS profiles for the later iPhone release

## Local checks on Windows

```powershell
npm install
Copy-Item .env.example .env
npm run lint
npm run typecheck
npm test
npm run doctor
npm run export:android
```

`EXPO_PUBLIC_API_URL` is optional. Without it the complete bundled catalog is used. Set it to an HTTPS production host to enable pull-to-refresh from `/api/catalog/rackets`. Client code rejects a production HTTP API URL.

To inspect the universal render in a browser:

```powershell
npm run web
```

## Google Play setup (one time)

No Android Studio or local Mac is required for a signed Play build. From this directory:

```powershell
npx eas-cli@latest login
npx eas-cli@latest init
```

The first `eas init` writes the Expo `projectId` to app configuration. Keep `com.padelcompare.app` only if this is the final package name: Google Play does not allow it to change after the first artifact upload.

Create the signed artifacts in EAS:

```powershell
npm run build:android:preview  # APK for direct device QA
npm run build:android:prod     # AAB for Play Console
```

The first `.aab` must be uploaded manually to an Internal testing release in Play Console. After that, EAS Submit can automate future uploads:

```powershell
npm run submit:android:internal
npm run submit:android:production
```

The production submission stays in `draft` until it is reviewed and released in Play Console. Full store setup, test requirements, privacy answers, and listing copy are in [`google-play/LAUNCH_CHECKLIST.md`](google-play/LAUNCH_CHECKLIST.md).

Do not commit Google service-account JSON, Android keystores, `.env`, `.expo`, or export/build output.

## iOS later

EAS also builds the `.ipa` on hosted macOS infrastructure from Windows:

```powershell
npx eas-cli@latest credentials --platform ios
npm run build:ios:prod
npm run submit:ios
```

Create the App Store Connect record with bundle ID `com.padelcompare.app` before submission.

## Catalog refresh

The checked-in snapshot is generated from the release Prisma database:

```powershell
npm run mobile:catalog
```

Run the command from the repository root whenever release catalog data changes, then rerun the mobile tests and Android export.
