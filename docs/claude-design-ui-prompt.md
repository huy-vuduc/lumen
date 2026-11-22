# Claude Design prompt: Tia Sáng / Lumen UI

Decided with the owner on 2026-11-18. Paste the block below into Claude Design as the first message.
Answers that shaped it: light pastel minimal, portrait phone first, mysterious exploration mood,
full screen set, fog that clears where light travels plus chapters, 3 palette proposals,
slightly raised objects with soft shadows, bilingual with English first.

---

Design the complete mobile UI for a puzzle game called **Lumen** (Vietnamese title: *Tia Sáng*).

## What the game is

A calm logic puzzle. The board is a square grid. Light sources emit coloured beams (red, green, blue). The player taps mirrors to rotate them 90 degrees so beams reach target rings of the matching colour. Two beams of different colours landing on the same target mix additively (red + blue = magenta, red + green = yellow, green + blue = cyan, all three = white). The player has a limited number of rotations per level, so they must plan the path before tapping. That constraint is the whole point: tapping is trivial, thinking is the game.

One action only: tap a mirror. No drag, no menus inside the board. The UI must stay out of the way.

## Mood and style

- Light, minimal, pastel. Not neon, not dark mode. The board feels like soft paper or frosted glass in daylight.
- Mysterious and exploratory rather than playful or arcade. The player is slowly lighting up a quiet world.
- Mystery is shown two ways:
  1. **Fog on the board.** Each level starts covered by a soft translucent fog. Where a beam travels, the fog clears along its path and nearby cells become crisp. Mirrors and targets must remain visible enough through the fog that the player can plan, so the fog is atmospheric, never a hidden-information mechanic.
  2. **Chapters.** Levels are grouped in chapters of 10. Each chapter has its own pastel tint and introduces one new rule (walls, colour mixing, beam splitters later). The level-select screen is a map of chapters where future chapters sit in fog and the current one is lit.
- Objects (mirrors, sources, targets, walls) are flat shapes with a slight raised look: subtle thickness and a soft, wide, low-opacity shadow, like glass tiles resting on paper. No hard drop shadows, no gloss highlights.
- Beams are the only highly saturated elements. They glow softly and must stay readable on every pastel background.
- Typography: a rounded geometric sans with excellent Vietnamese diacritic support (for example Be Vietnam Pro or Nunito). Few words on screen. Uppercase micro-labels with letter-spacing for level and counter.
- Motion is slow and quiet: beams fade in along their path, fog dissolves, mirrors rotate with a gentle ease. Nothing bounces.

## Colour

Propose **three palette options** as separate artboards and name each one. Each palette needs: page background, board surface, fog tint, object surface, object shadow, primary text, muted text, one accent for buttons, and the three beam colours plus the four mixed colours. Keep beam colours saturated and consistent across all three palettes so colour mixing reads the same everywhere. Check that red and green beams remain distinguishable for colour-blind players by also differing in brightness.

Suggested directions for the three options, but you may improve on them:
1. Warm cream and soft grey (paper-like, beams are the only colour).
2. Lavender and mint (cool, slightly dreamlike).
3. Pale sand and dusty blue (dawn light).

## Screens to design (portrait phone, 390 x 844, safe areas respected)

1. **Home**: title, a single primary button "Play" that continues the last level, a quiet secondary link to chapters and to settings. Background hints at the fog and a faint beam.
2. **Chapter map**: vertical scroll of chapters. Completed chapters are lit, the current one is partly lit, future ones are in fog with their number barely visible. Each chapter shows its name and progress such as 7/10.
3. **Level grid inside a chapter**: 10 level tiles, completed ones show a small lit mark; locked ones are foggy.
4. **Gameplay**, the most important screen. Show four states as separate artboards:
   - Fresh level: fog covering most of the board, sources glowing, mirrors and targets visible, counter "4 rotations left".
   - Mid-solve: two beams routed, fog cleared along their paths, one target lit, counter "1 rotation left" with a gentle warning colour.
   - Solved: all targets lit, fog fully cleared, a quiet success state with "Next" as the only primary action. No confetti, no stars. A small line of text such as "Chamber 7 lit."
   - Out of rotations: beams still shown, a soft overlay with "Out of rotations" and a single "Try again" button. No shame, no red flash.
   The gameplay layout: level label and chapter name at the top, square board centred, rotation counter directly under the board, a restart icon button and a hint icon button at the bottom. Nothing else.
5. **Settings**: sound on/off, haptics on/off, language (English / Tiếng Việt), colour-blind assist toggle, reset progress. Plain list.
6. **Components sheet**: the board pieces at large size so they can be rebuilt in code: mirror in both orientations, light source for each of the three colours with direction indicator, target ring empty / lit correct / lit wrong colour, wall tile, fog tile at three opacities, beam segment with glow for all seven colours, primary button, secondary button, icon buttons, counter in normal and warning state.

## Constraints

- The board must survive on a 360 px wide phone: a 7 x 7 grid with a tappable mirror of at least 44 x 44 pt.
- All text must be short enough to also fit in Vietnamese, which is roughly 20 percent longer than English. Show English in the mockups and add one Vietnamese version of the gameplay screen to prove it fits.
- Keep contrast of body text against pastel backgrounds at least 4.5:1.
- No ads, no coin shops, no mascot characters.
- Deliver as artboards grouped by screen, plus the three palette boards and the components sheet, with colour values and font sizes annotated so a developer can build it.
