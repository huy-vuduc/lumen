// Generates every Lumen chamber and checks it is a real puzzle.
// Prints minimum moves + spare / rotatable mirrors, the mechanics present and
// the generation time per chapter. Run: node scripts/verify-lumen-levels.js
const path = require('path');
const root = path.join(__dirname, '..', 'lumen');
global.LumenEngine = require(path.join(root, 'lumen-engine.js'));
global.LumenLevelGenerator = require(path.join(root, 'lumen-level-generator.js'));
const chapters = require(path.join(root, 'lumen-chapters.js'));

let ok = true;
for (const chapter of chapters.CHAPTERS) {
  const row = [];
  const started = Date.now();
  let slowest = 0;
  for (let n = 1; n <= chapters.LEVELS_PER_CHAPTER; n++) {
    const t0 = Date.now();
    try {
      const level = chapters.level(chapter.id, n);
      const start = LumenEngine.trace(level, level.mirrors.map((m) => m.type));
      if (start.solved || level.minMoves < 1) ok = false;
      const rotatable = level.mirrors.filter((m) => !m.fixed).length;
      const marks = [
        level.mirrors.some((m) => m.fixed) ? 'F' : '',
        level.splitters.length ? 'S' : '',
        level.filters.length ? 'L' : '',
        level.portals.length ? 'P' : '',
        level.targets.some((t) => t.color === 0) ? 'D' : '',
      ].join('');
      row.push(`${level.minMoves}+${level.extraMoves}/${rotatable}${marks ? ' ' + marks : ''}`);
    } catch (err) {
      ok = false;
      row.push('FAIL');
    }
    slowest = Math.max(slowest, Date.now() - t0);
  }
  console.log(`Ch${String(chapter.id).padStart(2)} ${chapter.name.en.padEnd(14)} ${row.join(' | ')}  [${Date.now() - started} ms, slowest ${slowest} ms]`);
}
console.log(ok ? 'ALL LEVELS OK' : 'PROBLEM FOUND');
process.exit(ok ? 0 : 1);
