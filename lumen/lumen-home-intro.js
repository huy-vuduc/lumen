// Builds the home title sequence from a small table of pieces. Positions are
// offsets from the title's centre, taken from the design's 390 x 844 artboard.
const LumenHomeIntro = (() => {
  const BEAM = { r: '#D0203F', b: '#2F6BF0', g: '#0F9E5E' };
  const GLOW = { r: 'rgba(208, 32, 63, 0.42)', b: 'rgba(47, 107, 240, 0.42)', g: 'rgba(15, 158, 94, 0.42)' };
  const LOOP = '16s ease-in-out infinite';

  // [kind, colour, left, top, extra]; extra holds width/height/origin for beams.
  const PIECES = [
    ['beam', 'r', -153, -103, { w: 156, h: 6, origin: '3px 3px', anim: 'grow-r1' }],
    ['beam', 'r', -3, -103, { w: 6, h: 106, origin: '3px 3px', anim: 'grow-r2' }],
    ['beam', 'b', 147, -153, { w: 6, h: 156, origin: '3px 3px', anim: 'grow-b1' }],
    ['beam', 'b', 62, -3, { w: 91, h: 6, origin: '88px 3px', anim: 'grow-b2' }],
    ['beam', 'g', -68, 122, { w: 166, h: 6, origin: '163px 3px', anim: 'grow-g1' }],
    ['beam', 'g', -68, -3, { w: 6, h: 131, origin: '3px 128px', anim: 'grow-g2' }],
    ['tile', 'r', -20, -120], ['tile', 'b', 130, -20], ['tile', 'g', -85, 105],
    ['source', 'r', -167, -117], ['source', 'b', 133, -167], ['source', 'g', 78, 108],
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
      Object.assign(node.style, { width: `${x.w}px`, height: `${x.h}px`, background: BEAM[c], boxShadow: `0 0 10px 1.5px ${GLOW[c]}`, transformOrigin: x.origin, animation: `${x.anim} ${LOOP}` });
    } else if (kind === 'tile') {
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
