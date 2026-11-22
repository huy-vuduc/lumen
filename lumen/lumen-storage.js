// Progress and settings for Lumen, kept in localStorage. Every access is
// guarded because storage can be unavailable in private windows or previews.
const LumenStorage = (() => {
  const KEY = 'lumen.v1';
  const defaults = () => ({
    done: {},
    current: { chapter: 1, chamber: 1 },
    // unlockAll is a playtest switch: every chapter and chamber opens at once.
    settings: { sound: true, haptics: true, lang: 'en', unlockAll: true },
  });

  let state = load();

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return defaults();
      const parsed = JSON.parse(raw);
      return { ...defaults(), ...parsed, settings: { ...defaults().settings, ...(parsed.settings || {}) } };
    } catch {
      return defaults();
    }
  }

  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* storage unavailable */ }
  }

  const id = (chapter, chamber) => `${chapter}-${chamber}`;
  const isDone = (chapter, chamber) => Boolean(state.done[id(chapter, chamber)]);

  function markDone(chapter, chamber) {
    state.done[id(chapter, chamber)] = true;
    save();
  }

  function chapterProgress(chapter) {
    let count = 0;
    for (let n = 1; n <= LumenChapters.LEVELS_PER_CHAPTER; n++) if (isDone(chapter, n)) count++;
    return count;
  }

  const isChapterUnlocked = (chapter) => state.settings.unlockAll || chapter === 1 || chapterProgress(chapter - 1) >= LumenChapters.UNLOCK_AFTER;
  const isLevelUnlocked = (chapter, chamber) => state.settings.unlockAll || (isChapterUnlocked(chapter) && (chamber === 1 || isDone(chapter, chamber - 1)));

  function setCurrent(chapter, chamber) {
    state.current = { chapter, chamber };
    save();
  }
  const getCurrent = () => ({ ...state.current });

  // The chamber "Play" should open: the first unlocked chamber that is not done
  // after the current one, else the current one.
  function nextToPlay() {
    const { chapter, chamber } = state.current;
    if (!isDone(chapter, chamber)) return { chapter, chamber };
    for (let c = chapter; c <= LumenChapters.CHAPTERS.length; c++) {
      if (!isChapterUnlocked(c)) break;
      for (let n = 1; n <= LumenChapters.LEVELS_PER_CHAPTER; n++) {
        if (!isDone(c, n) && isLevelUnlocked(c, n)) return { chapter: c, chamber: n };
      }
    }
    return { chapter, chamber };
  }

  const getSettings = () => ({ ...state.settings });
  function setSetting(name, value) {
    state.settings[name] = value;
    save();
  }

  function reset() {
    const settings = state.settings;
    state = { ...defaults(), settings };
    save();
  }

  return { isDone, markDone, chapterProgress, isChapterUnlocked, isLevelUnlocked, setCurrent, getCurrent, nextToPlay, getSettings, setSetting, reset };
})();
