// Chapter definitions for Lumen: names, tints, the rule each introduces and
// how puzzle difficulty grows across the ten chambers of a chapter.
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
  // Difficulty starts climbing from the middle of chapter 2: spare rotations
  // drop to zero on the last chambers of each chapter from there on.
  const spare = (i, from = 8) => (i >= from ? 0 : 1);

  const CHAPTERS = [
    {
      id: 1, tint: '#FCF8F0', fog: '#AFBCCB',
      name: { en: 'First Light', vi: 'Ánh Đầu' }, rule: { en: 'Mirrors', vi: 'Gương' },
      ruleLine: { en: 'Tap a mirror to turn it.', vi: 'Chạm vào gương để xoay.' },
      spec: (i) => ({ size: ramp(i, 5, 6), targets: [{ colors: [pick(PRIMARIES, i)] }], turns: ramp(i, 1, 3), decoys: i >= 6 ? 1 : 0, scramble: ramp(i, 1, 3), minMoves: ramp(i, 1, 3), extraMoves: i < 5 ? 2 : 1 }),
    },
    {
      id: 2, tint: '#F2F9F5', fog: '#AFBCCB',
      name: { en: 'Stone Walls', vi: 'Tường Đá' }, rule: { en: 'Walls', vi: 'Tường' },
      ruleLine: { en: 'Beams stop at walls.', vi: 'Tia sáng dừng lại ở tường.' },
      spec: (i) => ({ size: i >= 4 ? 7 : 6, targets: [{ colors: [pick([B, R, G], i)] }], turns: i >= 4 ? 3 : 2, walls: ramp(i, 3, 6), decoys: i >= 4 ? ramp(i, 2, 3) : 1, scramble: i >= 4 ? 3 : 2, minMoves: i >= 4 ? 3 : 2, extraMoves: spare(i) }),
    },
    {
      id: 3, tint: '#F7F5FB', fog: '#B1B6D0', formula: true,
      name: { en: 'Blended Light', vi: 'Hoà Sắc' }, rule: { en: 'Mixing', vi: 'Pha màu' },
      ruleLine: { en: 'Two colours on one ring blend.', vi: 'Hai màu trên một vòng sẽ hoà lại.' },
      spec: (i) => ({ size: 7, targets: i >= 4 ? [{ colors: pick(PAIRS, i) }, { colors: [pick([G, B, R], i)] }] : [{ colors: pick(PAIRS, i) }], turns: i >= 5 ? 3 : 2, walls: ramp(i, 2, 4), decoys: ramp(i, 1, 3), scramble: ramp(i, 3, 5), minMoves: ramp(i, 3, 5), extraMoves: spare(i) }),
    },
    {
      id: 4, tint: '#F1F6FB', fog: '#AFBCCB',
      name: { en: 'Set in Stone', vi: 'Gương Đá' }, rule: { en: 'Fixed mirrors', vi: 'Gương cố định' },
      ruleLine: { en: 'Stone mirrors cannot turn.', vi: 'Gương đá không xoay được.' },
      spec: (i) => ({ size: 7, targets: i >= 5 ? [{ colors: [pick(PRIMARIES, i)] }, { colors: [pick([B, R, G], i)] }] : [{ colors: [pick(PRIMARIES, i)] }], turns: 3, fixed: i >= 5 ? ramp(i, 2, 3) : 1, fixedDecoys: ramp(i, 1, 2), decoys: ramp(i, 1, 2), walls: 2, scramble: i >= 5 ? ramp(i, 3, 4) : 2, minMoves: i >= 5 ? ramp(i, 3, 4) : 2, extraMoves: spare(i) }),
    },
    {
      id: 5, tint: '#FDF5EC', fog: '#AFBCCB',
      name: { en: 'Two Ways', vi: 'Hai Ngả' }, rule: { en: 'Splitter', vi: 'Bộ tách' },
      ruleLine: { en: 'A splitter sends the beam two ways.', vi: 'Bộ tách chia tia thành hai ngả.' },
      spec: (i) => ({ size: 7, targets: i >= 5 ? [{ split: pick(PRIMARIES, i) }, { colors: [pick([G, B, R], i)] }] : [{ split: pick(PRIMARIES, i) }], turns: i >= 3 ? 3 : 2, walls: 2, decoys: 2, scramble: ramp(i, 3, 5), minMoves: ramp(i, 3, 5), extraMoves: spare(i) }),
    },
    {
      id: 6, tint: '#FBF3F5', fog: '#AFBCCB',
      name: { en: 'Keep It Dark', vi: 'Giữ Tối' }, rule: { en: 'Dark rings', vi: 'Vòng tối' },
      ruleLine: { en: 'Grey rings must stay dark.', vi: 'Vòng xám phải được giữ tối.' },
      spec: (i) => ({ size: 7, targets: i >= 4 ? [{ colors: [pick(PRIMARIES, i)] }, { colors: [pick([B, R, G], i)] }] : [{ colors: [pick(PRIMARIES, i)] }], turns: 3, dark: ramp(i, 1, 3), decoys: ramp(i, 2, 3), walls: 2, scramble: i >= 4 ? ramp(i, 4, 5) : 3, minMoves: i >= 4 ? ramp(i, 4, 5) : 3, extraMoves: spare(i) }),
    },
    {
      id: 7, tint: '#F3F7F2', fog: '#AFBCCB',
      name: { en: 'Clear Glass', vi: 'Kính Lọc' }, rule: { en: 'Filters', vi: 'Kính lọc' },
      ruleLine: { en: 'A white beam keeps only the filter’s colour.', vi: 'Tia trắng đi qua kính chỉ giữ lại màu của kính.' },
      spec: (i) => ({ size: 7, targets: [{ colors: [pick(PRIMARIES, i)] }, { colors: [pick([B, R, G], i)] }], turns: i >= 5 ? 3 : 2, filters: ramp(i, 1, 2), decoys: 2, walls: 2, scramble: ramp(i, 4, 5), minMoves: ramp(i, 4, 5), extraMoves: spare(i) }),
    },
    {
      id: 8, tint: '#F6F3EE', fog: '#AFBCCB',
      name: { en: 'Hidden Doors', vi: 'Cửa Ẩn' }, rule: { en: 'Portals', vi: 'Cổng' },
      ruleLine: { en: 'A beam entering one door leaves the other.', vi: 'Tia vào cổng này sẽ ra ở cổng kia.' },
      spec: (i) => ({ size: 7, targets: i >= 5 ? [{ colors: [pick(PRIMARIES, i)] }, { colors: [pick([G, B, R], i)] }] : [{ colors: [pick(PRIMARIES, i)] }], turns: 3, portals: ramp(i, 1, 2), decoys: ramp(i, 2, 3), walls: 2, scramble: i >= 5 ? 5 : 3, minMoves: i >= 5 ? 5 : 3, extraMoves: spare(i) }),
    },
    {
      id: 9, tint: '#EFF5F7', fog: '#AFBCCB',
      name: { en: 'Crossed Beams', vi: 'Giao Nhau' }, rule: { en: 'Combined', vi: 'Tổng hợp' },
      ruleLine: { en: 'Rings, splitters and stone mirrors together.', vi: 'Vòng, bộ tách và gương đá cùng lúc.' },
      spec: (i) => ({ size: 7, targets: [{ split: pick(PRIMARIES, i) }, { colors: [pick([B, R, G], i)] }], turns: 3, fixed: ramp(i, 1, 2), fixedDecoys: 1, dark: i >= 5 ? 1 : 0, walls: 3, decoys: 3, scramble: ramp(i, 4, 5), minMoves: ramp(i, 4, 5), extraMoves: spare(i) }),
    },
    {
      id: 10, tint: '#F8F2F0', fog: '#AFBCCB', formula: true,
      name: { en: 'Three Lights', vi: 'Ba Nguồn' }, rule: { en: 'White', vi: 'Trắng' },
      ruleLine: { en: 'All three colours make white.', vi: 'Ba màu gộp lại thành trắng.' },
      spec: (i) => ({ size: 7, targets: i % 2 === 0 ? [{ colors: [R, G, B] }] : [{ colors: pick(PAIRS, i) }, { colors: [pick([G, R, B], i)] }], turns: 2, filters: ramp(i, 1, 2), dark: ramp(i, 1, 2), decoys: 3, walls: 2, scramble: ramp(i, 5, 6), minMoves: ramp(i, 5, 6), extraMoves: spare(i) }),
    },
    {
      id: 11, tint: '#F2F2F8', fog: '#AFBCCB',
      name: { en: 'Labyrinth', vi: 'Mê Cung' }, rule: { en: 'All rules', vi: 'Mọi luật' },
      ruleLine: { en: 'Every rule at once.', vi: 'Mọi luật cùng lúc.' },
      spec: (i) => ({ size: 7, targets: [{ split: pick(PRIMARIES, i) }, { colors: pick(PAIRS, i) }], turns: 2, portals: 1, fixed: 1, dark: ramp(i, 1, 2), filters: 1, decoys: ramp(i, 3, 4), walls: 3, scramble: 6, minMoves: 6, extraMoves: spare(i, 7) }),
    },
    {
      id: 12, tint: '#FBF6EA', fog: '#AFBCCB',
      name: { en: 'Last Light', vi: 'Ánh Cuối' }, rule: { en: 'No spare', vi: 'Không dư' },
      ruleLine: { en: 'Exactly enough rotations. Plan first.', vi: 'Vừa đủ lượt xoay. Hãy tính trước.' },
      spec: (i) => ({ size: 7, targets: [{ split: pick(PRIMARIES, i) }, { colors: pick([[R, G, B], [R, B], [G, B]], i) }], turns: 2, portals: ramp(i, 1, 2), fixed: 1, dark: 2, filters: 1, decoys: 3, walls: 2, scramble: 6, minMoves: 6, extraMoves: 0 }),
    },
  ];

  const LEVELS_PER_CHAPTER = 10;
  const UNLOCK_AFTER = 7; // chambers done before the next chapter opens

  // chapter and chamber are 1-based. The seed makes the puzzle reproducible.
  function level(chapterId, chamber) {
    const chapter = CHAPTERS[chapterId - 1];
    const spec = chapter.spec(chamber - 1);
    const seed = chapterId * 100003 + chamber * 7919;
    return LumenLevelGenerator.generate(spec, seed);
  }

  return { CHAPTERS, LEVELS_PER_CHAPTER, UNLOCK_AFTER, level };
})();

if (typeof module !== 'undefined') module.exports = LumenChapters;
