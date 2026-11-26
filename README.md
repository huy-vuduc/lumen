# Lumen · Tia Sáng

A calm, strategic puzzle: turn mirrors to guide light beams to their rings.
Twelve chapters, ten chambers each, in English and Vietnamese.

Play: https://huy-vuduc.github.io/lumen/

- `lumen/` – the game (plain HTML, CSS and JS, no build step)
- `scripts/build-lumen-levels.js` – builds `lumen/lumen-levels-data.js` and prints the difficulty table. Chapters already in the file are kept; only new chapters are generated (`node scripts/build-lumen-levels.js`; `--rebuild 3,7` or `--rebuild all` regenerates named chapters). It then runs `scripts/build-lumen-solutions.js`, which solves new chambers into `lumen/lumen-solutions-data.js` for the "show a mirror" hint
- `docs/` – design spec and notes

Pushing to `main` deploys `lumen/` to GitHub Pages as the playtest build: it sets `window.LUMEN_PLAYTEST`, which adds the "open every chapter" switch to Settings. The app build has no such switch.

Free to play with rewarded ads: each chamber allows 2 retries (one returns every 30 minutes), each chapter 3 mirror hints, and an ad adds one of either. The native app installs `window.LumenAdProvider` (`showRewarded(kind)` resolving to true when watched); without it a stand-in card counts down 3 seconds. The playtest build also has an "unlimited hints and attempts" switch.
