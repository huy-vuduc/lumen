// Hint and retry limits for Lumen. Each chamber allows MAX_RETRIES retries
// (a retry is spent when the rotations run out or the player restarts after
// a turn); one retry returns every REFILL_MS up to the maximum, and a
// rewarded ad adds one. Each chapter allows HINTS_PER_CHAPTER mirror reveals,
// and a rewarded ad adds one. The playtest "unlimited" switch lifts both.
// Counters live in LumenStorage.economy(): retries[chapter-chamber] =
// { left, at } where `at` is when the refill clock started; hints[chapter] =
// { used, extra }.
const LumenEconomy = (() => {
  const MAX_RETRIES = 2;
  const REFILL_MS = 30 * 60 * 1000;
  const HINTS_PER_CHAPTER = 3;
  const S = LumenStorage;
  const id = (chapter, chamber) => `${chapter}-${chamber}`;
  const unlimited = () => S.getSettings().unlimited;

  // Applies the refills earned since the clock started, then returns the entry.
  function retriesEntry(chapter, chamber, now = Date.now()) {
    const all = S.economy().retries;
    const entry = all[id(chapter, chamber)] || { left: MAX_RETRIES, at: now };
    while (entry.left < MAX_RETRIES && now - entry.at >= REFILL_MS) {
      entry.left++;
      entry.at += REFILL_MS;
    }
    if (entry.left >= MAX_RETRIES) entry.at = now;
    all[id(chapter, chamber)] = entry;
    return entry;
  }

  const retriesLeft = (chapter, chamber) => (unlimited() ? Infinity : retriesEntry(chapter, chamber).left);

  // Milliseconds until the next retry returns, 0 when none is missing.
  function refillIn(chapter, chamber) {
    const entry = retriesEntry(chapter, chamber);
    return entry.left >= MAX_RETRIES ? 0 : Math.max(0, entry.at + REFILL_MS - Date.now());
  }

  function spendRetry(chapter, chamber) {
    if (unlimited()) return true;
    const entry = retriesEntry(chapter, chamber);
    if (entry.left <= 0) return false;
    entry.left--;
    S.saveEconomy();
    return true;
  }

  function grantRetry(chapter, chamber) {
    const entry = retriesEntry(chapter, chamber);
    entry.left = Math.min(MAX_RETRIES, entry.left + 1);
    S.saveEconomy();
  }

  // A solved chamber starts fresh next time.
  function clearRetries(chapter, chamber) {
    delete S.economy().retries[id(chapter, chamber)];
    S.saveEconomy();
  }

  function hintsEntry(chapter) {
    const all = S.economy().hints;
    all[chapter] = all[chapter] || { used: 0, extra: 0 };
    return all[chapter];
  }

  const hintsLeft = (chapter) => (unlimited() ? Infinity : Math.max(0, HINTS_PER_CHAPTER + hintsEntry(chapter).extra - hintsEntry(chapter).used));

  function spendHint(chapter) {
    if (unlimited()) return true;
    if (hintsLeft(chapter) <= 0) return false;
    hintsEntry(chapter).used++;
    S.saveEconomy();
    return true;
  }

  function grantHint(chapter) {
    hintsEntry(chapter).extra++;
    S.saveEconomy();
  }

  // "m:ss" for the refill countdown.
  const clock = (ms) => `${Math.floor(ms / 60000)}:${String(Math.ceil((ms % 60000) / 1000) % 60).padStart(2, '0')}`;

  return { MAX_RETRIES, HINTS_PER_CHAPTER, retriesLeft, refillIn, spendRetry, grantRetry, clearRetries, hintsLeft, spendHint, grantHint, clock };
})();
