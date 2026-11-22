# Lumen app from the Claude Design canvas

Status: first playable build published 2026-11-18 (https://claude.ai/artifact/6oiABJY1VNebPshMvt9aHJ). All five phases done. Phase 6 (2026-11-18): five new mechanics and 12 chapters with a steeper difficulty ramp, verified by `scripts/verify-lumen-levels.js`.
Spec: `docs/design-spec.md`. Prototype to supersede: `light-flow/`.

## Goal

A playable web app (vanilla HTML/CSS/JS, no build step) matching the design: home, chapter map,
level grid, gameplay with fog and all four states, settings, bilingual EN/VI, progress saved locally.

## Phases

1. Engine and level generator: reuse beam tracing, add seeded procedural generation, verify every
   generated level is solvable and not solved at start. Node script checks all 60 levels.
2. Gameplay screen: SVG board with pieces, beams, fog, counter, restart, hint, solved and
   out-of-rotations states. Motion per spec.
3. Menus: home, chapters, levels, settings. Hash router. Progress and settings in localStorage.
4. i18n: EN/VI string table, language switch in settings.
5. Publish as artifact for review on a phone.
6. Mechanics and ramp: stone mirrors, splitter, dark rings, filters, portals; 12 chapters, minimum
   rotations 1 to 6, spare rotations fall to zero late in each chapter from chapter 2 on.

## Decisions

- Files stay classic scripts (no ES modules) so `index.html` opens from disk and publishes as an artifact.
- Levels are generated from a seed per chapter and chamber, so content is stable without hand data.
- Next chapter unlocks after 7 of 10 chambers in the current one.
- Sound is a small WebAudio blip; haptics use `navigator.vibrate` where available.

## Acceptance

- All 120 levels verified solvable by `scripts/verify-lumen-levels.js`.
- Board tap targets are whole cells; 7 x 7 fits at 360 px wide.
- Each gameplay state matches the artboards: fresh, mid, solved, out of rotations, hint, rule line.
