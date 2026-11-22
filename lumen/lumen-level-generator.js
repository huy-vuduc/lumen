// Procedural level generator for Lumen. Deterministic for a given seed.
// Every target is built by walking outward from it, placing a mirror at each
// turn, so the far end of the walk is where the source goes. Mechanics are
// layered onto those walks: a splitter joins two rings to one source, a
// filter sits on a straight leg in front of a white source, a portal jumps
// mid-leg, stone mirrors are never scrambled and dark rings sit where a wrong
// mirror would send the beam. The brute-force solver then confirms the result
// is a real puzzle before it is accepted.
const LumenLevelGenerator = (() => {
  const E = LumenEngine;
  const DIR_NAMES = Object.keys(E.DIRS);
  const OPPOSITE = { up: 'down', down: 'up', left: 'right', right: 'left' };
  const k = (x, y) => `${x},${y}`;

  // Small seeded PRNG (mulberry32) so levels never change between sessions.
  function rng(seed) {
    let a = seed >>> 0;
    return () => {
      a = (a + 0x6D2B79F5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const pick = (r, arr) => arr[Math.floor(r() * arr.length)];
  const randInt = (r, lo, hi) => lo + Math.floor(r() * (hi - lo + 1));

  // Mirror type that turns a beam travelling `inDir` into `outDir`.
  function mirrorFor(inDir, outDir) {
    const [dx, dy] = E.DIRS[inDir];
    const [ox, oy] = E.reflect(dx, dy, 'slash');
    return ox === E.DIRS[outDir][0] && oy === E.DIRS[outDir][1] ? 'slash' : 'back';
  }

  const inside = (size, x, y) => x >= 0 && y >= 0 && x < size && y < size;
  // Free cells ahead of (x, y) in direction dir.
  function runway(ctx, x, y, dir) {
    const [dx, dy] = E.DIRS[dir];
    let n = 0;
    while (inside(ctx.size, x + dx * (n + 1), y + dy * (n + 1)) && !ctx.used.has(k(x + dx * (n + 1), y + dy * (n + 1)))) n++;
    return n;
  }
  function freeCells(ctx) {
    const out = [];
    for (let y = 0; y < ctx.size; y++) for (let x = 0; x < ctx.size; x++) if (!ctx.used.has(k(x, y))) out.push([x, y]);
    return out;
  }

  // Walk outward from `from` along `dir`, turning `turns` times. Marks cells
  // used, records straight cells (filter spots) and stray lines (dark ring
  // spots). Returns the end cell and the last walk direction, or null.
  function walk(ctx, from, dir, turns) {
    const { r, level } = ctx;
    let x = from.x, y = from.y;
    for (let leg = 0; leg <= turns; leg++) {
      const [dx, dy] = E.DIRS[dir];
      let free = runway(ctx, x, y, dir);
      if (free === 0) return null;
      if (ctx.portalsLeft > 0 && r() < 0.7) {
        // Portal: stop part-way along the leg and continue from a far free cell.
        const k1 = randInt(r, 1, free);
        for (let i = 1; i < k1; i++) { ctx.used.add(k(x + dx * i, y + dy * i)); ctx.straight.push([x + dx * i, y + dy * i]); }
        const a = { x: x + dx * k1, y: y + dy * k1 };
        ctx.used.add(k(a.x, a.y));
        const far = freeCells(ctx).filter(([cx, cy]) => Math.abs(cx - a.x) + Math.abs(cy - a.y) >= 3 && runway(ctx, cx, cy, dir) >= 2);
        if (!far.length) return null;
        const b = pick(r, far);
        ctx.used.add(k(b[0], b[1]));
        level.portals.push([a, { x: b[0], y: b[1] }]);
        ctx.portalsLeft--;
        x = b[0]; y = b[1];
        free = runway(ctx, x, y, dir);
      }
      const len = leg === turns ? randInt(r, Math.min(2, free), free) : randInt(r, 1, free);
      for (let i = 1; i <= len; i++) { ctx.used.add(k(x + dx * i, y + dy * i)); if (i < len) ctx.straight.push([x + dx * i, y + dy * i]); }
      x += dx * len; y += dy * len;
      if (leg === turns) break;
      const next = pick(r, DIR_NAMES.filter((d) => d !== dir && d !== OPPOSITE[dir]));
      // The beam travels toward the target, so it arrives moving OPPOSITE[next].
      level.mirrors.push({ x, y, type: mirrorFor(OPPOSITE[next], OPPOSITE[dir]), fixed: false, path: true });
      ctx.strays.push({ x, y, dir: OPPOSITE[next] });
      dir = next;
    }
    return { x, y, dir };
  }

  function startDir(ctx, cell) {
    const dirs = DIR_NAMES.filter((d) => runway(ctx, cell.x, cell.y, d) >= 1);
    return dirs.length ? pick(ctx.r, dirs) : null;
  }

  // Plain target: one walk per colour, each ending in a source of that colour.
  // With a filter, the source turns white and a filter of the ring's colour
  // sits on one straight cell of the walk.
  function plainTarget(ctx, spec, colors) {
    const spot = pick(ctx.r, freeCells(ctx));
    if (!spot) return false;
    const target = { x: spot[0], y: spot[1], color: colors.reduce((a, b) => a | b, 0) };
    ctx.used.add(k(target.x, target.y));
    ctx.level.targets.push(target);
    for (const color of colors) {
      ctx.straight = [];
      const dir = startDir(ctx, target);
      const end = dir && walk(ctx, target, dir, spec.turns);
      if (!end) return false;
      let sourceColor = color;
      if (ctx.filtersLeft > 0 && ctx.straight.length) {
        const cell = pick(ctx.r, ctx.straight);
        ctx.level.filters.push({ x: cell[0], y: cell[1], color });
        ctx.used.add(k(cell[0], cell[1]));
        ctx.filtersLeft--;
        sourceColor = 7;
      }
      ctx.level.sources.push({ x: end.x, y: end.y, dir: OPPOSITE[end.dir], color: sourceColor });
    }
    return true;
  }

  // Split target: ring A, a splitter S, ring B off the splitter's side, and one
  // source behind S. The beam passes straight to A and reflects to B.
  function splitTarget(ctx, spec, color) {
    const spot = pick(ctx.r, freeCells(ctx));
    if (!spot) return false;
    const a = { x: spot[0], y: spot[1], color };
    ctx.used.add(k(a.x, a.y));
    ctx.level.targets.push(a);
    ctx.straight = [];
    const dir = startDir(ctx, a);
    const s = dir && walk(ctx, a, dir, randInt(ctx.r, 0, 1));
    if (!s) return false;
    const w1 = s.dir;
    const side = DIR_NAMES.filter((d) => d !== w1 && d !== OPPOSITE[w1] && runway(ctx, s.x, s.y, d) >= 1);
    if (!side.length || runway(ctx, s.x, s.y, w1) < 1) return false;
    const u = pick(ctx.r, side);
    const b = walk(ctx, s, u, randInt(ctx.r, 0, 1));
    if (!b) return false;
    ctx.level.targets.push({ x: b.x, y: b.y, color });
    const src = walk(ctx, s, w1, spec.turns);
    if (!src) return false;
    ctx.level.splitters.push({ x: s.x, y: s.y, type: mirrorFor(OPPOSITE[w1], u) });
    ctx.level.sources.push({ x: src.x, y: src.y, dir: OPPOSITE[src.dir], color });
    return true;
  }

  function addExtras(ctx, spec) {
    const { r, level } = ctx;
    // Dark rings go on the straight line a wrong mirror would send the beam down.
    for (let i = 0; i < spec.dark; i++) {
      const stray = pick(r, ctx.strays);
      if (!stray) break;
      const [dx, dy] = E.DIRS[stray.dir];
      const d = randInt(r, 1, Math.max(1, runway(ctx, stray.x, stray.y, stray.dir)));
      const x = stray.x + dx * d, y = stray.y + dy * d;
      if (!inside(ctx.size, x, y) || ctx.used.has(k(x, y))) continue;
      ctx.used.add(k(x, y));
      level.targets.push({ x, y, color: 0 });
    }
    // Only path mirrors are scrambled: flipping a decoy would add a "move" the
    // solver never needs. Stone mirrors are chosen from what the scramble leaves.
    const pathMirrors = level.mirrors.filter((m) => m.path).sort(() => r() - 0.5);
    if (pathMirrors.length < spec.scramble) return false;
    pathMirrors.slice(0, spec.scramble).forEach((m) => { m.type = E.toggle(m.type); });
    pathMirrors.slice(spec.scramble, spec.scramble + spec.fixed).forEach((m) => { m.fixed = true; });
    const place = (count, make) => {
      for (let i = 0; i < count; i++) {
        const spot = pick(r, freeCells(ctx));
        if (!spot) return;
        ctx.used.add(k(spot[0], spot[1]));
        make(spot[0], spot[1]);
      }
    };
    place(spec.decoys, (x, y) => level.mirrors.push({ x, y, type: pick(r, ['slash', 'back']), fixed: false }));
    place(spec.fixedDecoys, (x, y) => level.mirrors.push({ x, y, type: pick(r, ['slash', 'back']), fixed: true }));
    place(spec.walls, (x, y) => level.walls.push([x, y]));
    return true;
  }

  function attempt(spec, r) {
    const level = { width: spec.size, height: spec.size, sources: [], targets: [], mirrors: [], walls: [], splitters: [], filters: [], portals: [] };
    const ctx = { r, size: spec.size, used: new Set(), level, straight: [], strays: [], portalsLeft: spec.portals, filtersLeft: spec.filters };
    for (const t of spec.targets) {
      const ok = t.split ? splitTarget(ctx, spec, t.split) : plainTarget(ctx, spec, t.colors);
      if (!ok) return null;
    }
    if (!addExtras(ctx, spec)) return null;
    level.mirrors.forEach((m) => { delete m.path; });
    return level;
  }

  function tryGenerate(spec, r, tries) {
    for (let i = 0; i < tries; i++) {
      const level = attempt(spec, r);
      if (!level) continue;
      if (E.trace(level, level.mirrors.map((m) => m.type)).solved) continue;
      const min = E.minimumMoves(level);
      if (min < spec.minMoves) continue;
      level.minMoves = min;
      level.extraMoves = spec.extraMoves;
      return level;
    }
    return null;
  }

  const DEFAULTS = { walls: 0, decoys: 0, fixedDecoys: 0, fixed: 0, filters: 0, portals: 0, dark: 0, scramble: 1, minMoves: 1, extraMoves: 1 };

  // Generate a verified level. If the seed is unlucky for a tight spec, relax
  // it step by step so every chamber always exists.
  function generate(rawSpec, seed) {
    const spec = { ...DEFAULTS, ...rawSpec };
    const r = rng(seed);
    const easier = (s) => ({ ...s, minMoves: Math.max(2, s.minMoves - 1), scramble: Math.max(2, s.scramble - 1) });
    const relaxations = [
      spec,
      easier(spec),
      { ...easier(spec), fixed: 0, portals: 0, filters: 0 },
      { ...easier(easier(spec)), turns: Math.max(1, spec.turns - 1), fixed: 0, portals: 0, filters: 0, dark: 0 },
      { ...spec, turns: 1, minMoves: 1, scramble: 1, portals: 0, dark: 0, fixed: 0, filters: 0, targets: spec.targets.map((t) => (t.split ? { colors: [t.split] } : t)) },
    ];
    for (const s of relaxations) {
      const level = tryGenerate(s, r, 400);
      if (level) return level;
    }
    throw new Error(`Could not generate a level for seed ${seed}`);
  }

  return { generate };
})();

if (typeof module !== 'undefined') module.exports = LumenLevelGenerator;
