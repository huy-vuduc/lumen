# Lumen · Tia Sáng

A calm, strategic puzzle: turn mirrors to guide light beams to their rings.
Twelve chapters, ten chambers each, in English and Vietnamese.

Play: https://huy-vuduc.github.io/lumen/

- `lumen/` – the game (plain HTML, CSS and JS, no build step); `lumen/fonts/` holds Be Vietnam Pro so it works offline
- `app/` – native-only sources: `native.js` bundles `native-ads.js` (AdMob) and `native-haptics.js`; `icon/logo.svg` is the app icon source
- `ios/`, `android/` – Capacitor projects, generated once and committed
- `scripts/build-lumen-levels.js` – builds `lumen/lumen-levels-data.js` and prints the difficulty table. Chapters already in the file are kept; only new chapters are generated (`node scripts/build-lumen-levels.js`; `--rebuild 3,7` or `--rebuild all` regenerates named chapters). It then runs `scripts/build-lumen-solutions.js`, which solves new chambers into `lumen/lumen-solutions-data.js` for the "show a mirror" hint
- `docs/` – design spec and notes
- `scripts/build-app-www.js` – builds `www/` for the app: copies `lumen/`, adds the document skeleton and bundles `app/native.js` with esbuild. It is a playtest build unless run as `npm run build -- --release`

Pushing to `main` deploys `lumen/` to GitHub Pages as the playtest build: it sets `window.LUMEN_PLAYTEST`, which adds the "open every chapter" switch to Settings. The app build has the same switch until it is built with `--release`.

Free to play with rewarded ads: each chamber allows 2 retries (one returns every 30 minutes), each chapter 3 mirror hints, and an ad adds one of either. The native app installs `window.LumenAdProvider` (`showRewarded(kind)` resolving to true when watched); without it a stand-in card counts down 3 seconds. The playtest build also has an "unlimited hints and attempts" switch.

## Native apps (Capacitor)

```sh
npm install
npm run sync        # build www/ and copy it into ios/ and android/
npm run ios         # same, then open Xcode
npm run android     # same, then open Android Studio
```

Ads use `@capacitor-community/admob`. The app IDs in `ios/App/App/Info.plist` and `android/app/src/main/res/values/strings.xml`, and the rewarded units in `app/native-ads.js`, are Google's test IDs; replace them with the real ones once the AdMob account is approved. Icons and splash screens come from `app/icon/logo.svg` (the iOS master and Play Store art) and `app/icon/icon-foreground.svg` (the Android adaptive foreground): render both to PNG with sharp (`node -e "require('sharp')('app/icon/logo.svg').resize(1024,1024).png().toFile('app/icon/logo.png')"`, same for the foreground; ImageMagick drops the transformed shapes) and run `npx capacitor-assets generate --assetPath app/icon --iconBackgroundColor '#FCF8F0' --splashBackgroundColor '#F5EFE4' --ios --android`.
