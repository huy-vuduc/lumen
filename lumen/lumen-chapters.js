// Chapter definitions for Lumen: names, tints, the rule each introduces and
// how puzzle difficulty grows across the ten chambers of a chapter.
// Built levels live in lumen-levels-data.js (see scripts/build-lumen-levels.js).
// Colors are bitmasks: 1 red, 2 green, 4 blue, 7 white.
// Spec fields are read by LumenLevelGenerator: size, targets, turns, walls,
// decoys, fixedDecoys, fixed, filters, portals, dark, scramble, minMoves, extraMoves.
const LumenChapters = (() => {
  const R = 1, G = 2, B = 4;
  const PRIMARIES = [R, G, B];
  const PAIRS = [[R, B], [R, G], [G, B]];
  const pick = (arr, i) => arr[i % arr.length];
  // Linear ramp from a (chamber 1) to b (chamber 10), rounded.
  const ramp = (i, a, b) => Math.round(a + ((b - a) * i) / 9);
  // Spare rotations: one until chamber `from`, none after it.
  const spare = (i, from) => (i >= from ? 0 : 1);
  // Target lists, from one ring to a white ring plus a two-colour ring.
  const one = (i, order = PRIMARIES) => [{ colors: [pick(order, i)] }];
  const two = (i) => [{ colors: [pick(PRIMARIES, i)] }, { colors: [pick([B, R, G], i)] }];
  const pairOne = (i) => [{ colors: pick(PAIRS, i) }, { colors: [pick([G, B, R], i)] }];
  const pairPair = (i) => [{ colors: pick(PAIRS, i) }, { colors: pick(PAIRS, i + 1) }];
  const splitOne = (i) => [{ split: pick(PRIMARIES, i) }, { colors: [pick([G, B, R], i)] }];
  const splitPair = (i) => [{ split: pick(PRIMARIES, i) }, { colors: pick(PAIRS, i) }];
  const whiteOne = (i) => [{ colors: [R, G, B] }, { colors: [pick([B, R, G], i)] }];
  const splitWhite = (i) => [{ split: pick(PRIMARIES, i) }, { colors: [R, G, B] }];

  // Chapter 1 teaches; from chapter 2 every chamber needs several exact
  // rotations among many mirrors, boards grow to 9 x 9 and the spare rotation
  // disappears earlier in each chapter until chapter 12 has none.
  const CHAPTERS = [
    {
      id: 1, tint: '#FCF8F0', fog: '#AFBCCB',
      name: { en: 'First Light', vi: 'Ánh Đầu' }, rule: { en: 'Mirrors', vi: 'Gương' },
      ruleLine: { en: 'Tap a mirror to turn it.', vi: 'Chạm vào gương để xoay.' },
      spec: (i) => ({ size: ramp(i, 5, 6), targets: one(i), turns: ramp(i, 1, 3), decoys: i >= 6 ? 1 : 0, scramble: ramp(i, 1, 3), minMoves: ramp(i, 1, 3), extraMoves: i < 5 ? 2 : 1 }),
    },
    {
      id: 2, tint: '#F2F9F5', fog: '#AFBCCB',
      name: { en: 'Stone Walls', vi: 'Tường Đá' }, rule: { en: 'Walls', vi: 'Tường' },
      ruleLine: { en: 'Beams stop at walls.', vi: 'Tia sáng dừng lại ở tường.' },
      spec: (i) => ({ size: i >= 4 ? 8 : 7, targets: i >= 6 ? two(i) : one(i, [B, R, G]), turns: i >= 4 ? 4 : 3, walls: ramp(i, 4, 8), decoys: ramp(i, 2, 4), scramble: i >= 6 ? 5 : ramp(i, 3, 4), minMoves: i >= 6 ? 5 : ramp(i, 3, 4), extraMoves: spare(i, 6) }),
    },
    {
      id: 3, tint: '#F7F5FB', fog: '#B1B6D0', formula: true,
      name: { en: 'Blended Light', vi: 'Hoà Sắc' }, rule: { en: 'Mixing', vi: 'Pha màu' },
      ruleLine: { en: 'Two colours on one ring blend.', vi: 'Hai màu trên một vòng sẽ hoà lại.' },
      spec: (i) => ({ size: 8, targets: i >= 3 ? pairOne(i) : [{ colors: pick(PAIRS, i) }], turns: i >= 5 ? 4 : 3, walls: ramp(i, 3, 5), decoys: ramp(i, 2, 4), scramble: ramp(i, 4, 7), minMoves: ramp(i, 4, 7), extraMoves: spare(i, 6) }),
    },
    {
      id: 4, tint: '#F1F6FB', fog: '#AFBCCB',
      name: { en: 'Set in Stone', vi: 'Gương Đá' }, rule: { en: 'Fixed mirrors', vi: 'Gương cố định' },
      ruleLine: { en: 'Stone mirrors cannot turn.', vi: 'Gương đá không xoay được.' },
      spec: (i) => ({ size: 8, targets: i >= 7 ? pairOne(i) : i >= 2 ? two(i) : one(i), turns: 4, fixed: ramp(i, 1, 3), fixedDecoys: ramp(i, 2, 4), decoys: ramp(i, 2, 4), walls: 3, scramble: ramp(i, 4, 7), minMoves: ramp(i, 4, 7), extraMoves: spare(i, 6) }),
    },
    {
      id: 5, tint: '#FDF5EC', fog: '#AFBCCB',
      name: { en: 'Two Ways', vi: 'Hai Ngả' }, rule: { en: 'Splitter', vi: 'Bộ tách' },
      ruleLine: { en: 'A splitter sends the beam two ways.', vi: 'Bộ tách chia tia thành hai ngả.' },
      spec: (i) => ({ size: 8, targets: i >= 7 ? splitPair(i) : i >= 3 ? splitOne(i) : [{ split: pick(PRIMARIES, i) }], turns: 4, walls: 3, decoys: ramp(i, 3, 4), fixed: ramp(i, 1, 2), scramble: ramp(i, 4, 8), minMoves: ramp(i, 4, 8), extraMoves: spare(i, 6) }),
    },
    {
      id: 6, tint: '#FBF3F5', fog: '#AFBCCB',
      name: { en: 'Keep It Dark', vi: 'Giữ Tối' }, rule: { en: 'Dark rings', vi: 'Vòng tối' },
      ruleLine: { en: 'Grey rings must stay dark.', vi: 'Vòng xám phải được giữ tối.' },
      spec: (i) => ({ size: 8, targets: i >= 4 ? pairOne(i) : two(i), turns: 4, dark: ramp(i, 2, 4), decoys: ramp(i, 3, 4), fixed: ramp(i, 1, 2), walls: 3, scramble: ramp(i, 5, 8), minMoves: ramp(i, 5, 8), extraMoves: spare(i, 4) }),
    },
    {
      id: 7, tint: '#F3F7F2', fog: '#AFBCCB',
      name: { en: 'Clear Glass', vi: 'Kính Lọc' }, rule: { en: 'Filters', vi: 'Kính lọc' },
      ruleLine: { en: 'A white beam keeps only the filter’s colour.', vi: 'Tia trắng đi qua kính chỉ giữ lại màu của kính.' },
      spec: (i) => ({ size: 8, targets: i >= 5 ? pairPair(i) : pairOne(i), turns: 4, filters: ramp(i, 2, 3), dark: ramp(i, 1, 2), decoys: 4, fixed: ramp(i, 1, 2), walls: 3, scramble: ramp(i, 5, 8), minMoves: ramp(i, 5, 8), extraMoves: spare(i, 4) }),
    },
    {
      id: 8, tint: '#F6F3EE', fog: '#AFBCCB',
      name: { en: 'Hidden Doors', vi: 'Cửa Ẩn' }, rule: { en: 'Portals', vi: 'Cổng' },
      ruleLine: { en: 'A beam entering one door leaves the other.', vi: 'Tia vào cổng này sẽ ra ở cổng kia.' },
      spec: (i) => ({ size: i >= 3 ? 9 : 8, targets: i >= 7 ? pairPair(i) : i >= 3 ? pairOne(i) : two(i), turns: 4, portals: ramp(i, 2, 3), dark: ramp(i, 1, 2), decoys: 4, fixed: ramp(i, 1, 2), walls: 3, scramble: ramp(i, 6, 8), minMoves: ramp(i, 6, 8), extraMoves: spare(i, 4) }),
    },
    {
      id: 9, tint: '#EFF5F7', fog: '#AFBCCB',
      name: { en: 'Crossed Beams', vi: 'Giao Nhau' }, rule: { en: 'Combined', vi: 'Tổng hợp' },
      ruleLine: { en: 'Rings, splitters and stone mirrors together.', vi: 'Vòng, bộ tách và gương đá cùng lúc.' },
      spec: (i) => ({ size: 9, targets: i >= 5 ? [...splitPair(i), ...one(i, [G, B, R])] : splitPair(i), turns: 4, fixed: ramp(i, 2, 3), fixedDecoys: 2, dark: ramp(i, 1, 3), walls: 4, decoys: 4, scramble: ramp(i, 6, 9), minMoves: ramp(i, 6, 9), extraMoves: spare(i, 2) }),
    },
    {
      id: 10, tint: '#F8F2F0', fog: '#AFBCCB', formula: true,
      name: { en: 'Three Lights', vi: 'Ba Nguồn' }, rule: { en: 'White', vi: 'Trắng' },
      ruleLine: { en: 'All three colours make white.', vi: 'Ba màu gộp lại thành trắng.' },
      spec: (i) => ({ size: 9, targets: i % 2 === 0 ? whiteOne(i) : pairPair(i), turns: 4, filters: ramp(i, 2, 3), dark: ramp(i, 2, 3), decoys: 4, fixed: 2, walls: 3, scramble: ramp(i, 7, 9), minMoves: ramp(i, 7, 9), extraMoves: spare(i, 2) }),
    },
    {
      id: 11, tint: '#F2F2F8', fog: '#AFBCCB',
      name: { en: 'Labyrinth', vi: 'Mê Cung' }, rule: { en: 'All rules', vi: 'Mọi luật' },
      ruleLine: { en: 'Every rule at once.', vi: 'Mọi luật cùng lúc.' },
      spec: (i) => ({ size: 9, targets: i >= 5 ? splitWhite(i) : [...splitPair(i), ...one(i, [G, B, R])], turns: 4, portals: 2, fixed: 2, dark: ramp(i, 2, 3), filters: 2, decoys: ramp(i, 4, 5), walls: 4, scramble: ramp(i, 8, 10), minMoves: ramp(i, 8, 10), extraMoves: spare(i, 2) }),
    },
    {
      id: 12, tint: '#FBF6EA', fog: '#AFBCCB',
      name: { en: 'Last Light', vi: 'Ánh Cuối' }, rule: { en: 'No spare', vi: 'Không dư' },
      ruleLine: { en: 'Exactly enough rotations. Plan first.', vi: 'Vừa đủ lượt xoay. Hãy tính trước.' },
      spec: (i) => ({ size: 9, targets: i % 2 === 0 ? splitWhite(i) : [...splitPair(i), ...one(i, [G, B, R])], turns: 4, portals: ramp(i, 2, 3), fixed: 2, dark: 3, filters: 2, decoys: ramp(i, 4, 5), walls: 4, scramble: ramp(i, 9, 10), minMoves: ramp(i, 9, 10), extraMoves: 0 }),
    },
  ];

  const LEVELS_PER_CHAPTER = 10;
  const UNLOCK_AFTER = 7; // chambers done before the next chapter opens

  // chapter and chamber are 1-based. Chambers are generated once by
  // scripts/build-lumen-levels.js and shipped in lumen-levels-data.js; the
  // generator only runs when that file is absent (build and check scripts).
  function level(chapterId, chamber) {
    const built = typeof LumenLevelsData !== 'undefined' && LumenLevelsData[chapterId - 1][chamber - 1];
    if (built) return JSON.parse(JSON.stringify(built));
    const seed = chapterId * 100003 + chamber * 7919;
    return LumenLevelGenerator.generate(CHAPTERS[chapterId - 1].spec(chamber - 1), seed);
  }

  return { CHAPTERS, LEVELS_PER_CHAPTER, UNLOCK_AFTER, level };
})();

if (typeof module !== 'undefined') module.exports = LumenChapters;
