# Lumen · Tia Sáng

A calm, strategic puzzle: turn mirrors to guide light beams to their rings.
Twelve chapters, ten chambers each, in English and Vietnamese.

Play: https://huy-vuduc.github.io/lumen/

- `lumen/` – the game (plain HTML, CSS and JS, no build step)
- `scripts/build-lumen-levels.js` – builds `lumen/lumen-levels-data.js` and prints the difficulty table. Chapters already in the file are kept; only new chapters are generated (`node scripts/build-lumen-levels.js`; `--rebuild 3,7` or `--rebuild all` regenerates named chapters)
- `docs/` – design spec and notes

Pushing to `main` deploys `lumen/` to GitHub Pages as the playtest build: it sets `window.LUMEN_PLAYTEST`, which adds the "open every chapter" switch to Settings. The app build has no such switch.
