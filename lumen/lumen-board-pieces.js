// SVG piece builders for the Lumen board. One cell is 50 units and sizes
// follow the design's fractions of a cell. Builders append into the layer
// they are given: `base` sits under the beams, `top` above them.
const LumenPieces = (() => {
  const CELL = 50, PAD = 4;
  const NS = 'http://www.w3.org/2000/svg';
  const BEAM = { 1: '#D0203F', 2: '#0F9E5E', 4: '#2F6BF0', 3: '#DDA100', 5: '#C02BB8', 6: '#0C9DB3', 7: '#FFFFFF' };
  // An unlit ring wears its beam colour so the player knows which beam to
  // guide there; a white ring would vanish on its white fill, so it is grey.
  const ringColor = (color) => (color === 7 ? '#8A93A0' : BEAM[color]);
  const KEYLINE = { 3: '#8F6A00', 7: '#5B6170' };
  const ACCENT = '#44648A', DARK_RING = '#5B6170', PORTAL_B = '#9A5698';

  const centre = (v) => PAD + (v + 0.5) * CELL;
  const rgba = (hex, a) => `rgba(${parseInt(hex.slice(1, 3), 16)},${parseInt(hex.slice(3, 5), 16)},${parseInt(hex.slice(5, 7), 16)},${a})`;

  function el(tag, attrs = {}, parent) {
    const node = document.createElementNS(NS, tag);
    for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
    if (parent) parent.append(node);
    return node;
  }

  // Stone block: fills its whole cell and bridges to any stone neighbour so a
  // run of blocks reads as one wall. A pale facet, a crack and a dark foot
  // make it rock rather than a tile; the facet flips on alternate cells.
  function wall(base, [x, y], walls = new Set()) {
    const cx = centre(x), cy = centre(y), h = CELL / 2, f = (x + y) % 2 ? -1 : 1;
    const g = el('g', { class: 'wall' }, base);
    el('rect', { x: cx - h, y: cy - h, width: CELL, height: CELL, rx: 5 }, g);
    if (walls.has(`${x + 1},${y}`)) el('rect', { x: cx + h - 6, y: cy - h, width: 12, height: CELL }, g);
    if (walls.has(`${x},${y + 1}`)) el('rect', { x: cx - h, y: cy + h - 6, width: CELL, height: 12 }, g);
    const px = (d) => cx + f * d;
    el('polygon', { points: `${px(-h + 5)},${cy - h + 5} ${px(h - 15)},${cy - h + 5} ${px(-h + 5)},${cy + h - 17}`, class: 'facet' }, g);
    el('polyline', { points: `${px(h - 6)},${cy - h + 9} ${px(h - 14)},${cy - 2} ${px(h - 9)},${cy + 6} ${px(h - 20)},${cy + h - 10}`, class: 'crack' }, g);
    el('rect', { x: cx - h + 6, y: cy + h - 9, width: CELL - 12, height: 4, rx: 2, class: 'foot' }, g);
  }

  // Tap-to-turn mirror, or a stone mirror that never turns (no hit area).
  function mirror(base, top, m, index, onTap) {
    const cx = centre(m.x), cy = centre(m.y);
    const tile = el('rect', { x: cx - 20, y: cy - 20, width: 40, height: 40, rx: 11, class: m.fixed ? 'mirror-tile fixed' : 'mirror-tile' }, base);
    const g = el('g', { class: m.fixed ? 'mirror fixed' : 'mirror' }, top);
    const bar = el('rect', { x: cx - 15, y: cy - 2.5, width: 30, height: 5, rx: 2.5, class: 'mirror-bar' }, g);
    bar.style.transformOrigin = `${cx}px ${cy}px`;
    if (!m.fixed) {
      g.setAttribute('tabindex', 0);
      g.setAttribute('role', 'button');
      g.setAttribute('aria-label', `Mirror ${index + 1}`);
      el('rect', { x: cx - 25, y: cy - 25, width: 50, height: 50, fill: 'transparent', class: 'mirror-hit' }, g);
      g.addEventListener('click', () => onTap(index));
      g.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onTap(index); } });
    }
    return { g, tile, bar, m };
  }

  // Half-silvered glass: two thin bars along the mirror line.
  function splitter(base, top, s) {
    const cx = centre(s.x), cy = centre(s.y);
    el('rect', { x: cx - 20, y: cy - 20, width: 40, height: 40, rx: 11, class: 'splitter-tile' }, base);
    const g = el('g', { class: 'splitter', transform: `rotate(${s.type === 'slash' ? -45 : 45} ${cx} ${cy})` }, top);
    el('rect', { x: cx - 15, y: cy - 4.5, width: 30, height: 2.5, rx: 1.25, class: 'splitter-bar' }, g);
    el('rect', { x: cx - 15, y: cy + 2, width: 30, height: 2.5, rx: 1.25, class: 'splitter-bar' }, g);
  }

  // Tinted glass square; the beam crosses it and keeps only this colour.
  function filter(base, f) {
    const cx = centre(f.x), cy = centre(f.y);
    el('rect', { x: cx - 18, y: cy - 18, width: 36, height: 36, rx: 10, fill: BEAM[f.color], 'fill-opacity': 0.22, stroke: BEAM[f.color], 'stroke-width': 2, class: 'filter' }, base);
  }

  // Paired doors share a colour so the player can match them.
  function portal(top, p, pairIndex) {
    const cx = centre(p.x), cy = centre(p.y);
    const color = pairIndex % 2 ? PORTAL_B : ACCENT;
    const g = el('g', { class: 'portal' }, top);
    el('circle', { cx, cy, r: 14, fill: 'none', stroke: color, 'stroke-width': 3, 'stroke-dasharray': '5 3' }, g);
    el('circle', { cx, cy, r: 4, fill: color }, g);
  }

  // White disc under the beams and a coloured core over them, so the beam
  // visibly leaves the core and crosses the disc instead of hiding under it.
  function source(base, top, s) {
    const cx = centre(s.x), cy = centre(s.y);
    el('circle', { cx, cy, r: 17, class: 'source-disc' }, base);
    const core = el('circle', { cx, cy, r: 8, class: 'source-core', fill: BEAM[s.color], stroke: KEYLINE[s.color] || 'none', 'stroke-width': 1 }, top);
    core.style.filter = `drop-shadow(0 0 5px ${rgba(s.color === 7 ? DARK_RING : BEAM[s.color], 0.4)})`;
  }

  // Ring to light with an exact colour, or a dark ring (color 0) to keep unlit.
  function target(top, t) {
    const cx = centre(t.x), cy = centre(t.y);
    const dark = t.color === 0;
    const g = el('g', { class: dark ? 'target dark' : 'target' }, top);
    const ring = el('circle', { cx, cy, r: 15, class: 'ring', fill: '#FFFFFF', 'stroke-width': 4, stroke: dark ? DARK_RING : ringColor(t.color) }, g);
    const core = el('circle', { cx, cy, r: 8, class: 'core', fill: dark ? DARK_RING : BEAM[t.color] }, g);
    if (KEYLINE[t.color]) core.setAttribute('stroke', KEYLINE[t.color]);
    if (dark) el('line', { x1: cx - 5, y1: cy - 5, x2: cx + 5, y2: cy + 5, stroke: DARK_RING, 'stroke-width': 2.5, 'stroke-linecap': 'round', class: 'dark-mark' }, g);
    return { g, ring, core, t };
  }

  // One piece in its own small SVG, drawn exactly as on the board, for the
  // hint lines. kind: fixed | splitter | filter | portal | dark | ring.
  function icon(kind, color) {
    const svg = el('svg', { viewBox: `${PAD} ${PAD} ${CELL} ${CELL}`, class: 'board hint-icon', 'aria-hidden': 'true' });
    const cell = { x: 0, y: 0, type: 'slash', fixed: true, color };
    if (kind === 'fixed') mirror(svg, svg, cell, 0).bar.style.transform = 'rotate(-45deg)';
    else if (kind === 'splitter') splitter(svg, svg, cell);
    else if (kind === 'filter') filter(svg, cell);
    else if (kind === 'portal') portal(svg, cell, 0);
    else if (kind === 'dark') target(svg, { ...cell, color: 0 });
    else if (kind === 'ring') { const r = target(svg, cell); r.g.classList.add('lit'); r.ring.setAttribute('stroke', BEAM[color]); }
    return svg;
  }

  return { CELL, PAD, BEAM, ringColor, KEYLINE, DARK_RING, centre, rgba, el, wall, mirror, splitter, filter, portal, source, target, icon };
})();
