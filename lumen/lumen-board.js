// SVG board for Lumen. Builds the pieces once per level and updates beams,
// fog and piece states on every change. The SVG scales with its container.
const LumenBoard = (() => {
  const P = LumenPieces;
  const { CELL, PAD, BEAM, DUSTY, KEYLINE, DARK_RING, centre, rgba, el } = P;
  // Travel speed of a redrawn beam, slow enough to follow; instant when the
  // viewer asked for reduced motion (the stylesheet also drops the animation).
  const MS_PER_CELL = matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 130;
  const FOG_OPACITY = [0, 0.55, 0.96]; // on the beam, beside it, dense

  function mount(svg, level, { fogColor, onMirrorTap }) {
    const size = level.width * CELL + PAD * 2;
    svg.setAttribute('viewBox', `0 0 ${size} ${size}`);
    svg.replaceChildren();
    // Layers, bottom to top: fog, tiles and walls, beams, then bars, sources and
    // targets. Beams run over a mirror's tile up to its bar, as in the design.
    const gFog = el('g', { class: 'fog' }, svg);
    const gBase = el('g', { class: 'base' }, svg);
    const gBeams = el('g', { class: 'beams' }, svg);
    const gTop = el('g', { class: 'pieces' }, svg);

    const fogCells = [];
    for (let y = 0; y < level.height; y++) {
      for (let x = 0; x < level.width; x++) {
        // Edge cells run past the board so the blur leaves no pale rim.
        const x0 = x === 0 ? -12 : PAD + x * CELL - 1;
        const y0 = y === 0 ? -12 : PAD + y * CELL - 1;
        const x1 = x === level.width - 1 ? size + 12 : PAD + (x + 1) * CELL + 1;
        const y1 = y === level.height - 1 ? size + 12 : PAD + (y + 1) * CELL + 1;
        fogCells.push(el('rect', { x: x0, y: y0, width: x1 - x0, height: y1 - y0, fill: fogColor, class: 'fog-cell' }, gFog));
      }
    }
    const wallKeys = new Set(level.walls.map(([x, y]) => `${x},${y}`));
    level.walls.forEach((w) => P.wall(gBase, w, wallKeys));
    (level.filters || []).forEach((f) => P.filter(gBase, f));
    (level.splitters || []).forEach((s) => P.splitter(gBase, gTop, s));
    (level.portals || []).forEach((pair, i) => pair.forEach((p) => P.portal(gTop, p, i)));
    const mirrors = level.mirrors.map((m, i) => P.mirror(gBase, gTop, m, i, onMirrorTap));
    level.sources.forEach((s) => P.source(gBase, gTop, s));
    const targets = level.targets.map((t) => P.target(gTop, t));

    const jointKeys = new Set([...level.mirrors, ...(level.splitters || []), ...(level.filters || []), ...(level.portals || []).flat()].map((m) => `${m.x},${m.y}`));
    // A beam entering one door continues from the other, so the other door
    // inherits the arrival time.
    const portalPartner = new Map();
    (level.portals || []).forEach(([a, b]) => { portalPartner.set(`${a.x},${a.y}`, `${b.x},${b.y}`); portalPartner.set(`${b.x},${b.y}`, `${a.x},${a.y}`); });
    let previousSegments = new Set();

    // Fog level of a cell (0 on the beam, 1 beside it, 2 dense) and how long
    // to wait before clearing it: the moment the beam head reaches the
    // nearest lit cell, so the fog dissolves in step with the beam.
    function fogState(x, y, lit, cellArrival) {
      for (let d = 0; d <= 1; d++) {
        let wait = Infinity;
        for (let dy = -d; dy <= d; dy++) for (let dx = -d; dx <= d; dx++) {
          const k = `${x + dx},${y + dy}`;
          if (lit.has(k)) wait = Math.min(wait, cellArrival.get(k) ?? 0);
        }
        if (wait < Infinity) return { level: d, wait };
      }
      return { level: 2, wait: 0 };
    }

    // Segments arrive in travel order. A changed segment starts drawing when
    // the beam head reaches its start; unchanged ones are already lit, so a
    // new branch leaving them starts at once instead of replaying the route.
    function drawBeams(segments) {
      gBeams.replaceChildren();
      const seen = new Set();
      const arrival = new Map(); // segment end point -> ms the beam head gets there
      const cellArrival = new Map(); // every cell on a beam -> earliest ms it is lit
      for (const s of segments) {
        const key = `${s.x1},${s.y1},${s.x2},${s.y2},${s.color}`;
        seen.add(key);
        const cells = Math.abs(s.x2 - s.x1) + Math.abs(s.y2 - s.y1);
        const isNew = !previousSegments.has(key);
        const start = arrival.get(`${s.x1},${s.y1}`) ?? 0;
        const end = isNew ? start + cells * MS_PER_CELL : 0;
        const ux = Math.sign(s.x2 - s.x1), uy = Math.sign(s.y2 - s.y1);
        for (let d = 0; d <= Math.floor(cells); d++) {
          const k = `${s.x1 + ux * d},${s.y1 + uy * d}`;
          const at = isNew ? start + d * MS_PER_CELL : 0;
          cellArrival.set(k, Math.min(cellArrival.get(k) ?? Infinity, at));
        }
        arrival.set(`${s.x2},${s.y2}`, end);
        if (portalPartner.has(`${s.x2},${s.y2}`)) arrival.set(portalPartner.get(`${s.x2},${s.y2}`), end);
        // Butt caps where an arm meets a piece so the bar hides the joint cleanly.
        const cap = jointKeys.has(`${s.x1},${s.y1}`) || jointKeys.has(`${s.x2},${s.y2}`) ? 'butt' : 'round';
        const attrs = { x1: centre(s.x1), y1: centre(s.y1), x2: centre(s.x2), y2: centre(s.y2), 'stroke-linecap': cap };
        // pathLength 1 lets the stylesheet draw each line with a unit dash;
        // the keyline under pale beams travels together with the beam.
        const lines = [];
        if (KEYLINE[s.color]) lines.push(el('line', { ...attrs, stroke: KEYLINE[s.color], 'stroke-width': 8, class: 'beam keyline', pathLength: 1 }, gBeams));
        const line = el('line', { ...attrs, stroke: BEAM[s.color], 'stroke-width': 6, class: 'beam', pathLength: 1 }, gBeams);
        line.style.filter = `drop-shadow(0 0 5px ${rgba(s.color === 7 ? DARK_RING : BEAM[s.color], 0.42)})`;
        lines.push(line);
        if (isNew) lines.forEach((l) => { l.style.animation = `beam-draw ${cells * MS_PER_CELL}ms linear ${start}ms both`; });
        // A beam that ends on a stone face leaves a smudge of its colour there.
        if (wallKeys.has(`${s.x2 + ux / 2},${s.y2 + uy / 2}`)) {
          const spot = el('ellipse', { cx: centre(s.x2) + ux * 2, cy: centre(s.y2) + uy * 2, rx: ux ? 3 : 9, ry: ux ? 9 : 3, fill: BEAM[s.color], class: 'beam-impact' }, gBeams);
          if (isNew) spot.style.animation = `impact 240ms ease-out ${end}ms both`;
        }
      }
      previousSegments = seen;
      return { arrival, cellArrival };
    }

    // Paints one target for the colour mix reaching it (0 = nothing).
    function paintTarget({ g, ring, core, t }, hit) {
      const dark = t.color === 0;
      const correct = !dark && hit === t.color;
      g.classList.toggle('lit', correct);
      g.classList.toggle('wrong', hit !== 0 && !correct);
      ring.setAttribute('stroke', correct ? BEAM[t.color] : dark ? DARK_RING : DUSTY[t.color]);
      ring.style.filter = correct ? `drop-shadow(0 0 9px ${rgba(t.color === 7 ? DARK_RING : BEAM[t.color], 0.38)})` : '';
      core.setAttribute('r', correct ? 8 : 5);
      core.setAttribute('fill', correct ? BEAM[t.color] : BEAM[hit] || (dark ? DARK_RING : BEAM[t.color]));
    }
    let pendingLights = [];

    // result comes from LumenEngine.trace; mirrorTypes is the current orientation list.
    // Returns the time in ms until the last redrawn beam reaches its end.
    function update(mirrorTypes, result, { fog = true } = {}) {
      const { arrival, cellArrival } = drawBeams(result.segments);
      pendingLights.forEach(clearTimeout);
      pendingLights = [];
      const levels = [];
      let i = 0;
      for (let y = 0; y < level.height; y++) {
        for (let x = 0; x < level.width; x++) {
          const { level: lv, wait } = fog ? fogState(x, y, result.litCells, cellArrival) : { level: 0, wait: 0 };
          levels.push(lv);
          const cell = fogCells[i++];
          // Fog clears when the beam arrives; it thickens again at once.
          const current = cell.style.opacity === '' ? 1 : Number(cell.style.opacity);
          cell.style.transitionDelay = `${current > FOG_OPACITY[lv] ? wait : 0}ms`;
          cell.style.opacity = FOG_OPACITY[lv];
        }
      }
      const dense = (x, y) => levels[y * level.width + x] === 2;
      mirrors.forEach(({ g, tile, bar, m }, idx) => {
        bar.style.transform = `rotate(${mirrorTypes[idx] === 'slash' ? -45 : 45}deg)`;
        g.classList.toggle('fogged', dense(m.x, m.y));
        tile.classList.toggle('fogged', dense(m.x, m.y));
      });
      // A target lights only once the beam head gets there; losing a beam is immediate.
      targets.forEach((target, idx) => {
        const hit = result.hits[idx];
        const { g, t } = target;
        g.classList.toggle('fogged', dense(t.x, t.y) && !hit);
        const wait = hit ? arrival.get(`${t.x},${t.y}`) ?? 0 : 0;
        if (wait > 0) {
          paintTarget(target, 0);
          pendingLights.push(setTimeout(() => paintTarget(target, hit), wait));
        } else paintTarget(target, hit);
      });
      return Math.max(0, ...arrival.values());
    }

    // Marks a mirror for a moment, used by the "show a mirror" hint.
    function highlight(i) {
      mirrors[i].tile.classList.add('hinted');
      setTimeout(() => mirrors[i].tile.classList.remove('hinted'), 2600);
    }

    return { update, highlight };
  }

  return { mount, BEAM: P.BEAM };
})();
