// Gameplay screen controller for Lumen: loads a chamber, handles taps,
// counts rotations and switches between playing, solved and out states.
const LumenGame = (() => {
  const { t } = LumenI18n;
  const state = { chapter: 1, chamber: 1, level: null, mirrorTypes: [], moves: 0, limit: 0, phase: 'playing', board: null };
  let el = null;

  function bind() {
    el = {
      screen: document.getElementById('screen-game'),
      header: document.getElementById('game-header'),
      chapterLabel: document.getElementById('game-chapter'),
      chamberLabel: document.getElementById('game-chamber'),
      rule: document.getElementById('game-rule'),
      svg: document.getElementById('game-board'),
      numeral: document.getElementById('game-numeral'),
      counterLabel: document.getElementById('game-counter-label'),
      pips: document.getElementById('game-pips'),
      footer: document.getElementById('game-footer'),
      solved: document.getElementById('game-solved'),
      solvedText: document.getElementById('game-solved-text'),
      next: document.getElementById('game-next'),
      out: document.getElementById('game-out'),
      outTitle: document.getElementById('game-out-title'),
      outBody: document.getElementById('game-out-body'),
      retry: document.getElementById('game-retry'),
      outBack: document.getElementById('game-out-back'),
      retries: document.getElementById('game-retries'),
      hintBtn: document.getElementById('game-hint'),
      hintPop: document.getElementById('game-hint-pop'),
      hintTitle: document.getElementById('game-hint-title'),
      hintBody: document.getElementById('game-hint-body'),
      hintReveal: document.getElementById('game-hint-reveal'),
    };
    LumenGameHint.bind(el, revealMirror);
    document.getElementById('game-restart').addEventListener('click', restart);
    el.retry.addEventListener('click', retry);
    el.outBack.addEventListener('click', () => { location.hash = `#levels/${state.chapter}`; });
    el.next.addEventListener('click', goNext);
    el.hintBtn.addEventListener('click', () => { el.hintPop.hidden = !el.hintPop.hidden; });
    el.header.addEventListener('click', () => { location.hash = `#levels/${state.chapter}`; });
  }

  function chapterInfo() { return LumenChapters.CHAPTERS[state.chapter - 1]; }

  function load(chapter, chamber) {
    if (!el) bind();
    state.chapter = chapter;
    state.chamber = chamber;
    state.level = LumenChapters.level(chapter, chamber);
    state.mirrorTypes = state.level.mirrors.map((m) => m.type);
    state.moves = 0;
    state.limit = state.level.minMoves + state.level.extraMoves;
    state.phase = 'playing';
    LumenStorage.setCurrent(chapter, chamber);

    const info = chapterInfo();
    el.screen.style.setProperty('--board-tint', info.tint);
    el.svg.style.background = info.tint;
    state.board = LumenBoard.mount(el.svg, state.level, { fogColor: info.fog, onMirrorTap });
    el.pips.replaceChildren(...Array.from({ length: state.limit }, () => document.createElement('span')));
    el.solved.hidden = true;
    hideOut();
    el.hintPop.hidden = true;
    el.footer.hidden = false;
    renderText();
    update();
    // A chamber that still owes a retry opens on the out card.
    if (LumenEconomy.owes(chapter, chamber)) { state.phase = 'lost'; showOut(t('noRetries')); }
  }

  function renderText() {
    const info = chapterInfo();
    const lang = LumenI18n.getLang();
    el.chapterLabel.textContent = `${t('chapter')} ${state.chapter} · ${info.name[lang]}`;
    el.chamberLabel.textContent = `${t('chamber')} ${state.chamber}`;
    // The rule line shows on the first chamber of a chapter, as a mix formula
    // in the chapters about mixing.
    const level = state.level;
    const mixedTarget = level.targets.find((x) => (x.color & (x.color - 1)) !== 0);
    el.rule.hidden = state.chamber !== 1;
    el.rule.innerHTML = info.formula && mixedTarget ? LumenGameHint.formulaHtml(mixedTarget.color) : `<span class="caption">${info.ruleLine[lang]}</span>`;
    LumenGameHint.render(level, state.chapter);
    document.getElementById('game-restart').setAttribute('aria-label', t('restart'));
    el.outBack.textContent = t('back');
    renderRetries();
    el.next.textContent = t('next');
  }

  function update() {
    const result = LumenEngine.trace(state.level, state.mirrorTypes);
    const travel = state.board.update(state.mirrorTypes, result, { fog: state.phase !== 'won' });
    const left = state.limit - state.moves;
    el.numeral.textContent = left;
    el.counterLabel.textContent = t('rotationsLeft', left);
    el.numeral.parentElement.classList.toggle('warning', left === 1 && state.phase === 'playing');
    [...el.pips.children].forEach((pip, i) => pip.classList.toggle('spent', i >= left));

    if (state.phase !== 'playing') return;
    if (result.solved) {
      state.phase = 'won';
      LumenStorage.markDone(state.chapter, state.chamber);
      LumenEconomy.clearRetries(state.chapter, state.chamber);
      const last = state.chapter === LumenChapters.CHAPTERS.length && state.chamber === LumenChapters.LEVELS_PER_CHAPTER;
      el.solvedText.textContent = last ? t('allLit') : t('lit', state.chamber);
      el.footer.hidden = true;
      el.hintPop.hidden = true;
      // The reveal waits for the last beam to reach its ring.
      setTimeout(() => {
        if (state.phase !== 'won') return;
        state.board.update(state.mirrorTypes, result, { fog: false });
        el.solved.hidden = false;
        LumenFeedback.solved();
      }, travel);
    } else if (left <= 0) {
      state.phase = 'lost';
      LumenEconomy.spendRetry(state.chapter, state.chamber);
      showOut(t('outTitle'));
      LumenFeedback.out();
    }
  }

  function renderRetries() {
    const left = LumenEconomy.retriesLeft(state.chapter, state.chamber);
    el.retries.textContent = left === Infinity ? '' : t('retries', left);
  }

  // The out card: "try again" when the ended run was paid for, else the
  // refill countdown and an ad to settle the debt. It re-renders every
  // second so the countdown moves and a refill switches it over.
  let outTimer = 0;
  function showOut(title) {
    const owed = LumenEconomy.owes(state.chapter, state.chamber);
    const left = LumenEconomy.retriesLeft(state.chapter, state.chamber);
    el.outTitle.textContent = title;
    el.outBody.textContent = owed
      ? `${title === t('noRetries') ? '' : `${t('noRetries')}. `}${t('refillIn', LumenEconomy.clock(LumenEconomy.refillIn(state.chapter, state.chamber)))}`
      : `${t('outBody')} ${left === Infinity ? '' : t('retriesLeft', left)}`.trim();
    el.retry.textContent = owed ? t('adRetry') : t('tryAgain');
    el.out.hidden = false;
    renderRetries();
    clearInterval(outTimer);
    outTimer = setInterval(() => showOut(title), 1000);
  }

  function hideOut() {
    clearInterval(outTimer);
    el.out.hidden = true;
  }

  // The ended run was paid for when it ended; a debt needs an ad first.
  async function retry() {
    if (LumenEconomy.owes(state.chapter, state.chamber)) {
      if (!(await LumenRewards.showRewarded('retry'))) return;
      LumenEconomy.grantRetry(state.chapter, state.chamber);
    }
    load(state.chapter, state.chamber);
  }

  // Restarting an untouched or solved chamber is free; after a turn it ends a run.
  function restart() {
    if (state.moves === 0 || state.phase === 'won') { load(state.chapter, state.chamber); return; }
    if (LumenEconomy.spendRetry(state.chapter, state.chamber)) load(state.chapter, state.chamber);
    else { state.phase = 'lost'; showOut(t('noRetries')); }
  }

  // Marks one mirror that still differs from the stored solution.
  function revealMirror() {
    const data = typeof LumenSolutionsData !== 'undefined' && LumenSolutionsData[state.chapter - 1];
    const flips = (data && data[state.chamber - 1]) || [];
    const solvedTypes = state.level.mirrors.map((m) => m.type);
    flips.forEach((i) => { solvedTypes[i] = LumenEngine.toggle(solvedTypes[i]); });
    const i = solvedTypes.findIndex((type, k) => type !== state.mirrorTypes[k]);
    if (i >= 0) state.board.highlight(i);
  }

  function onMirrorTap(i) {
    if (state.phase !== 'playing' || state.level.mirrors[i].fixed) return;
    state.mirrorTypes[i] = LumenEngine.toggle(state.mirrorTypes[i]);
    state.moves += 1;
    LumenFeedback.tap();
    update();
  }

  function goNext() {
    const per = LumenChapters.LEVELS_PER_CHAPTER;
    if (state.chamber < per) location.hash = `#game/${state.chapter}/${state.chamber + 1}`;
    else if (state.chapter < LumenChapters.CHAPTERS.length && LumenStorage.isChapterUnlocked(state.chapter + 1)) location.hash = `#game/${state.chapter + 1}/1`;
    else location.hash = '#chapters';
    // Reload when the hash is unchanged (same chamber replayed).
    if (location.hash === `#game/${state.chapter}/${state.chamber}`) load(state.chapter, state.chamber);
  }

  return { load, renderText, current: () => ({ chapter: state.chapter, chamber: state.chamber }) };
})();
