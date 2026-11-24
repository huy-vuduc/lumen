// Builds the home title sequence from a small table of pieces. Positions are
// offsets from the title's centre, taken from the design's 390 x 844 artboard.
const LumenHomeIntro = (() => {
  const BEAM = { r: '#D0203F', b: '#2F6BF0', g: '#0F9E5E' };
  const GLOW = { r: 'rgba(208, 32, 63, 0.42)', b: 'rgba(47, 107, 240, 0.42)', g: 'rgba(15, 158, 94, 0.42)' };
  const LOOP = '16s ease-in-out infinite';

  // [kind, colour, left, top, extra]; extra holds width/height/origin for beams.
  // A beam ends exactly at the mirror's centre so the joint stays under the bar.
  // Listed back to front, as on the board: tiles and sources, then beams
  // running over the tiles up to the bars, then the bars and dots on top.
  const PIECES = [
    ['tile', 'r', -20, -120], ['tile', 'b', 130, -20], ['tile', 'g', -85, 105],
    ['source', 'r', -167, -117], ['source', 'b', 133, -167], ['source', 'g', 78, 108],
    ['beam', 'r', -153, -103, { w: 153, h: 6, origin: '3px 3px', anim: 'grow-r1' }],
    ['beam', 'r', -3, -100, { w: 6, h: 103, origin: '3px 3px', anim: 'grow-r2' }],
    ['beam', 'b', 147, -153, { w: 6, h: 153, origin: '3px 3px', anim: 'grow-b1' }],
    ['beam', 'b', 62, -3, { w: 88, h: 6, origin: '88px 3px', anim: 'grow-b2' }],
    ['beam', 'g', -65, 122, { w: 160, h: 6, origin: '160px 3px', anim: 'grow-g1' }],
    ['beam', 'g', -68, -3, { w: 6, h: 128, origin: '3px 125px', anim: 'grow-g2' }],
    ['bar', 'r', -20, -120], ['bar', 'b', 130, -20], ['bar', 'g', -85, 105],
    ['dot', 'r', -6, -6], ['dot', 'b', 59, -6], ['dot', 'g', -71, -6],
    ['reveal', '', -15, -15], ['glow', '', -12, -12],
  ];

  function piece([kind, c, left, top, x = {}]) {
    const node = document.createElement('div');
    node.className = `intro-${kind}`;
    node.style.left = `${left}px`;
    node.style.top = `${top}px`;
    if (c) { node.style.setProperty('--c', BEAM[c]); node.style.setProperty('--glow', GLOW[c]); }
    if (kind === 'beam') {
      Object.assign(node.style, { width: `${x.w}px`, height: `${x.h}px`, background: BEAM[c], filter: `drop-shadow(0 0 5px ${GLOW[c]})`, transformOrigin: x.origin, animation: `${x.anim} ${LOOP}` });
    } else if (kind === 'tile') {
      node.style.animation = `show-${c} ${LOOP}`;
    } else if (kind === 'bar') {
      node.style.animation = `show-${c} ${LOOP}`;
      const bar = document.createElement('i');
      bar.style.animation = `turn-${c} ${LOOP}`;
      node.append(bar);
    } else if (kind === 'source') {
      node.style.animation = `show-${c} ${LOOP}`;
      node.append(document.createElement('i'));
    } else if (kind === 'dot') {
      node.style.animation = `dot-${c} ${LOOP}`;
    } else {
      node.style.animation = `intro-${kind} ${LOOP}`;
    }
    return node;
  }

  function mount(titleBlock) {
    if (titleBlock.querySelector('.intro')) return;
    const scene = document.createElement('div');
    scene.className = 'intro';
    scene.setAttribute('aria-hidden', 'true');
    scene.append(...PIECES.map(piece));
    titleBlock.prepend(scene);
  }

  return { mount };
})();
