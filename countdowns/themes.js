// Static archive worlds share one countdown via the small Pages Function.
import { NumberReel, reelPlan, reelPosition } from './reels.js';
const theme = document.documentElement.dataset.theme;
const control = theme === 'control';
const art = document.documentElement.classList.contains('art-project');
const sceneFirst = document.documentElement.classList.contains('scene-project');
const action = document.getElementById('scene-action');
const royalButton = document.getElementById('royal-reset');
const secret = document.getElementById('countdown-secret');
const countLabel = document.getElementById('reset-count');
const clockStatus = document.getElementById('clock-status');
const hero = document.getElementById(art ? 'art-hero' : 'hero-surface');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const dateLabel = document.getElementById('next-countdown-date');
const initialDeadline = Date.parse(dateLabel.dateTime);
let state = { deadline: initialDeadline, count: 0 };
let celebrate = () => {}, ready = false, pending = false, clockOffset = 0, tickInterval = 0;
const reelEnabled = () => hero.classList.contains('hero-awake') && !document.hidden;
const countReel = new NumberReel(countLabel, { enabled: reelEnabled, reducedMotion, direction: 1 });
const timerReels = ['days', 'hours', 'minutes', 'seconds'].map(unit => new NumberReel(
  document.querySelector(`[data-unit="${unit}"]`), { enabled: () => !control && reelEnabled(), reducedMotion }
));
const fallbackReel = new NumberReel(document.getElementById('fallback-digits'), {
  enabled: () => control && reelEnabled() && !document.getElementById('scene-stage').classList.contains('scene-ready'), reducedMotion
});
function updateLabels(spin = false) {
  countReel.set(state.count.toLocaleString(), { spin });
  clockStatus.textContent = '';
  dateLabel.dateTime = new Date(state.deadline).toISOString();
  dateLabel.textContent = new Date(state.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
function applyState(next, forceSpin = false) {
  if (!Number.isFinite(next.deadline) || !Number.isFinite(next.serverNow) || !Number.isSafeInteger(next.count) || next.count < 0) throw new Error('Invalid countdown');
  // A slower GET must never overwrite a newer reset response.
  if (next.count < state.count || (ready && next.count === state.count && next.serverNow < state.serverNow)) return;
  const spin = ready && (forceSpin || next.count > state.count);
  const remote = ready && !forceSpin && next.count > state.count;
  state = next;
  clockOffset = next.serverNow - Date.now(); ready = true;
  updateLabels(spin); tick(spin); startTicker();
  if (remote) document.dispatchEvent(new CustomEvent('countdown:remote'));
}
async function sync() {
  if (document.hidden || pending) return;
  try {
    const response = await fetch('/api/countdown', { cache: 'no-store' });
    if (!response.ok) throw new Error('Unavailable');
    applyState(await response.json());
  } catch (_) { if (!ready) clockStatus.textContent = 'The shared clock is taking a little break.'; }
}
async function reset() {
  if (pending) return;
  pending = true; action.disabled = true; if (royalButton) royalButton.disabled = true;
  document.dispatchEvent(new CustomEvent('countdown:pending',{detail:true}));
  try {
    const response = await fetch('/api/countdown', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
    if (response.status === 429) {
      const seconds = Number(response.headers.get('Retry-After')) || 60;
      clockStatus.textContent = `Give the button a breather. Try again in ${seconds} seconds.`;
      return;
    }
    if (!response.ok) throw new Error('Unavailable');
    applyState(await response.json(), true);
    if (!art) { secret.hidden = false; action.setAttribute('aria-expanded', 'true'); royalButton?.setAttribute('aria-expanded', 'true'); }
    document.dispatchEvent(new CustomEvent('countdown:reset'));
    celebrate(); if (!art) animatePageReset();
  } catch (_) { clockStatus.textContent = 'The clock refused. Try again in a moment.'; }
  finally { pending = false; action.disabled = false; if (royalButton) royalButton.disabled = false; document.dispatchEvent(new CustomEvent('countdown:pending',{detail:false})); }
}
let coverOpen = false;
function press() {
  if (control && !coverOpen) {
    coverOpen = true; action.setAttribute('aria-label', 'Postpone the next countdown');
    action.dataset.open = 'true'; sceneChange(); return;
  }
  reset();
}
if (control) action.setAttribute('aria-label', 'Lift the launch button cover');
action.addEventListener('click', press);
royalButton?.addEventListener('click', reset);
document.querySelectorAll(`[data-theme-link="${theme}"]`).forEach(link=>link.setAttribute('aria-current', 'page'));
document.querySelectorAll('.shownav a').forEach(link => {
  link.setAttribute('href', `?theme=${theme}#${link.getAttribute('href').split('#').pop()}`);
});
// The theatre reads forward through the archive; the broadcast starts with the live work.
if (control) {
  const shelves = document.getElementById('archive-shelves');
  shelves.append(...Array.from(shelves.children).reverse());
  const nav = document.querySelector('.shownav');
  nav.append(...Array.from(nav.children).reverse());
}
if ('IntersectionObserver' in window) {
  const reveal = new IntersectionObserver(entries => {
    for (const entry of entries) if (entry.isIntersecting) {
      entry.target.classList.add('in-view'); reveal.unobserve(entry.target);
    }
  }, { rootMargin: '0px 0px 80px 0px', threshold: .03 });
  document.querySelectorAll('.shelf').forEach(shelf => reveal.observe(shelf));
  document.documentElement.classList.add('motion-ready');
  let inFrame = true;
  const awake = () => hero.classList.toggle('hero-awake', inFrame && !document.hidden);
  new IntersectionObserver(entries => { inFrame = entries[0].isIntersecting; awake(); }).observe(hero);
  document.addEventListener('visibilitychange', awake);
} else hero.classList.add('hero-awake');
function animatePageReset() {
  if (reducedMotion.matches) return;
  hero.querySelectorAll('.title-glyph').forEach((glyph, i) => glyph.animate(control ? [
    { transform: 'translateY(0)', opacity: 1 },
    { transform: 'translateY(6px)', opacity: .82, offset: .16 },
    { transform: 'translateY(-2px)', opacity: 1, offset: .37 },
    { transform: 'translateY(0)', opacity: 1 }
  ] : [
    { transform: 'translateY(0) rotate(0)' },
    { transform: 'translateY(-18px) rotate(-3deg)', offset: .35 },
    { transform: 'translateY(3px) rotate(1deg)', offset: .8 },
    { transform: 'translateY(0) rotate(0)' }
  ], { duration: control ? 570 : 1400, delay: control ? i * 8 : i * 30, easing: 'cubic-bezier(.2,.8,.2,1)' }));
}
document.addEventListener('visibilitychange', () => { if (!document.hidden) sync(); });
window.addEventListener('focus', sync);
let displayUpdate = () => {};
function timeParts(s) {
  return [Math.floor(s / 86400), Math.floor(s % 86400 / 3600), Math.floor(s % 3600 / 60), s % 60];
}
function secondsRemaining() { return Math.max(0, Math.ceil((state.deadline - (Date.now() + clockOffset)) / 1000)); }
function remaining() { return timeParts(secondsRemaining()); }
function tick(spin = false) {
  const values = remaining();
  if (!values.some(value => value > 0)) { clearInterval(tickInterval); tickInterval = 0; }
  timerReels.forEach((reel, i) => reel.set(String(values[i]).padStart(2, '0'), { spin, index: i * 2 }));
  document.getElementById('countdown-ended').hidden = values.some(v => v > 0);
  document.getElementById('timer-readable').textContent = `${values[0]} days, ${values[1]} hours, ${values[2]} minutes, ${values[3]} seconds`;
  fallbackReel.set(values.map(v=>String(v).padStart(2,'0')).join(':'), { spin });
  displayUpdate(values, { spin });
}
function startTicker() {
  if (!tickInterval && secondsRemaining()) tickInterval = setInterval(tick, 1000);
}
updateLabels(); tick(); startTicker(); sync(); setInterval(sync, 30000);
let sceneChange = () => {};

async function initScene() {
  const THREE = await import('./assets/vendor/three.module.min.js');
  const stage = document.getElementById('scene-stage');
  const canvas = document.getElementById('theme-scene');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'low-power' });
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const scene = new THREE.Scene();
  let paintDisplay = () => false;
  const camera = new THREE.PerspectiveCamera(control ? 30 : 35, 1, .1, 100);
  camera.position.set(control ? 0 : 0.9, control ? 4 : 2.6, control ? 12.4 : 6.4);
  camera.lookAt(0, control ? 0.35 : 1.2, 0);
  scene.add(new THREE.HemisphereLight(control ? 0xaec5ca : 0xffffff, control ? 0x292b20 : 0x8c7c65, control ? .65 : 1.9));
  const key = new THREE.DirectionalLight(control ? 0xffdfaa : 0xffffff, control ? 3.5 : 2.4);
  key.position.set(-3, 6, 5); key.castShadow = true;
  key.shadow.mapSize.set(control ? 1024 : 512, control ? 1024 : 512); key.shadow.camera.left = -6; key.shadow.camera.right = 6;
  key.shadow.camera.top = 6; key.shadow.camera.bottom = -6; key.shadow.bias = -.002;
  scene.add(key);
  const rim = new THREE.DirectionalLight(control ? 0xaec6c4 : 0xffefcf, control ? 1.2 : 1.5); rim.position.set(4, 4, -2); scene.add(rim);
  const root = new THREE.Group(); scene.add(root);
  const mat = (color, metalness = 0, roughness = .5) => new THREE.MeshStandardMaterial({ color, metalness, roughness });
  const gold = mat(0xb49142, .72, .25), silver = mat(0x665b47, .68, .36);
  const enamel = mat(0xd9d7c9, .15, .33), dark = mat(0x161b1a, .3, .4);
  const velvet = mat(0xcbbb96, 0, .96), red = mat(0x750706, .1, .38);
  let signalStarted = -Infinity, signalLamp, signalGlow, resetAssembly, displayGlass;
  let stageWidth = 1, stageHeight = 1;
  let configureControlLayout = () => {};
  const instrumentUnits = [];
  // Control's studio is a small local texture, used only for material reflections.
  // Broad fixtures make the glass and enamel readable without a postprocessing loop.
  if (control) {
    const studio = document.createElement('canvas'); studio.width = 512; studio.height = 256;
    const studioCtx = studio.getContext('2d');
    studioCtx.fillStyle = '#222a25'; studioCtx.fillRect(0, 0, 512, 256);
    const ambient = studioCtx.createLinearGradient(0, 0, 0, 256);
    ambient.addColorStop(0, '#636658'); ambient.addColorStop(.5, '#242d28'); ambient.addColorStop(1, '#080b09');
    studioCtx.fillStyle = ambient; studioCtx.fillRect(0, 0, 512, 256);
    studioCtx.fillStyle = '#fff0d2'; studioCtx.fillRect(45, 49, 185, 13);
    studioCtx.fillStyle = '#b6d3d5'; studioCtx.fillRect(354, 65, 25, 99);
    studioCtx.fillStyle = '#95876b'; studioCtx.fillRect(110, 112, 81, 28);
    const source = new THREE.CanvasTexture(studio); source.colorSpace = THREE.SRGBColorSpace;
    source.mapping = THREE.EquirectangularReflectionMapping;
    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromEquirectangular(source).texture;
    pmrem.dispose(); source.dispose();
    const grain = document.createElement('canvas'); grain.width = grain.height = 256;
    const grainCtx = grain.getContext('2d'); const pixels = grainCtx.createImageData(256, 256);
    let seed = 701;
    for (let i = 0; i < pixels.data.length; i += 4) {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      const value = 178 + (seed >>> 27);
      pixels.data[i] = pixels.data[i + 1] = pixels.data[i + 2] = value; pixels.data[i + 3] = 255;
    }
    grainCtx.putImageData(pixels, 0, 0);
    const enamelGrain = new THREE.CanvasTexture(grain); enamelGrain.wrapS = enamelGrain.wrapT = THREE.RepeatWrapping;
    enamelGrain.repeat.set(3, 3);
    enamel.roughnessMap = enamelGrain; enamel.bumpMap = enamelGrain; enamel.bumpScale = .004;
    enamel.roughness = .63; enamel.metalness = .16; enamel.envMapIntensity = .55;
    red.color.set(0x9e2c20); red.roughness = .29; red.metalness = .15;
    silver.color.set(0x7a7969); silver.roughness = .3; silver.metalness = .8;
    dark.color.set(0x131d19); dark.roughness = .78; dark.metalness = .08;
  }
  function mesh(geometry, material, x, y, z, parent = root) {
    const object = new THREE.Mesh(geometry, material); object.position.set(x, y, z);
    object.castShadow = true; object.receiveShadow = true; parent.add(object); return object;
  }
  function box(w, h, d, material, x, y, z, parent = root) {
    const shape = new THREE.Shape(), r = Math.min(w, h) * .1;
    shape.moveTo(-w / 2 + r, -h / 2); shape.lineTo(w / 2 - r, -h / 2);
    shape.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r);
    shape.lineTo(w / 2, h / 2 - r); shape.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2);
    shape.lineTo(-w / 2 + r, h / 2); shape.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r);
    shape.lineTo(-w / 2, -h / 2 + r); shape.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2);
    const bevel = control ? Math.min(.025, w * .1, h * .2, d * .2) : .025;
    const geo = new THREE.ExtrudeGeometry(shape, { depth: d, bevelEnabled: true, bevelSegments: 2, steps: 1, bevelSize: bevel, bevelThickness: bevel, curveSegments: 6 });
    geo.translate(0, 0, -d / 2); return mesh(geo, material, x, y, z, parent);
  }
  function tube(points, material, radius = .025, parent = root) {
    const curve = new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(...p)));
    return mesh(new THREE.TubeGeometry(curve, 36, radius, 6, false), material, 0, 0, 0, parent);
  }
  function crown(parent, scale = 1) {
    const group = new THREE.Group(); parent.add(group);
    const ring = mesh(new THREE.CylinderGeometry(.25, .23, .12, 24, 1, true), gold, 0, .06, 0, group);
    ring.material.side = THREE.DoubleSide;
    for (let i = 0; i < 7; i++) {
      const a = i / 7 * Math.PI * 2;
      const spike = mesh(new THREE.ConeGeometry(.07, .25, 4), gold, Math.cos(a) * .22, .21, Math.sin(a) * .22, group);
      spike.rotation.y = -a;
      mesh(new THREE.SphereGeometry(.035, 8, 6), gold, Math.cos(a) * .22, .345, Math.sin(a) * .22, group);
    }
    group.scale.setScalar(scale); return group;
  }
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(18, 10), new THREE.ShadowMaterial({ opacity: control ? .29 : .13 }));
  floor.rotation.x = -Math.PI / 2; floor.position.y = -.08; floor.receiveShadow = true; scene.add(floor);
  let royalCrown, button, cover, pressTime = -10;
  const particles = [];
  if (!control) {
    // A proper miniature throne: turned legs, tufted upholstery and scrolling metalwork.
    box(1.25, .16, 1.1, silver, 0, .67, 0);
    box(1.13, .15, .96, velvet, 0, .81, .04);
    box(1.02, 1.36, .12, velvet, 0, 1.55, -.43);
    for (let side of [-1, 1]) {
      for (let z of [-.4, .4]) {
        const leg = mesh(new THREE.CylinderGeometry(.052, .032, .64, 10), silver, side * .5, .3, z);
        leg.rotation.z = side * -.11;
        mesh(new THREE.SphereGeometry(.075, 10, 8), silver, side * .53, .08, z);
      }
      tube([[side * .62,.7,.38],[side * .7,1.14,.38],[side * .61,1.23,.23],[side * .56,1.06,-.31]], silver, .043);
      mesh(new THREE.SphereGeometry(.1, 12, 10), silver, side * .69, 1.18, .33);
      tube([[side*.57,.81,-.43],[side*.6,1.55,-.43],[side*.55,2.12,-.43],[side*.34,2.35,-.43],[0,2.53,-.43]], silver, .042);
      tube([[side*.65,1.82,-.44],[side*.77,2.02,-.44],[side*.64,2.16,-.44],[side*.59,2.06,-.44]], silver, .022);
      tube([[side*.25,2.25,-.37],[side*.36,2.34,-.37],[side*.28,2.42,-.37],[0,2.52,-.37]], gold, .019);
    }
    mesh(new THREE.SphereGeometry(.06, 12, 10), gold, 0, 2.55, -.43);
    for (let x of [-.27, 0, .27]) for (let y of [1.2, 1.55, 1.9]) {
      mesh(new THREE.SphereGeometry(.021, 8, 6), silver, x, y, -.349);
    }
    royalCrown = crown(root, .65); royalCrown.position.set(0, .93, .05);
    root.rotation.y = -.13;
  } else {
    // Bone enamel over a sage chassis. The recessed screen, rubber feet, vents,
    // fasteners and plugs all belong to the instrument rather than a floating UI.
    const sage = enamel.clone(); sage.color.set(0x617063); sage.roughness = .79;
    const rubber = mat(0x121613, 0, .92);
    const brass = mat(0x6c6247, .72, .42);
    box(5.5, 1.4, .79, enamel, -1.18, .79, 0);
    box(5.46, .22, .79, sage, -1.18, .2, -.015);
    box(4.12, .9, .07, rubber, -.75, .88, .432);
    const aperture = new THREE.Shape();
    const roundedPath = (path, w, h, r) => {
      path.moveTo(-w / 2 + r, -h / 2); path.lineTo(w / 2 - r, -h / 2);
      path.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r);
      path.lineTo(w / 2, h / 2 - r); path.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2);
      path.lineTo(-w / 2 + r, h / 2); path.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r);
      path.lineTo(-w / 2, -h / 2 + r); path.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2);
    };
    roundedPath(aperture, 4.08, .86, .095);
    const hole = new THREE.Path(); roundedPath(hole, 3.84, .69, .055); aperture.holes.push(hole);
    const bezel = new THREE.ExtrudeGeometry(aperture, { depth: .082, bevelEnabled: true, bevelSize: .014, bevelThickness: .014, bevelSegments: 2, curveSegments: 8, steps: 1 });
    mesh(bezel, mat(0x26312a, .47, .43), -.75, .88, .423);
    for (let x of [-3.68, 1.32]) for (let y of [.25, 1.32]) {
      const screw = mesh(new THREE.CylinderGeometry(.044, .046, .014, 16), silver, x, y, .416);
      screw.rotation.x = Math.PI / 2;
      box(.049, .008, .012, rubber, x, y, .429);
      // A sparse graphite halo, where the tool has actually touched the enamel.
      const wear = mesh(new THREE.RingGeometry(.049, .072, 20), mat(0x948e7d, .15, .9), x, y, .411);
      wear.castShadow = false;
    }
    for (let x of [-3.2, .8]) for (let z of [-.24, .24]) box(.28, .13, .21, rubber, x, .04, z);
    for (let i = 0; i < 6; i++) box(.026, .49, .012, rubber, -3.47 + i * .075, .86, .417);
    // These thin seams and chamfered side stock make the shell's assembly legible.
    box(5.2, .013, .012, sage, -1.18, .365, .415);
    box(.026, 1.16, .68, sage, -3.895, .8, -.025);
    const displayCanvas = document.createElement('canvas'); displayCanvas.width = 1024; displayCanvas.height = 192;
    const ctx = displayCanvas.getContext('2d'); const texture = new THREE.CanvasTexture(displayCanvas); texture.colorSpace = THREE.SRGBColorSpace;
    const display = mesh(new THREE.PlaneGeometry(3.78, .63), new THREE.MeshBasicMaterial({ map: texture, toneMapped: false }), -.75, .89, .491);
    display.castShadow = false;
    // A very shallow curved lens catches a broad fixture rather than an arbitrary
    // opaque white stripe. The lit phosphor stays behind the smoked surface.
    const lens = new THREE.PlaneGeometry(3.81, .66, 28, 4);
    const lensPositions = lens.attributes.position;
    for (let i = 0; i < lensPositions.count; i++) {
      const x = lensPositions.getX(i) / 1.905, y = lensPositions.getY(i) / .33;
      lensPositions.setZ(i, .023 * (1 - x * x) * (1 - y * y));
    }
    lens.computeVertexNormals();
    displayGlass = new THREE.MeshPhysicalMaterial({ color: 0x778176, transparent: true, opacity: .13, roughness: .14, metalness: .04, clearcoat: 1, clearcoatRoughness: .12, envMapIntensity: .8, depthWrite: false });
    const glassFace = mesh(lens, displayGlass, -.75, .89, .499); glassFace.castShadow = false;
    const segments = [[14,0,30,6],[43,7,6,33],[43,47,6,33],[14,80,30,6],[7,47,6,33],[7,7,6,33],[14,40,30,6]];
    const digits = ['1111110','0110000','1101101','1111001','0110011','1011011','1011111','1110000','1111111','1111011'];
    let displayText = '', displayPlans = [], spinUntil = 0, queuedDisplay = null;
    const drawDigit = (char, x, y) => segments.forEach((segment, i) => {
      const lit = digits[Number(char)][i] === '1';
      ctx.shadowBlur = lit ? 6 : 0; ctx.shadowColor = '#f86b43';
      ctx.fillStyle = lit ? '#ef7953' : '#222a23';
      ctx.fillRect(x + segment[0], y + segment[1], segment[2], segment[3]);
      if (lit) {
        ctx.shadowBlur = 0; ctx.fillStyle = '#ffd3a7';
        ctx.fillRect(x + segment[0] + 1.2, y + segment[1] + 1.2, segment[2] - 2.4, segment[3] - 2.4);
      }
    });
    paintDisplay = ms => {
      const age = ms - signalStarted, reacquiring = !reduce.matches && age >= 0 && age < 1150;
      ctx.shadowBlur = 0; ctx.fillStyle = '#0b120e'; ctx.fillRect(0, 0, 1024, 192);
      ctx.save(); ctx.translate(51, 18); ctx.scale(1.65, 1.65);
      if (reacquiring) ctx.globalAlpha = age < 145 ? .43 + age / 145 * .57 : 1;
      let x = 0, moving = false;
      [...displayText].forEach((char, i) => {
        if (char === ':') {
          ctx.shadowColor = '#f57443'; ctx.shadowBlur = 5; ctx.fillStyle='#ffb380';
          ctx.fillRect(x+4,24,5,5);ctx.fillRect(x+4,58,5,5);x+=18;return;
        }
        const plan = displayPlans[i];
        const active = plan && !reduce.matches && ms < plan.started + plan.delay + plan.duration;
        if (active) {
          const position = reelPosition(plan, ms - plan.started); moving = true;
          ctx.save(); ctx.beginPath(); ctx.rect(x, -5, 56, 98); ctx.clip();
          for (let row = Math.max(0, Math.floor(position) - 1); row <= Math.min(plan.cells.length - 1, Math.ceil(position) + 1); row++) {
            drawDigit(plan.cells[row], x, (row - position) * 104);
          }
          ctx.restore();
        } else drawDigit(char, x, 0);
        x += 59;
      });
      ctx.restore(); ctx.shadowBlur = 0;
      // Screen-only optical texture: no scanline layer crosses the surrounding page.
      ctx.fillStyle = '#00000018'; for (let y = 1; y < 164; y += 4) ctx.fillRect(0, y, 1024, 1);
      const vignette = ctx.createLinearGradient(0, 0, 0, 192);
      vignette.addColorStop(0, '#00000055'); vignette.addColorStop(.15, '#00000000');
      vignette.addColorStop(.8, '#00000000'); vignette.addColorStop(1, '#00000077');
      ctx.fillStyle = vignette; ctx.fillRect(0, 0, 1024, 192);
      if (reacquiring) {
        const sweepX = -90 + age / 1150 * 1200;
        const sweep = ctx.createLinearGradient(sweepX - 38, 0, sweepX + 38, 0);
        sweep.addColorStop(0, '#ffc88a00'); sweep.addColorStop(.5, '#ffc88a35'); sweep.addColorStop(1, '#ffc88a00');
        ctx.fillStyle = sweep; ctx.fillRect(sweepX - 38, 0, 76, 192);
      }
      texture.needsUpdate = true;
      if (queuedDisplay && ms >= spinUntil) {
        const values = queuedDisplay; queuedDisplay = null; displayUpdate(values); return true;
      }
      return moving || reacquiring;
    };
    displayUpdate = (values, { spin = false } = {}) => {
      const now = performance.now(), text = values.map(v => String(v).padStart(2, '0')).join(':');
      if (now < spinUntil && !spin && !reduce.matches && visible && !document.hidden) { queuedDisplay = values; return; }
      if (text === displayText && !spin && !reduce.matches) return;
      const motion = displayText.length === text.length && !reduce.matches && visible && !document.hidden;
      let index = 0;
      displayPlans = [...text].map((char, i) => {
        if (char === ':') return null;
        const plan = motion && (spin || displayText[i] !== char)
          ? { ...reelPlan(displayText[i], char, { spin, direction: spin ? 1 : -1, index }), started: now } : null;
        index++; return plan;
      });
      spinUntil = spin && motion ? now + Math.max(...displayPlans.filter(Boolean).map(plan => plan.delay + plan.duration)) : 0;
      queuedDisplay = null; displayText = text;
      const moving = paintDisplay(now); render(); if (moving) schedule();
    };
    for (let i = 0; i < 4; i++) {
      const label = document.createElement('span'); label.className = 'control-unit-label';
      label.textContent = ['D', 'H', 'M', 'S'][i]; label.setAttribute('aria-hidden', 'true');
      label.style.cssText = 'position:absolute;pointer-events:none;transform:translate(-50%,-50%);font:500 10px "IBM Plex Mono",monospace;line-height:1;color:#e3d8c0;opacity:0;z-index:2';
      stage.append(label); instrumentUnits.push({ label, point: new THREE.Vector3(-2.08 + i * .826, .58, .524) });
    }
    resetAssembly = new THREE.Group(); root.add(resetAssembly);
    box(1.25,.42,1.08,enamel,3.04,.2,.05,resetAssembly);
    box(1.23,.09,1.06,sage,3.04,.08,.05,resetAssembly);
    for (let x of [2.57, 3.51]) for (let z of [-.32, .43]) box(.15,.09,.15,rubber,x,-.028,z,resetAssembly);
    mesh(new THREE.CylinderGeometry(.355,.37,.105,40),brass,3.04,.45,.1,resetAssembly);
    mesh(new THREE.CylinderGeometry(.312,.327,.065,40),rubber,3.04,.513,.1,resetAssembly);
    button = mesh(new THREE.CylinderGeometry(.28,.29,.13,40),red,3.04,.593,.1,resetAssembly);
    const buttonRing = mesh(new THREE.TorusGeometry(.285,.018,8,40),red,3.04,.645,.1,resetAssembly); buttonRing.rotation.x = Math.PI / 2;
    button.add(buttonRing); buttonRing.position.set(0,.052,0);
    cover = new THREE.Group(); cover.position.set(3.04,.48,-.47); resetAssembly.add(cover);
    const glass = new THREE.MeshPhysicalMaterial({ color:0xbed0ba,transparent:true,opacity:.17,roughness:.12,metalness:.02,clearcoat:1,clearcoatRoughness:.12,envMapIntensity:.8,depthWrite:false,side:THREE.DoubleSide });
    box(1.16,.055,1.02,glass,0,.29,.53,cover);
    for (let x of [-.57,.57]) {
      box(.035,.34,1.02,glass,x,.15,.53,cover);
      box(.023,.016,1.02,brass,x,.324,.53,cover);
      const hinge = mesh(new THREE.CylinderGeometry(.048,.048,.22,16),brass,x,.011,.028,cover); hinge.rotation.z = Math.PI / 2;
    }
    box(1.16,.34,.033,glass,0,.15,1.03,cover);
    box(.22,.065,.035,brass,0,.085,1.054,cover);
    const lidCrown=crown(cover,.24);lidCrown.position.set(0,.335,.58);
    const lampSocket = mesh(new THREE.CylinderGeometry(.084,.084,.021,24),brass,3.46,.426,-.24,resetAssembly);
    signalLamp = new THREE.MeshStandardMaterial({ color:0x60231b,roughness:.22,metalness:.05,emissive:0xfa7548,emissiveIntensity:.12 });
    mesh(new THREE.SphereGeometry(.060,20,12),signalLamp,3.46,.45,-.24,resetAssembly);
    signalGlow = new THREE.PointLight(0xfa7548, .04, 1.15, 2); signalGlow.position.set(3.46,.5,-.24); resetAssembly.add(signalGlow);
    // Molded strain relief at both ends, with the cable resting against the desk.
    const plug = mesh(new THREE.CylinderGeometry(.074,.074,.24,14),rubber,1.61,.37,-.08); plug.rotation.z = Math.PI / 2;
    for (let x of [1.7,1.75,1.8]) { const ridge = mesh(new THREE.TorusGeometry(.065,.009,6,14),sage,x,.37,-.08); ridge.rotation.y = Math.PI / 2; }
    const deskCable = [[1.8,.37,-.08],[2.01,.31,-.055],[2.19,.09,.12],[2.43,.11,.18]];
    const foregroundCable = [[1.8,.37,-.08],[2.15,.16,.35],[1.9,0,1.05],[.72,0,1.15],[.70,.08,1.86],[.82,.13,2.18],[1.03,.14,2.18]];
    const cable = tube(deskCable,rubber,.057);
    const endPlug = mesh(new THREE.CylinderGeometry(.071,.074,.18,14),rubber,2.43,.14,.18,resetAssembly); endPlug.rotation.z = Math.PI / 2;
    let phoneArrangement = false;
    configureControlLayout = phone => {
      if (phone === phoneArrangement) return;
      phoneArrangement = phone;
      resetAssembly.position.set(phone ? -1.4 : 0, 0, phone ? 2 : 0);
      const path = new THREE.CatmullRomCurve3((phone ? foregroundCable : deskCable).map(point => new THREE.Vector3(...point)));
      cable.geometry.dispose(); cable.geometry = new THREE.TubeGeometry(path, 48, .057, 6, false);
    };
    root.rotation.y = -.025;
  }
  let visible = true, graphicsLost = false, pointerX = 0, pointerY = 0, lastFrame = 0, frameId = 0, burstAt = -10;
  const actionBox = new THREE.Box3(), projectionPoint = new THREE.Vector3();
  function positionInstrumentControls() {
    if (!control || !resetAssembly) return;
    for (const unit of instrumentUnits) {
      projectionPoint.copy(unit.point); root.localToWorld(projectionPoint); projectionPoint.project(camera);
      unit.label.style.left = `${(projectionPoint.x * .5 + .5) * stageWidth}px`;
      unit.label.style.top = `${(-projectionPoint.y * .5 + .5) * stageHeight}px`;
      unit.label.style.fontSize = stageWidth < 600 ? '8px' : '10px'; unit.label.style.opacity = '1';
    }
    // The native keyboard/touch button follows the actual guarded assembly.
    // Its bounds include the lid while open, with a 44px minimum touch target.
    actionBox.setFromObject(resetAssembly);
    let left = Infinity, right = -Infinity, top = Infinity, bottom = -Infinity;
    for (let x of [actionBox.min.x, actionBox.max.x]) for (let y of [actionBox.min.y, actionBox.max.y]) for (let z of [actionBox.min.z, actionBox.max.z]) {
      projectionPoint.set(x, y, z).project(camera);
      const px = (projectionPoint.x * .5 + .5) * stageWidth, py = (-projectionPoint.y * .5 + .5) * stageHeight;
      left = Math.min(left, px); right = Math.max(right, px); top = Math.min(top, py); bottom = Math.max(bottom, py);
    }
    const width = Math.min(stageWidth, Math.max(44, right - left + 10));
    const height = Math.min(stageHeight, Math.max(44, bottom - top + 10));
    action.style.left = `${Math.max(0, Math.min(stageWidth - width, (left + right - width) / 2))}px`;
    action.style.top = `${Math.max(0, Math.min(stageHeight - height, (top + bottom - height) / 2))}px`;
    action.style.width = `${width}px`; action.style.height = `${height}px`; action.style.borderRadius = '10px';
  }
  function render() {
    if (visible && !graphicsLost && !document.hidden) { renderer.render(scene,camera); positionInstrumentControls(); }
  }
  function resize() {
    const w = stage.clientWidth, h = stage.clientHeight; stageWidth = w; stageHeight = h;
    if (graphicsLost) return;
    renderer.setSize(w,h,false);camera.aspect=w/h;
    if (control) {
      const phone = matchMedia('(max-width:760px)').matches;
      configureControlLayout(phone);
      const focus = new THREE.Vector3(phone ? -.75 : 0, phone ? .42 : .35, 0);
      camera.position.set(phone ? -.75 : 0, phone ? 3.7 : 4, 12.4); camera.lookAt(focus);
      const distance = camera.position.distanceTo(focus);
      camera.fov = 2 * Math.atan(((phone ? 7.4 : 10.6) / camera.aspect) / (2 * distance)) * 180 / Math.PI;
    }
    camera.updateProjectionMatrix();render();
  }
  new ResizeObserver(resize).observe(stage);resize();
  const observer=new IntersectionObserver(es=>{if(graphicsLost)return;visible=es[0].isIntersecting; schedule();});observer.observe(stage);
  stage.addEventListener('pointermove',e=>{const r=stage.getBoundingClientRect();pointerX=(e.clientX-r.left)/r.width-.5;pointerY=(e.clientY-r.top)/r.height-.5;schedule();});
  stage.addEventListener('pointerleave',()=>{pointerX=pointerY=0;schedule();});
  canvas.addEventListener('webglcontextlost',e=>{
    e.preventDefault();stage.classList.remove('scene-ready');graphicsLost=true;visible=false;cancelAnimationFrame(frameId);frameId=0;
    instrumentUnits.forEach(unit => unit.label.remove());
    if (control) {
      ['left','top','width','height','border-radius'].forEach(property => action.style.removeProperty(property));
      coverOpen = true; action.setAttribute('aria-label', 'Postpone the next countdown');
    }
  });
  document.addEventListener('visibilitychange',schedule);
  document.addEventListener('countdown:pending',schedule);
  reduce.addEventListener('change',schedule);
  const clock=new THREE.Clock();
  function schedule(){if(!frameId&&visible&&!graphicsLost&&!document.hidden)frameId=requestAnimationFrame(animate);}
  function animate(ms){
    frameId=0;if(!visible||graphicsLost||document.hidden)return;
    if(ms-lastFrame<32){schedule();return;}lastFrame=ms;
    const t=clock.getElapsedTime();
    const targetY=(control?-.025:-.13)+(reduce.matches?0:pointerX*(control?.035:.35));
    const targetX=control||reduce.matches?0:pointerY*.025;
    root.rotation.y=THREE.MathUtils.lerp(root.rotation.y,targetY,reduce.matches?1:.08);
    root.rotation.x=THREE.MathUtils.lerp(root.rotation.x,targetX,reduce.matches?1:.08);
    let reflecting = false;
    if (control) {
      const reflectionX = reduce.matches ? 0 : pointerY * .11, reflectionY = reduce.matches ? 0 : pointerX * .1;
      scene.environmentRotation.x = THREE.MathUtils.lerp(scene.environmentRotation.x, reflectionX, reduce.matches ? 1 : .08);
      scene.environmentRotation.y = THREE.MathUtils.lerp(scene.environmentRotation.y, reflectionY, reduce.matches ? 1 : .08);
      reflecting = Math.abs(scene.environmentRotation.x - reflectionX) > .0005 || Math.abs(scene.environmentRotation.y - reflectionY) > .0005;
    }
    if(royalCrown){
      const b=Math.max(0,1-(t-burstAt)/2.5);
      royalCrown.position.y=.93+(reduce.matches?0:Math.sin(b*Math.PI)*1.15);
      royalCrown.rotation.y=reduce.matches?0:b*Math.PI*4;
    }
    if(cover)cover.rotation.x=THREE.MathUtils.lerp(cover.rotation.x,coverOpen?-1.9:0,reduce.matches?1:.13);
    if(button)button.position.y=.593-(t-pressTime<.2?.075:0);
    if (signalLamp) {
      const age = ms - signalStarted, acquiring = !reduce.matches && age >= 0 && age < 1150;
      const color = pending ? 0xffb75b : 0xfa7548;
      signalLamp.color.set(pending ? 0x9b6524 : 0x8d3423); signalLamp.emissive.set(color);
      signalLamp.emissiveIntensity = pending ? 1.6 : acquiring ? 1.8 - age / 1150 : coverOpen ? .8 : .12;
      signalGlow.color.set(color); signalGlow.intensity = pending ? .16 : acquiring ? .24 * (1 - age / 1150) : coverOpen ? .075 : .015;
    }
    const rolling = control && paintDisplay(ms);
    for(let i=particles.length-1;i>=0;i--){
      const p=particles[i],age=t-p.userData.birth;
      if(age>2.3){root.remove(p);p.traverse(o=>o.geometry?.dispose());particles.splice(i,1);continue;}
      p.position.set(p.userData.x+p.userData.vx*age,.7+p.userData.vy*age-age*age*1.2,.3+p.userData.vz*age);
      p.rotation.y+=.07;p.rotation.z+=.025;p.scale.setScalar(.15*Math.min(1,(2.3-age)*2));
    }
    render();
    const turning=Math.abs(root.rotation.y-targetY)>.0005||Math.abs(root.rotation.x-targetX)>.0005;
    const crowning=royalCrown&&!reduce.matches&&t-burstAt<2.5;
    const releasing=button&&t-pressTime<.2;
    if(turning||reflecting||crowning||releasing||rolling||particles.length||(cover&&Math.abs(cover.rotation.x-(coverOpen?-1.9:0))>.001))schedule();
  }
  sceneChange=()=>{schedule();};
  celebrate=()=>{
    burstAt=clock.getElapsedTime();pressTime=burstAt;
    if(control)signalStarted=performance.now();
    if(!control&&!reduce.matches){
      // Three little crowns: an appropriately underwhelming coronation.
      for(let i=0;i<3;i++){
        const p=crown(root,.15);p.userData={birth:burstAt,x:control?3.04:0,vx:(i-1)*.55,vy:1.8+Math.random()*.6,vz:.2+Math.random()*.3};particles.push(p);
      }
    }
    schedule();
  };
  tick();render();stage.classList.add('scene-ready');schedule();
}
function revealArtSecret(){
  const trigger=hero.querySelector('.art-secret-trigger');
  secret.hidden=!secret.hidden;trigger.setAttribute('aria-expanded',String(!secret.hidden));
  if(secret.hidden)return;
  // Keep the note out of moving, centered projection containers.
  const onHero=theme!=='the-almost-fair';if(onHero)hero.append(secret);
  // Discoveries stay near their clue, inside the view, and clear of time/reset controls.
  const area=hero.querySelector('.art-reset-area'),hr=hero.getBoundingClientRect(),br=trigger.getBoundingClientRect();
  secret.style.cssText=`position:absolute;margin:0;width:max-content;max-width:${Math.max(44,hr.width-24)}px;right:auto;bottom:auto;transform:translateX(-50%);text-align:center;z-index:20`;
  const sr=secret.getBoundingClientRect();
  // Measure after removing the note from flow: pinned parents center their own height.
  const pr=onHero||getComputedStyle(area).position==='static'?hr:area.getBoundingClientRect();
  const center=Math.max(hr.left+sr.width/2+12,Math.min(hr.right-sr.width/2-12,br.left+br.width/2));
  const left=center-sr.width/2,right=center+sr.width/2;
  const controls=[royalButton,...hero.querySelectorAll('.clock-unit,.art-mounts a.card')].map(e=>e.getBoundingClientRect());
  const minTop=Math.max(0,hr.top)+12,maxTop=Math.min(innerHeight,hr.bottom)-sr.height-12;
  const candidates=[br.bottom+10,br.top-sr.height-10,...controls.flatMap(r=>[r.top-sr.height-4,r.bottom+4])];
  const clear=y=>y>=minTop&&y<=maxTop&&!controls.some(r=>left<r.right+2&&right>r.left-2&&y<r.bottom+2&&y+sr.height>r.top-2);
  const top=candidates.find(clear)??Math.max(minTop,Math.min(maxTop,br.top-sr.height-10));
  secret.style.left=`${center-pr.left}px`;secret.style.top=`${top-pr.top}px`;
}
if (art) {
  const sceneModule = sceneFirst ? './scene-host.js' : './exhibition.js';
  import(`${sceneModule}?v=${document.documentElement.dataset.artVersion}`).then(module => (sceneFirst ? module.initSceneHost : module.initExhibition)({
    theme,reducedMotion,requestReset:reset,getDigits:remaining,
    getTally:()=>state.count,getSnapshot:()=>({deadline:state.deadline,now:Date.now()+clockOffset,ready}),
    revealSecret:sceneFirst?()=>{
      secret.hidden=!secret.hidden;
      document.querySelector('.art-secret-trigger').setAttribute('aria-expanded',String(!secret.hidden));
    }:revealArtSecret
  })).catch(error=>{
    // This tiny DOM path also works when the optional exhibition module itself is blocked.
    const style=document.querySelector('link[href^="concepts/"]');if(style)document.head.append(style);
    hero.hidden=false;hero.classList.add('art-scene-unavailable');
    const clock=document.querySelector('.royal-clock');
    if(clock){clock.classList.replace('royal-clock','art-clock');clock.querySelector('.throne-space')?.remove();
      clock.querySelectorAll('.clock-unit small').forEach((el,i)=>el.textContent=['D','H','M','S'][i]);hero.append(clock);}
    royalButton.classList.remove('royal-only');royalButton.textContent='Again';
    royalButton.removeAttribute('aria-expanded');royalButton.removeAttribute('aria-controls');
    const tally=countLabel.closest('.press-tally');tally.classList.add('art-tally');tally.querySelector('small').textContent='';
    hero.querySelector('.art-reset-area').append(royalButton,tally,clockStatus,secret,document.getElementById('countdown-ended'));
    hero.append(document.getElementById('timer-readable'));
    hero.querySelector('.art-secret-trigger').addEventListener('click',revealArtSecret);
    console.warn('The art archive could not initialize; live controls remain available.',error.message);
  });
} else initScene().catch(error => {
  if (control) {
    coverOpen = true; action.setAttribute('aria-label', 'Postpone the next countdown');
    document.querySelector('.scene-hint .control-only').textContent = 'Press the button.';
  }
  console.warn('The 3D scene is unavailable; using the illustrated version.',error.message);
});
