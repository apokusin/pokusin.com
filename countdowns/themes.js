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
    { transform: 'translateY(32px) skewY(8deg)', opacity: .3, offset: .25 },
    { transform: 'translateY(-12px)', opacity: 1, offset: .65 },
    { transform: 'translateY(0)', opacity: 1 }
  ] : [
    { transform: 'translateY(0) rotate(0)' },
    { transform: 'translateY(-18px) rotate(-3deg)', offset: .35 },
    { transform: 'translateY(3px) rotate(1deg)', offset: .8 },
    { transform: 'translateY(0) rotate(0)' }
  ], { duration: control ? 900 : 1400, delay: i * 30, easing: 'cubic-bezier(.2,.8,.2,1)' }));
  if (control) hero.querySelector('.reset-echo').animate([
    { opacity: 0, transform: 'translateX(-8%) rotate(-6deg)' },
    { opacity: .18, transform: 'translateX(3%) rotate(2deg)', offset: .4 },
    { opacity: 0, transform: 'translateX(8%) rotate(6deg)' }
  ], { duration: 1300, easing: 'ease-out' });
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
  scene.add(new THREE.HemisphereLight(0xffffff, 0x8c7c65, 1.9));
  const key = new THREE.DirectionalLight(0xffffff, 2.4);
  key.position.set(-3, 6, 5); key.castShadow = true;
  key.shadow.mapSize.set(512, 512); key.shadow.camera.left = -6; key.shadow.camera.right = 6;
  key.shadow.camera.top = 6; key.shadow.camera.bottom = -6; key.shadow.bias = -.002;
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xffefcf, 1.5); rim.position.set(4, 4, -2); scene.add(rim);
  const root = new THREE.Group(); scene.add(root);
  const mat = (color, metalness = 0, roughness = .5) => new THREE.MeshStandardMaterial({ color, metalness, roughness });
  const gold = mat(0xb49142, .72, .25), silver = mat(0x665b47, .68, .36);
  const enamel = mat(0xd9d7c9, .15, .33), dark = mat(0x161b1a, .3, .4);
  const velvet = mat(0xcbbb96, 0, .96), red = mat(0x750706, .1, .38);
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
    const geo = new THREE.ExtrudeGeometry(shape, { depth: d, bevelEnabled: true, bevelSegments: 2, steps: 1, bevelSize: .025, bevelThickness: .025, curveSegments: 6 });
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
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(18, 10), new THREE.ShadowMaterial({ opacity: .13 }));
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
    // Off-white instrument housing, recessed seven-segment display, real cable and cover.
    box(5.5, 1.4, .75, enamel, -1.18, .79, 0);
    box(4, .76, .06, dark, -.75, .87, .43);
    for (let x of [-3.68, 1.32]) for (let y of [.25, 1.32]) {
      mesh(new THREE.SphereGeometry(.055, 12, 8), silver, x, y, .43);
      box(.052, .008, .014, dark, x, y, .485);
    }
    for (let x of [-3.2, .8]) box(.26, .13, .48, dark, x, .04, 0);
    const displayCanvas = document.createElement('canvas'); displayCanvas.width = 1024; displayCanvas.height = 192;
    const ctx = displayCanvas.getContext('2d'); const texture = new THREE.CanvasTexture(displayCanvas); texture.colorSpace = THREE.SRGBColorSpace;
    const display = mesh(new THREE.PlaneGeometry(3.78, .63), new THREE.MeshBasicMaterial({ map: texture }), -.75, .89, .515);
    display.castShadow = false;
    const segments = [[14,0,30,6],[43,7,6,33],[43,47,6,33],[14,80,30,6],[7,47,6,33],[7,7,6,33],[14,40,30,6]];
    const digits = ['1111110','0110000','1101101','1111001','0110011','1011011','1011111','1110000','1111111','1111011'];
    let displayText = '', displayPlans = [], spinUntil = 0, queuedDisplay = null;
    const drawDigit = (char, x, y) => segments.forEach((segment, i) => {
      ctx.fillStyle = digits[Number(char)][i] === '1' ? '#f16b55' : '#29302b';
      ctx.fillRect(x + segment[0], y + segment[1], segment[2], segment[3]);
    });
    paintDisplay = ms => {
      ctx.fillStyle = '#101716'; ctx.fillRect(0, 0, 1024, 192);
      ctx.save(); ctx.translate(51, 18); ctx.scale(1.65, 1.65);
      let x = 0, moving = false;
      [...displayText].forEach((char, i) => {
        if (char === ':') { ctx.fillStyle='#d25e4a'; ctx.fillRect(x+4,24,5,5);ctx.fillRect(x+4,58,5,5);x+=18;return; }
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
      ctx.restore(); ctx.fillStyle='#828b7e';ctx.font='16px monospace';
      ['d','h','m','s'].forEach((u,i)=>ctx.fillText(u,140+i*224,181));
      texture.needsUpdate = true;
      if (queuedDisplay && ms >= spinUntil) {
        const values = queuedDisplay; queuedDisplay = null; displayUpdate(values); return true;
      }
      return moving;
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
    box(1.25,.42,1.08,enamel,3.04,.2,.05);
    mesh(new THREE.CylinderGeometry(.34,.36,.12,32),silver,3.04,.45,.1);
    button = mesh(new THREE.CylinderGeometry(.28,.3,.18,32),red,3.04,.58,.1);
    cover = new THREE.Group(); cover.position.set(3.04,.48,-.47);root.add(cover);
    const glass = new THREE.MeshPhysicalMaterial({ color:0xbaccc5,transparent:true,opacity:.16,roughness:.12,metalness:.05,depthWrite:false,side:THREE.DoubleSide });
    box(1.16,.09,1.02,glass,0,.29,.53,cover);
    for (let x of [-.57,.57]) box(.028,.34,1.02,glass,x,.15,.53,cover);
    box(1.16,.34,.028,glass,0,.15,1.03,cover);
    const lidCrown=crown(cover,.34);lidCrown.position.set(0,.37,.55);
    tube([[1.59,.63,0],[1.97,.54,.03],[2.17,.15,.08],[2.42,.19,.07]],dark,.045);
    root.rotation.y = -.025;
  }
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  let visible = true, pointerX = 0, pointerY = 0, lastFrame = 0, frameId = 0, burstAt = -10;
  function render() { if (visible && !document.hidden) renderer.render(scene,camera); }
  function resize() {
    const w = stage.clientWidth, h = stage.clientHeight; renderer.setSize(w,h,false);camera.aspect=w/h;
    if (control) {
      camera.position.z = 12.4;
      const distance = camera.position.distanceTo(new THREE.Vector3(0, .35, 0));
      camera.fov = 2 * Math.atan((10.6 / camera.aspect) / (2 * distance)) * 180 / Math.PI;
    }
    camera.updateProjectionMatrix();render();
  }
  new ResizeObserver(resize).observe(stage);resize();
  const observer=new IntersectionObserver(es=>{visible=es[0].isIntersecting; schedule();});observer.observe(stage);
  stage.addEventListener('pointermove',e=>{const r=stage.getBoundingClientRect();pointerX=(e.clientX-r.left)/r.width-.5;pointerY=(e.clientY-r.top)/r.height-.5;schedule();});
  stage.addEventListener('pointerleave',()=>{pointerX=pointerY=0;schedule();});
  canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();stage.classList.remove('scene-ready');visible=false;cancelAnimationFrame(frameId);frameId=0;});
  document.addEventListener('visibilitychange',schedule);
  const clock=new THREE.Clock();
  function schedule(){if(!frameId&&visible&&!document.hidden)frameId=requestAnimationFrame(animate);}
  function animate(ms){
    frameId=0;if(!visible||document.hidden)return;
    if(ms-lastFrame<32){schedule();return;}lastFrame=ms;
    const t=clock.getElapsedTime();
    const targetY=(control?-.025:-.13)+(reduce.matches?0:pointerX*(control?.035:.35));
    const targetX=reduce.matches?0:pointerY*.025;
    root.rotation.y=THREE.MathUtils.lerp(root.rotation.y,targetY,reduce.matches?1:.08);
    root.rotation.x=THREE.MathUtils.lerp(root.rotation.x,targetX,reduce.matches?1:.08);
    if(royalCrown){
      const b=Math.max(0,1-(t-burstAt)/2.5);
      royalCrown.position.y=.93+(reduce.matches?0:Math.sin(b*Math.PI)*1.15);
      royalCrown.rotation.y=reduce.matches?0:b*Math.PI*4;
    }
    if(cover)cover.rotation.x=THREE.MathUtils.lerp(cover.rotation.x,coverOpen?-1.9:0,reduce.matches?1:.13);
    if(button)button.position.y=.58-(t-pressTime<.2?.09:0);
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
    if(turning||crowning||releasing||rolling||particles.length||(cover&&Math.abs(cover.rotation.x-(coverOpen?-1.9:0))>.001))schedule();
  }
  sceneChange=()=>{schedule();};
  celebrate=()=>{
    burstAt=clock.getElapsedTime();pressTime=burstAt;
    if(!reduce.matches){
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
