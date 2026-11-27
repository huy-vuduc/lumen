# Lumen (Tia Sáng) design spec

Extracted 2026-11-18 from the Claude Design canvas "Lumen (Tia Sáng) Mobile UI"
(https://claude.ai/artifact/4oCcRreSSN2a2UMyYL4DxV). All screens use Palette C "First Light".

## Palette C · First Light

| Token | Value |
|---|---|
| Page background | #F5EFE4 |
| Board surface | #FCF8F0 (chapter tinted, see below) |
| Fog tint | #AFBCCB (chapter 3 board uses #B1B6D0); deepened from #CBD5E0 / #CCD0E4 on 2026-11-20 for contrast |
| Object surface | #FFFFFF |
| Object shadow | #3F5670 at 16% |
| Primary text | #2B3542 |
| Muted text | #5A6676 |
| Accent (buttons) | #44648A |
| Warning text (1 rotation left) | #935405 |

Chapter tints (board and card backgrounds): 1 #FCF8F0, 2 #F2F9F5, 3 #F7F5FB, 4 #F1F6FB, 5 #FDF5EC, 6 #FBF3F5.

Beams, identical in every palette: red #D0203F, green #0F9E5E, blue #2F6BF0, magenta #C02BB8,
yellow #DDA100 (1 px keyline #8F6A00), cyan #0C9DB3, white #FFFFFF (1 px keyline #5B6170).
Red is darker than green on purpose (luminance 0.15 vs 0.25).

## Type · Be Vietnam Pro

| Role | Size/line | Weight | Notes |
|---|---|---|---|
| Title | 52/60 | 300 | +0.16em tracking |
| Screen title | 28/36 | 500 | |
| Card title | 20/26 | 500 | |
| Status line | 18/26 | 500 | "Chamber 7 lit." |
| Counter numeral | 34/36 | 500 | tabular |
| Button | 17/24 | 600 | +0.02em |
| Body | 16/24 | 400 | |
| Secondary button | 15/22 | 500 | |
| Caption | 13/18 | 400 | muted |
| Micro-label | 11/16 | 600 | caps, +0.14em |

## Layout (390 x 844 reference)

- Safe areas 47 top, 34 bottom. Side margin 16. Every control 44 or larger.
- Header 72 high: micro-label "Chapter 3 · Blended Light" over "Chamber 7". Tapping it goes back to the level grid.
- Board = width − 32, square, radius 28, padding 4. Cell = (width − 40) / 7: 50 at 390 wide, 45.7 at 360.
  The whole cell is the tap target. Board shadow 0 18 40 at 10% plus 1 px inset edge at 7%.
- Footer row 96 high above the safe area: restart (52 circle, white, shadow 0 6 16 at 16% + 0 1.5 0),
  counter in the middle (numeral, micro-label, 6 px pips with 6 gap, one per rotation), hint (52 circle).
- Solved: footer becomes status line + full-width primary button "Next".
- Out of rotations: page overlay rgba(245,239,228,0.4), white card radius 28, padding 26 24 24,
  shadow 0 24 60 at 20%, title 22/30, caption, primary button "Try again".
- Hint: popover card above the footer titled "This chamber" with the mix formula chips. The bulb toggles it and a tap anywhere outside closes it (2026-11-27).
- Primary button: height 56, radius 28, fill accent, white label, shadow 0 10 24 at 20%. One per screen.
- Cards radius 24, level tiles radius 22, tile height 100, two columns, gap 14.

## Board pieces (fractions of a cell)

- Mirror: tile 0.8, radius 0.22, surface white, bar 0.6 x 0.1 in #2B3542, rotated −45° for "/" and +45° for "\".
  In dense fog: surface #E8ECF0, bar #6A747F, no soft shadow, 1.5 px edge, drawn above the fog.
- Source: disc 0.68 white, core 0.32 in beam colour with glow 0 0 10 2 at 40%. Never fogged.
  The disc sits under the beam layer and the core above it, so the beam leaves the core and runs over the disc (2026-11-20).
  The design's nub (0.2 x 0.14 along the emit direction) was dropped on 2026-11-19: the beam always covers it and the width step read as a glitch.
- Target empty: ring 0.68, stroke 0.08, dusty tone of the needed colour (magenta #9A5698).
  Lit correct: ring and core in the full colour, white fill, halo 0 0 18 4 at 38%, fades in 500 ms.
  Lit wrong: ring stays dusty, small core 0.2 shows the arriving colour.
- Wall (2026-11-26): stone block filling the whole cell, radius 0.1, fill #6E7786, foot shadow 0 2.5 0 at 35%; a pale facet (white 11%), a crack and a dark foot band make it rock, and neighbouring blocks bridge into one wall. A beam ending on stone leaves a blurred smudge of its colour on the face (0.7 opacity, scaled in over 240 ms on arrival).
  Was a 0.88 tile in #C3CCD6, which read like a stone mirror or fog.
- Beam: core 0.12, round caps, glow 0 0 10 1.5 at 42%. Mitred at the mirror bar.
- Fog: 96% on cells 2+ steps from any beam, 55% beside a beam, 0 on the path (was 86 / 38). Layer blurred 7 px.
  Each cell clears when the beam head reaches it (or its lit neighbour); fog thickens again at once.

## Motion

Beam draw 130 ms per cell, linear, each segment starting when the head reaches it (slowed from 80 ms ease-out on 2026-11-20 so a rerouted beam can be followed). A ring lights, and the solved panel appears, only when the beam head arrives. Fog dissolve 900 ms following the beam head. Mirror turn 320 ms
cubic-bezier(0.4, 0, 0.2, 1). Target lighting 500 ms fade. Respect prefers-reduced-motion.

## Colour-blind assist

The design's dash patterns were dropped on 2026-11-20 at the owner's request: dashed target
rings read as portals. Beams and rings are always solid; there is no setting.

## Home title sequence

Ported on 2026-11-24 from the Home artboard (`lumen-home-intro.css` / `.js`): a 16 s loop where red,
blue and green sources light in turn, each beam bends at a mirror that turns into place, the three
meet under the title, a white bloom reveals "Lumen" through a mask that grows with the bloom itself (both 30 to 420 px, the word kept inside the bloom, 2026-11-26), the subtitle follows
and the fog dims to 30% behind the title. Pieces are placed relative to the title centre so the
scene holds on any phone height. Hidden under prefers-reduced-motion.

## Vietnamese strings seen in the design

Chương 3 · Hoà Sắc, Phòng 7, Lượt xoay còn lại, Đỏ + Xanh dương = Hồng tím.

## Added pieces (not in the original canvas, drawn in the same language)

Added 2026-11-18 for chapters 4 to 12. Chapter tints 7 to 12: #F3F7F2, #F6F3EE, #EFF5F7, #F8F2F0, #F2F2F8, #FBF6EA.

- Stone mirror (2026-11-26): mirror tile filled #E6EAF0 with a 1.5 px #AEB8C6 outline and a grey #7C8696 bar; never turns, no tap area. Was the wall's grey, which made it look like a wall.
- Splitter: white tile with two thin accent bars (0.6 x 0.05 cell, 0.13 apart) along the mirror line. Beam passes straight and also reflects.
- Filter: 0.72 cell square, radius 0.2, beam colour at 22% fill with a 2 px stroke; a beam keeps only that colour (white source becomes it).
- Portal: dashed ring 0.56 cell, stroke 3, with a 4 unit dot; pairs share a colour (accent #44648A, then #9A5698). Beam leaves the other door in the same direction.
- Dark ring: ring in #5B6170 on #E8ECF0 fill with a short diagonal mark; must receive no beam. A beam that hits it shows the arriving colour and hides the mark.
- White source: core carries the 1 px #5B6170 keyline like the white beam.

## Chapters and difficulty

12 chapters of 10 chambers, generated once by `scripts/build-lumen-levels.js` into
`lumen/lumen-levels-data.js` (the game never runs the generator or the solver). The
script keeps every chapter already in that file and only generates missing ones, so a
new chapter or a generator change never alters chambers players have seen; `--rebuild`
with chapter numbers is the only way to regenerate an existing chapter. Player progress
is stored per `chapter-chamber` key and does not depend on the chapter count.
The "open every chapter" switch exists only in the playtest build (GitHub Pages sets
`window.LUMEN_PLAYTEST`, and so does the app build until `--release`); a release build hides it and ignores a saved value.

## Hints, retries and ads (2026-11-26)

The game is free with rewarded ads only: no interstitials, so the calm pace stays intact.
- Retries: each chamber allows 2 retries. One is spent the moment a run ends: when the
  rotations run out or the player restarts after at least one turn (restarting an
  untouched chamber is free). A run that ends with none left leaves the chamber owing
  one, and it reopens on the out card until a refill or an ad settles the debt, so
  leaving and coming back cannot skip the limit. One retry returns every 30 minutes,
  never above 2; solving the chamber clears its counter.
- Hints: the hint popup keeps the free goal and mechanic lines and adds "Show a mirror",
  3 per chapter: one mirror whose orientation still differs from the stored solution
  pulses with an accent outline for about 2.6 s. With none left the button becomes
  "Watch an ad for a hint"; the ad adds one hint to the counter (2026-11-27: it is no
  longer spent automatically, so the reward is visible when the ad closes). Solutions come from `lumen-solutions-data.js`, built by
  `scripts/build-lumen-solutions.js` from the level data (so old chambers stay untouched).
- Ads: `lumen-rewards.js` asks `window.LumenAdProvider.showRewarded(kind)` when the
  native app installs one (`app/native-ads.js`: Google UMP consent, iOS tracking prompt,
  then AdMob with one rewarded ad preloaded; the reward counts only when the plugin
  resolves, closing the ad early gives nothing); otherwise a stand-in card counts down 3 seconds (Cancel gives
  nothing). Counters live in the saved state under `economy`; the playtest "unlimited"
  switch lifts both limits and hides the retry count.
- Header shows "n retries" under the chamber name; the out card has a Back link so a
  player who declines the ad can leave. Chapter 1
teaches with 1 to 3 rotations. From chapter 2 every chamber is a real puzzle: minimum
rotations climb 3 to 5 (chapter 2), 4 to 7 (3 and 4), 4 to 8 (5 to 8), 6 to 9 (9 and 10),
8 to 10 (11) and 9 to 10 (12), among 5 to 21 rotatable mirrors. Boards grow from 7 x 7
(chapter 2) to 8 x 8 (3 to 7) and 9 x 9 (8 to 12); every beam turns up to four times. The
spare rotation disappears from chamber 7 (chapters 2 to 5), chamber 5 (6 to 8), chamber 3
(9 to 11), and chapter 12 never has one. Mechanics arrive one per chapter: walls (2),
mixing (3), stone mirrors (4), splitter (5), dark rings (6), filters (7), portals (8);
9 to 12 combine them.

## Native shell (2026-11-26)

Capacitor 8 at the repo root wraps `lumen/` for iOS and Android (`npm run sync`). The
web build stays bundler-free; only `app/native-ads.js` is bundled, by esbuild, into
`www/lumen-native-ads.js`. Be Vietnam Pro is served from `lumen/fonts/` (latin and
Vietnamese subsets, 300 to 600) so the app and the site work offline. The app icon (2026-11-27, from the "App icon" artboard, concept "Elbow") is a
blue #2F6BF0 beam that meets the mirror bar and turns, the turn drawing an L, flat on the
chapter 1 board tone #FCF8F0 with no baked corners (`app/icon/logo.svg`); the Android
adaptive foreground is the same glyph scaled 1.2x on a transparent layer so it fills the
safe zone once the generator insets it (`app/icon/icon-foreground.svg`). AdMob IDs
are Google's test IDs until the account is approved. Haptics go through `@capacitor/haptics` (`app/native-haptics.js`: light impact on a
tap, success and warning notifications) because WKWebView has no `navigator.vibrate`.
Screens pad for the notch and home indicator with `env(safe-area-inset-*)`; the game
header sits just above the board (2026-11-27).
