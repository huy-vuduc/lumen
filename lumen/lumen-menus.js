// Menu screens for Lumen: home, chapter map, level grid and settings.
// Each render function rebuilds its screen from storage and i18n state.
const LumenMenus = (() => {
  const { t } = LumenI18n;
  const C = LumenChapters;
  const S = LumenStorage;
  const lang = () => LumenI18n.getLang();
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const ring = (color, size = 16) => `<span class="ring-dot" style="--c:${LumenBoard.BEAM[color]};--s:${size}px"></span>`;
  const RINGS = [1, 2, 5, 4, 7, 3, 6, 1, 2, 7, 5, 4]; // colour shown beside each chapter name
  const CHAPTER_RING = new Proxy(RINGS, { get: (arr, i) => arr[Number(i) % arr.length] });

  function renderHome() {
    const next = S.nextToPlay();
    const info = C.CHAPTERS[next.chapter - 1];
    document.getElementById('home-play').textContent = t('play');
    document.getElementById('home-current').textContent = `${t('chamber')} ${next.chamber} · ${info.name[lang()]}`;
    document.getElementById('home-play').onclick = () => { location.hash = `#game/${next.chapter}/${next.chamber}`; };
    document.getElementById('home-chapters').textContent = t('chapters');
    document.getElementById('home-settings').textContent = t('settings');
    document.getElementById('home-subtitle').textContent = t('subtitle');
    LumenHomeIntro.mount(document.querySelector('#screen-home .home-title'));
  }

  function renderChapters() {
    document.getElementById('chapters-title').textContent = t('chapters');
    const list = C.CHAPTERS.map((ch, i) => {
      const n = ch.id;
      const done = S.chapterProgress(n);
      const unlocked = S.isChapterUnlocked(n);
      if (!unlocked) {
        return `<div class="row"><span class="node locked"></span><div class="card fog" aria-label="${esc(t('inFog', n))}" style="--tint:${ch.tint}"><span class="big">${n}</span></div></div>`;
      }
      const current = done < C.LEVELS_PER_CHAPTER;
      const pips = Array.from({ length: C.LEVELS_PER_CHAPTER }, (_, k) => `<span class="${k < done ? 'on' : ''}"></span>`).join('');
      return `<div class="row"><span class="node ${current ? 'current' : 'lit'}"></span>
        <a class="card ${current ? 'current' : ''}" href="#levels/${n}" style="--tint:${ch.tint}">
          <div><div class="micro">${t('chapter')} ${n} · ${esc(ch.rule[lang()])}</div>
          <div class="card-title">${esc(ch.name[lang()])} ${ring(CHAPTER_RING[i])}</div></div>
          <div class="progress"><span class="pips">${pips}</span><span class="count">${done}/${C.LEVELS_PER_CHAPTER}</span></div>
        </a></div>`;
    }).join('');
    document.getElementById('chapters-list').innerHTML = list;
  }

  function renderLevels(chapter) {
    const ch = C.CHAPTERS[chapter - 1];
    const done = S.chapterProgress(chapter);
    document.getElementById('levels-chapter').textContent = `${t('chapter')} ${chapter}`;
    document.getElementById('levels-title').textContent = ch.name[lang()];
    document.getElementById('levels-rule').textContent = `${t('newRule')} ${ch.ruleLine[lang()]}`;
    document.getElementById('levels-count').textContent = `${done}/${C.LEVELS_PER_CHAPTER}`;
    const next = S.nextToPlay();
    const tiles = Array.from({ length: C.LEVELS_PER_CHAPTER }, (_, k) => {
      const n = k + 1;
      if (S.isDone(chapter, n)) {
        return `<a class="tile lit" href="#game/${chapter}/${n}" style="--tint:${ch.tint}"><div><div class="micro">${t('chamber')}</div><div class="num">${n}</div></div>${ring(CHAPTER_RING[chapter - 1], 22)}</a>`;
      }
      if (S.isLevelUnlocked(chapter, n)) {
        const isNext = next.chapter === chapter && next.chamber === n;
        return `<a class="tile current" href="#game/${chapter}/${n}"><div><div class="micro">${t('chamber')}</div><div class="num">${n}</div></div><span class="go">${isNext ? t('continueLabel') : t('play')} <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg></span></a>`;
      }
      return `<div class="tile fog" style="--depth:${0.62 + 0.3 * Math.min(1, (n - done - 1) / 3)}"><span class="big">${n}</span></div>`;
    }).join('');
    document.getElementById('levels-grid').innerHTML = tiles;
    document.getElementById('levels-back').href = '#chapters';
  }

  function renderSettings() {
    const s = S.getSettings();
    const toggle = (id, label, on, desc = '') => `<button type="button" class="setting" data-setting="${id}" aria-pressed="${on}"><span><span class="label">${label}</span>${desc ? `<span class="caption">${desc}</span>` : ''}</span><span class="switch"></span></button>`;
    document.getElementById('settings-title').textContent = t('settings');
    document.getElementById('settings-body').innerHTML = `
      <div class="micro">${t('soundTouch')}</div>
      ${toggle('sound', t('sound'), s.sound)}${toggle('haptics', t('haptics'), s.haptics)}
      <div class="micro">${t('display')}</div>
      <div class="setting static"><span class="label">${t('language')}</span><span class="seg">
        <button type="button" data-lang="en" aria-pressed="${s.lang === 'en'}">English</button>
        <button type="button" data-lang="vi" aria-pressed="${s.lang === 'vi'}">Tiếng Việt</button></span></div>
      <div class="micro">${t('progress')}</div>
      ${S.PLAYTEST ? toggle('unlockAll', t('unlockAll'), s.unlockAll, t('unlockAllDesc')) : ''}
      <button type="button" class="setting danger" id="settings-reset"><span class="label">${t('reset')}</span></button>`;
    document.querySelectorAll('#settings-body [data-setting]').forEach((btn) => {
      btn.addEventListener('click', () => { S.setSetting(btn.dataset.setting, !S.getSettings()[btn.dataset.setting]); renderSettings(); });
    });
    document.querySelectorAll('#settings-body [data-lang]').forEach((btn) => {
      btn.addEventListener('click', () => { S.setSetting('lang', btn.dataset.lang); LumenI18n.setLang(btn.dataset.lang); renderSettings(); });
    });
    const reset = document.getElementById('settings-reset');
    let armed = false;
    reset.addEventListener('click', () => {
      if (!armed) { armed = true; reset.querySelector('.label').textContent = t('resetConfirm'); return; }
      S.reset();
      reset.querySelector('.label').textContent = t('resetDone');
      reset.disabled = true;
    });
  }

  return { renderHome, renderChapters, renderLevels, renderSettings };
})();
