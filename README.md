# Lumen · Tia Sáng

A calm, strategic puzzle: turn mirrors to guide light beams to their rings.
Twelve chapters, ten chambers each, in English and Vietnamese.

Play: https://huy-vuduc.github.io/lumen/

- `lumen/` – the game (plain HTML, CSS and JS, no build step)
- `scripts/build-lumen-levels.js` – generates the 120 chambers into `lumen/lumen-levels-data.js` and prints the difficulty table (`node scripts/build-lumen-levels.js --write`; without `--write` it checks the file is current)
- `docs/` – design spec and notes

Pushing to `main` deploys `lumen/` to GitHub Pages.
