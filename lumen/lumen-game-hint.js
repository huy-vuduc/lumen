// Hint popup for the gameplay screen: the chamber's goals and mechanics are
// always free; "show a mirror" is limited per chapter by LumenEconomy and a
// rewarded ad adds one. The game passes a callback that marks the mirror.
const LumenGameHint = (() => {
  const { t } = LumenI18n;
  let el = null;
  let onReveal = null;
  let chapter = 1;

  function bind(elements, reveal) {
    el = elements;
    onReveal = reveal;
    el.hintReveal.addEventListener('click', request);
  }

  // "dot + dot = dot" for a mixed colour. Names stay only as labels for
  // screen readers; pale dots get a keyline so they show on the light page.
  function formulaHtml(mask) {
    const { parts, result } = LumenI18n.mixFormula(mask);
    const chip = (name, color) => `<span class="chip" role="img" aria-label="${name}"><i style="--c:${LumenBoard.BEAM[color]}${LumenPieces.KEYLINE[color] ? `;--k:${LumenPieces.KEYLINE[color]}` : ''}"></i></span>`;
    const colors = [1, 2, 4].filter((c) => mask & c);
    return `${parts.map((p, i) => chip(p, colors[i])).join('<span class="op">+</span>')}<span class="op">=</span>${chip(result, mask)}`;
  }

  // Each line shows the piece it talks about, drawn as on the board.
  function render(level, currentChapter) {
    chapter = currentChapter;
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
    el.hintTitle.textContent = t('hintTitle');
    el.hintBtn.setAttribute('aria-label', t('hint'));
    updateButton();
  }

  function updateButton() {
    const left = LumenEconomy.hintsLeft(chapter);
    el.hintReveal.textContent = left === Infinity ? t('revealOne') : left > 0 ? t('reveal', left) : t('adHint');
    el.hintReveal.classList.toggle('ad', left === 0);
  }

  async function request() {
    if (LumenEconomy.hintsLeft(chapter) <= 0) {
      if (!(await LumenRewards.showRewarded('hint'))) return;
      LumenEconomy.grantHint(chapter);
    }
    if (LumenEconomy.spendHint(chapter)) {
      el.hintPop.hidden = true;
      onReveal();
    }
    updateButton();
  }

  return { bind, render, formulaHtml, updateButton };
})();
