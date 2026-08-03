# Google Play Data safety draft

This is the release-team worksheet for the current native client. Re-check it in Play Console whenever analytics, authentication, advertising, payments, crash reporting, or a new SDK is added.

## Current v1 behavior

- no account or sign-in
- no advertising SDK
- no analytics or crash-reporting SDK in the native client
- no camera, location, contacts, microphone, photo, or storage permission requested
- saved rackets and comparison state stay in local device storage
- the bundled catalog works offline
- optional HTTPS catalog refresh only performs a public `GET` request
- outbound merchant links open in the system browser; the merchant's own privacy terms then apply

## Suggested Play Console answers

- Does the app collect or share any required user data categories? **No**, for the code in this release.
- Is all user data encrypted in transit? **Yes** for optional remote catalog refresh; production code rejects non-HTTPS API URLs.
- Can users request deletion? **Not applicable** because no account-linked user data is collected by the native client. Users can clear local data by removing app storage or uninstalling.
- Ads: **No**. Affiliate merchant links are disclosed in the listing and privacy policy, but there is no ad SDK.

The final declaration is the publisher's responsibility and must match the deployed backend, store integrations, and SDK inventory at submission time.
