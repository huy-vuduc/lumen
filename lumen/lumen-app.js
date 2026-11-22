// Hash router and boot for Lumen. Routes: #home, #chapters, #levels/3, #game/3/7, #settings.
(() => {
  const screens = ['home', 'chapters', 'levels', 'game', 'settings'];

  function show(name) {
    for (const s of screens) document.getElementById(`screen-${s}`).hidden = s !== name;
    window.scrollTo(0, 0);
  }

  function route() {
    LumenI18n.setLang(LumenStorage.getSettings().lang);
    document.documentElement.lang = LumenI18n.getLang();
    const parts = location.hash.replace(/^#/, '').split('/');
    const n = (v, max) => Math.min(max, Math.max(1, parseInt(v, 10) || 1));
    const chapters = LumenChapters.CHAPTERS.length;
    const per = LumenChapters.LEVELS_PER_CHAPTER;

    switch (parts[0]) {
      case 'chapters':
        LumenMenus.renderChapters();
        show('chapters');
        break;
      case 'levels': {
        const c = n(parts[1], chapters);
        if (!LumenStorage.isChapterUnlocked(c)) { location.hash = '#chapters'; return; }
        LumenMenus.renderLevels(c);
        show('levels');
        break;
      }
      case 'game': {
        const c = n(parts[1], chapters), l = n(parts[2], per);
        if (!LumenStorage.isLevelUnlocked(c, l)) { location.hash = `#levels/${c}`; return; }
        LumenGame.load(c, l);
        show('game');
        break;
      }
      case 'settings':
        LumenMenus.renderSettings();
        show('settings');
        break;
      default:
        LumenMenus.renderHome();
        show('home');
    }
    document.querySelectorAll('[data-back]').forEach((a) => { a.setAttribute('aria-label', LumenI18n.t('back')); });
  }

  window.addEventListener('hashchange', route);

  // Keep the current screen across live republishes of the page.
  window.claude?.hot?.snapshot?.(() => ({ hash: location.hash }));
  const start = (data) => {
    if (data?.hash && !location.hash) location.hash = data.hash;
    route();
  };
  window.claude?.hot?.ready ? window.claude.hot.ready(start) : start(window.claude?.hot?.data ?? {});
})();
