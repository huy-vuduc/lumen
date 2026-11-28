# App Store release checklist

How Lumen goes from this repo to the App Store. Written 2026-11-28 for Xcode 26,
bundle id `com.huyvu.lumen`, team `PVDWNW333Q`, version 1.0 (build 1).

## 1. Decide what ships (owner decisions)

- **Ads** (done 2026-11-28): the real iOS AdMob app ID is in the plist and the rewarded unit in
  `app/native-ads.js`; only `--release` builds use it, playtest builds keep Google's demo unit.
  After the app is live, link the store listing in AdMob so the app gets approved there.
- **Devices and orientation** (done 2026-11-28): iPhone-only (`TARGETED_DEVICE_FAMILY = 1`,
  iPad later) and portrait only, so review never sees the 390-wide board sideways or
  stretched; iPad screenshots are not required.
- **Encryption** (done): `ITSAppUsesNonExemptEncryption = false` in the plist (HTTPS only),
  so App Store Connect skips the export-compliance question.

## 2. Build the store binary

```sh
npm run build -- --release   # no playtest switches
npx cap sync ios
```

Bump `CURRENT_PROJECT_VERSION` (build) on every upload, `MARKETING_VERSION` per release.
Then in Xcode: open `ios/App/App.xcworkspace`, destination "Any iOS Device (arm64)",
Product > Archive, Distribute App > App Store Connect > Upload (automatic signing).

Same from the terminal:

```sh
xcodebuild -project ios/App/App.xcodeproj -scheme App -configuration Release \
  -destination 'generic/platform=iOS' -archivePath ios/build/Lumen.xcarchive \
  -allowProvisioningUpdates archive
xcodebuild -exportArchive -archivePath ios/build/Lumen.xcarchive \
  -exportOptionsPlist ios/App/export-options.plist -exportPath ios/build/export \
  -allowProvisioningUpdates
```

with `export-options.plist` holding `method = app-store-connect`, `destination = upload`,
`teamID = PVDWNW333Q`. Xcode validates the archive, so a missing privacy manifest or
signing problem shows up here, before review.

## 3. App Store Connect record (once)

First register the bundle id: developer.apple.com > Certificates, Identifiers & Profiles >
Identifiers > + > App IDs > App, explicit `com.huyvu.lumen`, no capabilities. Xcode's
automatic dev signing used the wildcard profile, so the explicit App ID did not exist and
App Store Connect's Bundle ID list could not offer it. Then appstoreconnect.apple.com >
My Apps > + > New App: platform iOS, that bundle id, SKU `lumen`, primary language
English, then add Vietnamese localization. "Lumen" alone is probably taken:
names must be unique, so use "Lumen – Light Puzzle" or "Lumen: Tia Sáng" (30 chars max)
with subtitle "Turn mirrors, guide the light".

Fill in, per localization:

- Description, keywords (100 chars), support URL and marketing URL (GitHub Pages works).
- Screenshots: App Store Connect's "iPhone with Dynamic Island (medium display)" tab takes
  1206 x 2622: `app/store/ios-6.3/`, captured from the web build at 402 x 874 with device
  pixel ratio 3 and safe areas 62 top, 34 bottom. `app/store/ios-6.9/` (1320 x 2868) is the
  large-display set if a tab asks for it. Igi (iPhone 11) is too small to capture from. iPad 13" (2064 x 2752) only
  if iPad becomes a target.
- Category Games > Puzzle, secondary Casual. Price Free, all territories.
- Age rating questionnaire: no objectionable content; "unrestricted web access" No;
  gambling No. Ads are declared in App Privacy, not here.
- App Privacy: privacy policy URL https://huy-vuduc.github.io/lumen/privacy.html
  (`lumen/privacy.html`, English and Vietnamese; contact is the GitHub issues page). With AdMob + the tracking prompt,
  declare Identifiers (Device ID), Usage Data (Advertising Data, Product Interaction) and
  Diagnostics (Crash, Performance), collected by third parties, used for tracking when
  the player allows it. Nothing is collected if ads are removed.

## 4. TestFlight, then review

The uploaded build appears under TestFlight in 10 to 30 minutes. Add yourself as an
internal tester and install on Igi through the TestFlight app: this is the first run of
the release build with real ads and without the playtest switches.

Then on the version page: pick the build, set release to "Manually release", add review
notes ("Free puzzle game. Ads are optional rewarded videos; no account needed."), and
Submit for Review. First reviews take 1 to 3 days. Typical rejections for this kind of
app: a privacy label that does not match the SDK, the tracking prompt appearing before
any explanation, or landscape screens that break.

## 5. After approval

Release manually, then watch Crashes in Xcode Organizer and ratings in App Store
Connect. Each later release repeats sections 2 and 4 with a higher build number.
