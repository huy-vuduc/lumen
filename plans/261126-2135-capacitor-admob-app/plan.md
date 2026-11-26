# Capacitor shell with AdMob test ads

Status: done 2026-11-26 — verified on iPhone 15 simulator (launch, UMP consent) and Pixel 7 emulator (test rewarded ad earned, interrupted ad returns false and reloads). Owner decision: free game, rewarded ads only, test ad units until the AdMob account is approved.

## Phases

1. Project shell — `package.json` at repo root, Capacitor 8 (`@capacitor/core`, `@capacitor/cli`, `@capacitor/ios`, `@capacitor/android`), `capacitor.config.json` (appId `com.huyvu.lumen`, webDir `www`). `www/`, `ios/`, `android/` build outputs partly generated; only native project sources are committed.
2. Web build — `scripts/build-app-www.js` copies `lumen/` to `www/`, wraps `index.html` in the document skeleton (no playtest flag) and bundles `app/native-ads.js` with esbuild into `www/lumen-native-ads.js`. Fonts move into `lumen/fonts/` so the app works offline (Pages and the artifact use them too).
3. Ads bridge — `app/native-ads.js` installs `window.LumenAdProvider.showRewarded(kind)`: UMP consent, iOS tracking prompt, `AdMob.initialize`, preload a rewarded ad, show on demand, resolve true only when the reward is earned. Google demo rewarded units; app IDs are Google's test IDs in `Info.plist` / `strings.xml`.
4. Verify — iOS simulator launch (`xcodebuild` + `simctl`), Android emulator launch with the rewarded test ad shown through the WebView devtools (`adb forward` + CDP).
5. Docs — README build/run commands, design spec note, memory file.

## Acceptance

- `npm run build && npx cap sync` succeeds from a clean checkout.
- App launches on iPhone simulator and Pixel emulator, home screen renders with the bundled font.
- Watching the Google test rewarded ad on Android grants a hint/retry; cancelling grants nothing.
- Web (Pages, artifact) behaviour unchanged apart from local fonts.

## Out of scope

Real AdMob IDs, store listings, screenshots, signing, privacy policy page, haptics on iOS (navigator.vibrate is a no-op in WKWebView).
