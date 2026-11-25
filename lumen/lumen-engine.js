// Lumen engine: pure beam tracing with no DOM access.
// Shared by the page, the level generator and Node verification scripts.
// Pieces: mirrors (tap to turn, or fixed), walls, splitters (straight + reflected
// beam), filters (keep only the filter's colour), portals (paired doors) and
// targets (a colour mask to match; 0 means the ring must stay dark).
const LumenEngine = (() => {
  const DIRS = { up: [0, -1], right: [1, 0], down: [0, 1], left: [-1, 0] };
  const key = (x, y) => `${x},${y}`;

  // "/" sends a rightward beam up; "\" sends it down.
  function reflect(dx, dy, type) {
    return type === 'slash' ? [-dy, -dx] : [dy, dx];
  }

  function buildCellMap(level) {
    const map = new Map();
    level.walls.forEach(([x, y]) => map.set(key(x, y), { kind: 'wall' }));
    level.sources.forEach((s, i) => map.set(key(s.x, s.y), { kind: 'source', index: i }));
    level.targets.forEach((t, i) => map.set(key(t.x, t.y), { kind: 'target', index: i }));
    level.mirrors.forEach((m, i) => map.set(key(m.x, m.y), { kind: 'mirror', index: i }));
    (level.splitters || []).forEach((s) => map.set(key(s.x, s.y), { kind: 'splitter', type: s.type }));
    (level.filters || []).forEach((f) => map.set(key(f.x, f.y), { kind: 'filter', color: f.color }));
    (level.portals || []).forEach((pair) => pair.forEach((p, j) => map.set(key(p.x, p.y), { kind: 'portal', other: pair[1 - j] })));
    return map;
  }

  // Trace every beam for the given mirror orientations.
  // Returns { segments, hits, solved, litCells }. Segment coordinates are cell
  // centres; a beam that leaves the grid or meets a wall stops at the boundary.
  function trace(level, mirrorTypes) {
    const cells = buildCellMap(level);
    const segments = [];
    const hits = level.targets.map(() => 0);
    const litCells = new Set();

    for (const src of level.sources) {
      const [sdx, sdy] = DIRS[src.dir];
      const queue = [{ x: src.x, y: src.y, dx: sdx, dy: sdy, color: src.color }];
      const seen = new Set();
      let guard = level.width * level.height * 8;
      // Returns true when this beam state was already followed (a loop).
      const looped = (x, y, dx, dy, color) => {
        const state = `${x},${y},${dx},${dy},${color}`;
        if (seen.has(state)) return true;
        seen.add(state);
        return false;
      };

      while (queue.length && guard > 0) {
        let { x, y, dx, dy, color } = queue.shift();
        let ax = x, ay = y; // start of the current straight run
        litCells.add(key(x, y));

        while (guard-- > 0) {
          const nx = x + dx, ny = y + dy;
          const outside = nx < 0 || ny < 0 || nx >= level.width || ny >= level.height;
          const cell = outside ? null : cells.get(key(nx, ny));

          if (outside || cell?.kind === 'wall' || cell?.kind === 'source') {
            segments.push({ x1: ax, y1: ay, x2: x + dx / 2, y2: y + dy / 2, color });
            break;
          }
          litCells.add(key(nx, ny));
          if (cell?.kind === 'target') {
            segments.push({ x1: ax, y1: ay, x2: nx, y2: ny, color });
            hits[cell.index] |= color;
            break;
          }
          if (cell?.kind === 'mirror') {
            segments.push({ x1: ax, y1: ay, x2: nx, y2: ny, color });
            [dx, dy] = reflect(dx, dy, mirrorTypes[cell.index]);
            ax = nx; ay = ny;
            if (looped(nx, ny, dx, dy, color)) break;
          } else if (cell?.kind === 'splitter') {
            segments.push({ x1: ax, y1: ay, x2: nx, y2: ny, color });
            const [rx, ry] = reflect(dx, dy, cell.type);
            if (!looped(nx, ny, rx, ry, color)) queue.push({ x: nx, y: ny, dx: rx, dy: ry, color });
            ax = nx; ay = ny;
            if (looped(nx, ny, dx, dy, color)) break;
          } else if (cell?.kind === 'filter') {
            segments.push({ x1: ax, y1: ay, x2: nx, y2: ny, color });
            color &= cell.color;
            ax = nx; ay = ny;
            if (!color || looped(nx, ny, dx, dy, color)) break;
          } else if (cell?.kind === 'portal') {
            segments.push({ x1: ax, y1: ay, x2: nx, y2: ny, color });
            x = cell.other.x; y = cell.other.y;
            litCells.add(key(x, y));
            ax = x; ay = y;
            if (looped(x, y, dx, dy, color)) break;
            continue;
          }
          x = nx; y = ny;
        }
      }
    }

    const solved = hits.every((h, i) => h === level.targets[i].color);
    return { segments, hits, solved, litCells };
  }

  function toggle(type) {
    return type === 'slash' ? 'back' : 'slash';
  }

  // Fewest toggles from the starting orientation that solve the level, or -1.
  // Tries every set of k mirrors for k = 0, 1, 2... so the search stops as
  // soon as the smallest solution is found.
  function minimumMoves(level) {
    const rotatable = level.mirrors.map((m, i) => (m.fixed ? -1 : i)).filter((i) => i >= 0);
    const types = level.mirrors.map((m) => m.type);
    const flip = (i) => { types[i] = toggle(types[i]); };
    // Flip `left` more mirrors chosen from rotatable[from..]; true once solved.
    function search(from, left) {
      if (left === 0) return trace(level, types).solved;
      for (let i = from; i <= rotatable.length - left; i++) {
        flip(rotatable[i]);
        if (search(i + 1, left - 1)) return true;
        flip(rotatable[i]);
      }
      return false;
    }
    for (let k = 0; k <= rotatable.length; k++) if (search(0, k)) return k;
    return -1;
  }

  return { DIRS, reflect, trace, toggle, minimumMoves };
})();

if (typeof module !== 'undefined') module.exports = LumenEngine;
