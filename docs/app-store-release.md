# App Store release checklist

How Lumen goes from this repo to the App Store. Written 2026-11-28 for Xcode 26,
bundle id `com.huyvu.lumen`, team `PVDWNW333Q`, version 1.0 (build 1).

## 1. Decide what ships (owner decisions)

- **Ads.** `ios/App/App/Info.plist` (`GADApplicationIdentifier`) and
  `app/native-ads.js` still hold Google's test IDs. Create the app in AdMob, add one
  rewarded unit, paste the app ID into the plist and the unit ID into `native-ads.js`.
  Test ads in a store build earn nothing and AdMob can flag the account.
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
  -destination 'generic/platform=iOS' -archivePath build/Lumen.xcarchive \
  -allowProvisioningUpdates archive
xcodebuild -exportArchive -archivePath build/Lumen.xcarchive \
  -exportOptionsPlist ios/App/export-options.plist -exportPath build/export \
  -allowProvisioningUpdates
```

with `export-options.plist` holding `method = app-store-connect`, `destination = upload`,
`teamID = PVDWNW333Q`. Xcode validates the archive, so a missing privacy manifest or
signing problem shows up here, before review.

## 3. App Store Connect record (once)

appstoreconnect.apple.com > My Apps > + > New App: platform iOS, bundle id
`com.huyvu.lumen` (automatic signing already registered it), SKU `lumen`, primary
language English, then add Vietnamese localization. "Lumen" alone is probably taken:
names must be unique, so use "Lumen – Light Puzzle" or "Lumen: Tia Sáng" (30 chars max)
with subtitle "Turn mirrors, guide the light".

Fill in, per localization:

- Description, keywords (100 chars), support URL and marketing URL (GitHub Pages works).
- Screenshots: iPhone 6.9" set (1320 x 2868) is required; add iPad 13" (2064 x 2752)
  only if iPad stays a target. Take them from the iPhone 17 Pro Max simulator
  (`xcrun simctl io booted screenshot`), not from Igi (iPhone 11 is too small).
- Category Games > Puzzle, secondary Casual. Price Free, all territories.
- Age rating questionnaire: no objectionable content; "unrestricted web access" No;
  gambling No. Ads are declared in App Privacy, not here.
- App Privacy: a privacy policy URL is mandatory. With AdMob + the tracking prompt,
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
