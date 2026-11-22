// UI strings for Lumen in English and Vietnamese.
const LumenI18n = (() => {
  const STRINGS = {
    en: {
      play: 'Play', chapters: 'Chapters', settings: 'Settings', chapter: 'Chapter', chamber: 'Chamber',
      continueLabel: 'Continue', back: 'Back', next: 'Next', restart: 'Restart', hint: 'Hint',
      rotationsLeft: (n) => (n === 1 ? 'Rotation left' : 'Rotations left'),
      lit: (n) => `Chamber ${n} lit.`, allLit: 'Every chamber is lit.',
      outTitle: 'Out of rotations', outBody: 'Take another look at the paths.', tryAgain: 'Try again',
      hintTitle: 'This chamber', newRule: 'New rule:', inFog: (n) => `Chapter ${n}, in fog`,
      guide: (c) => `Guide the ${c.toLowerCase()} beam to the ${c.toLowerCase()} ring.`,
      soundTouch: 'Sound and touch', sound: 'Sound', haptics: 'Haptics', display: 'Display',
      language: 'Language',
      progress: 'Progress', reset: 'Reset progress', resetConfirm: 'Tap again to erase everything',
      resetDone: 'Progress erased', subtitle: 'Tia Sáng',
      hintFixed: 'Stone mirrors stay as they are.', hintSplit: 'The splitter sends the beam straight on and to the side.',
      hintFilter: 'Glass keeps only its own colour.', hintPortal: 'Doors come in pairs: in one, out the other.',
      hintDark: 'Grey rings must stay dark.',
      unlockAll: 'Open every chapter', unlockAllDesc: 'Playtest switch: jump to any chamber',
      colors: { 1: 'Red', 2: 'Green', 4: 'Blue', 3: 'Yellow', 5: 'Magenta', 6: 'Cyan', 7: 'White' },
    },
    vi: {
      play: 'Chơi', chapters: 'Chương', settings: 'Cài đặt', chapter: 'Chương', chamber: 'Phòng',
      continueLabel: 'Tiếp tục', back: 'Quay lại', next: 'Tiếp', restart: 'Chơi lại', hint: 'Gợi ý',
      rotationsLeft: () => 'Lượt xoay còn lại',
      lit: (n) => `Phòng ${n} đã sáng.`, allLit: 'Mọi căn phòng đã sáng.',
      outTitle: 'Hết lượt xoay', outBody: 'Hãy xem lại các đường đi.', tryAgain: 'Thử lại',
      hintTitle: 'Phòng này', newRule: 'Luật mới:', inFog: (n) => `Chương ${n}, trong sương`,
      guide: (c) => `Dẫn tia ${c.toLowerCase()} tới vòng ${c.toLowerCase()}.`,
      soundTouch: 'Âm thanh và cảm ứng', sound: 'Âm thanh', haptics: 'Rung', display: 'Hiển thị',
      language: 'Ngôn ngữ',
      progress: 'Tiến trình', reset: 'Xoá tiến trình', resetConfirm: 'Chạm lần nữa để xoá toàn bộ',
      resetDone: 'Đã xoá tiến trình', subtitle: 'Tia Sáng',
      hintFixed: 'Gương đá giữ nguyên hướng.', hintSplit: 'Bộ tách cho tia đi thẳng và rẽ ngang.',
      hintFilter: 'Kính lọc chỉ giữ lại màu của nó.', hintPortal: 'Cổng đi theo cặp: vào cổng này, ra cổng kia.',
      hintDark: 'Vòng xám phải giữ tối.',
      unlockAll: 'Mở tất cả chương', unlockAllDesc: 'Dành cho chơi thử: vào thẳng mọi phòng',
      colors: { 1: 'Đỏ', 2: 'Xanh lá', 4: 'Xanh dương', 3: 'Vàng', 5: 'Hồng tím', 6: 'Xanh ngọc', 7: 'Trắng' },
    },
  };

  let lang = 'en';

  function t(key, ...args) {
    const value = STRINGS[lang][key] ?? STRINGS.en[key] ?? key;
    return typeof value === 'function' ? value(...args) : value;
  }

  const colorName = (mask) => STRINGS[lang].colors[mask] ?? '';
  const setLang = (code) => { lang = STRINGS[code] ? code : 'en'; };
  const getLang = () => lang;

  // "Red + Blue = Magenta" pieces for a target mask, used by the rule line and hint.
  function mixFormula(mask) {
    const parts = [1, 2, 4].filter((c) => mask & c);
    return { parts: parts.map(colorName), result: colorName(mask) };
  }

  return { t, colorName, setLang, getLang, mixFormula };
})();
