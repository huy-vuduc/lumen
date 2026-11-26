// Rewarded ads for Lumen. The native app installs window.LumenAdProvider
// with showRewarded(kind) -> Promise<boolean> (true when the ad was watched
// to the end). Without a provider, as on the web, a stand-in card counts
// down a few seconds so the flow can be played through.
const LumenRewards = (() => {
  const STAND_IN_SECONDS = 3;
  let el = null;

  function bind() {
    el = {
      overlay: document.getElementById('game-ad'),
      title: document.getElementById('game-ad-title'),
      body: document.getElementById('game-ad-body'),
      count: document.getElementById('game-ad-count'),
      cancel: document.getElementById('game-ad-cancel'),
    };
  }

  function standIn() {
    if (!el) bind();
    const { t } = LumenI18n;
    el.title.textContent = t('adTitle');
    el.body.textContent = t('adBody');
    el.cancel.textContent = t('cancel');
    el.overlay.hidden = false;
    return new Promise((resolve) => {
      let left = STAND_IN_SECONDS;
      el.count.textContent = left;
      const finish = (watched) => { clearInterval(timer); el.overlay.hidden = true; el.cancel.onclick = null; resolve(watched); };
      const timer = setInterval(() => {
        left--;
        el.count.textContent = left;
        if (left <= 0) finish(true);
      }, 1000);
      el.cancel.onclick = () => finish(false);
    });
  }

  // kind is 'attempt' or 'hint'; resolves true when the reward was earned.
  function showRewarded(kind) {
    const provider = window.LumenAdProvider;
    if (provider && typeof provider.showRewarded === 'function') return provider.showRewarded(kind).catch(() => false);
    return standIn();
  }

  return { showRewarded };
})();
