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
      hintBtn: document.getElementById('game-hint'),
      hintPop: document.getElementById('game-hint-pop'),
      hintBody: document.getElementById('game-hint-body'),
    };
    document.getElementById('game-restart').addEventListener('click', () => load(state.chapter, state.chamber));
    document.getElementById('game-retry').addEventListener('click', () => load(state.chapter, state.chamber));
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
    el.out.hidden = true;
    el.hintPop.hidden = true;
    el.footer.hidden = false;
    renderText();
    update();
  }

  // "dot + dot = dot" for a mixed colour. Names stay only as labels for
  // screen readers; pale dots get a keyline so they show on the light page.
  function formulaHtml(mask) {
    const { parts, result } = LumenI18n.mixFormula(mask);
    const chip = (name, color) => `<span class="chip" role="img" aria-label="${name}"><i style="--c:${LumenBoard.BEAM[color]}${LumenPieces.KEYLINE[color] ? `;--k:${LumenPieces.KEYLINE[color]}` : ''}"></i></span>`;
    const colors = [1, 2, 4].filter((c) => mask & c);
    return `${parts.map((p, i) => chip(p, colors[i])).join('<span class="op">+</span>')}<span class="op">=</span>${chip(result, mask)}`;
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
    el.rule.innerHTML = info.formula && mixedTarget ? formulaHtml(mixedTarget.color) : `<span class="caption">${info.ruleLine[lang]}</span>`;
    // Each hint line shows the piece it talks about, drawn as on the board.
    const line = (icon, html) => {
      const row = document.createElement('div');
      row.className = 'hint-line';
      row.append(icon);
      row.insertAdjacentHTML('beforeend', html);
      return row;
    };
    const mixed = (c) => (c & (c - 1)) !== 0;
    const goals = [...new Set(level.targets.filter((x) => x.color !== 0).map((x) => x.color))].map((color) => line(
      LumenPieces.icon('ring', color),
      mixed(color) ? `<div class="formula">${formulaHtml(color)}</div>` : `<span class="caption">${t('guide', LumenI18n.colorName(color))}</span>`,
    ));
    const mechanics = [
      level.mirrors.some((m) => m.fixed) && ['fixed', t('hintFixed')],
      level.splitters?.length && ['splitter', t('hintSplit')],
      level.filters?.length && ['filter', t('hintFilter'), level.filters[0].color],
      level.portals?.length && ['portal', t('hintPortal')],
      level.targets.some((x) => x.color === 0) && ['dark', t('hintDark')],
    ].filter(Boolean).map(([kind, text, color]) => line(LumenPieces.icon(kind, color), `<span class="caption">${text}</span>`));
    el.hintBody.replaceChildren(...goals, ...mechanics);
    el.hintBtn.setAttribute('aria-label', t('hint'));
    document.getElementById('game-restart').setAttribute('aria-label', t('restart'));
    document.getElementById('game-hint-title').textContent = t('hintTitle');
    document.getElementById('game-out-title').textContent = t('outTitle');
    document.getElementById('game-out-body').textContent = t('outBody');
    document.getElementById('game-retry').textContent = t('tryAgain');
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
      el.out.hidden = false;
      LumenFeedback.out();
    }
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
