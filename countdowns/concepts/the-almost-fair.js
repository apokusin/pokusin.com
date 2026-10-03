// A hand-authored fair, rather than a game engine: paths, seven exhibits and one visitor.
export async function create(ctx) {
  const T = ctx.THREE;
  let disposed = false, ready = false;
  const version = document.documentElement.dataset.artVersion || '1';
  const [{ createFairMaterials }, { createFairArchitecture }, { createFairMachinery }] = await Promise.all([
    import(`./fair-materials.js?v=${version}`), import(`./fair-architecture.js?v=${version}`), import(`./fair-machinery.js?v=${version}`)
  ]);
  const world = new T.Group(); ctx.root.add(world);
  const environment = createFairMaterials(ctx, world);
  const { materials, palette, sun } = environment;
  const roundCream = materials.roundCream;
  // The lens frames both the low foreground visitor and the tall clock, without head bob.
  const camera = new T.PerspectiveCamera(48, 1, .1, 90); ctx.setCamera(camera);
  const unitBox = new T.BoxGeometry(1, 1, 1);
  const unitCylinder = new T.CylinderGeometry(.5, .5, 1, 12);
  const unitCone = new T.CylinderGeometry(.03, .5, 1, 8);
  const batches = new Map();
  const matrix = new T.Matrix4(), quaternion = new T.Quaternion(), scaleVector = new T.Vector3(), positionVector = new T.Vector3();
  const euler = new T.Euler();
  function batch(kind, material, x, y, z, sx, sy, sz, rx = 0, ry = 0, rz = 0, castShadow = true) {
    const geometry = kind === 'cylinder' ? unitCylinder : kind === 'cone' ? unitCone : unitBox;
    const key = `${kind}-${material}-${castShadow}`;
    if (!batches.has(key)) batches.set(key, { geometry, material: materials[material], castShadow, matrices: [] });
    positionVector.set(x, y, z); scaleVector.set(sx, sy, sz); euler.set(rx, ry, rz); quaternion.setFromEuler(euler);
    matrix.compose(positionVector, quaternion, scaleVector);
    batches.get(key).matrices.push(matrix.clone());
  }
  function mesh(geometry, material, x, y, z, parent = world) {
    const object = new T.Mesh(geometry, material); object.position.set(x, y, z);
    object.castShadow = true; object.receiveShadow = true; parent.add(object); return object;
  }
  function box(w, h, d, material, x, y, z, parent) { return mesh(new T.BoxGeometry(w, h, d), material, x, y, z, parent); }

  // The graph is also the visible cream promenade. Click travel never crosses a pavilion.
  const nodes = [
    [0, 7], [0, 4], [-3, 2.8], [-5.8, 1.65], [-8, -2.5], [-10, -4.4],
    [-5.5, -8.1], [0, -9], [0, -10.6], [5.5, -8.1], [10, -4.4],
    [8, -2.5], [5.8, 1.65], [3, 3.15], [0, -3.5],
    [-9.2, 1.65], [-9.2, -2.5], [9.2, 1.65], [9.2, -2.5], [-7, -4.4], [7, -4.4]
  ].map(([x, z]) => ({ x, z, edges: [] }));
  // Outer bends clear the front pavilions; short apron bends clear the two rear doorways.
  const edges = [[0,1],[1,2],[2,3],[3,15],[15,16],[16,4],[4,5],[5,19],[19,6],
    [6,7],[7,8],[7,9],[9,20],[20,10],[10,11],[11,18],[18,17],[17,12],
    [12,13],[13,1],[4,14],[14,11],[14,7]];
  // One triangulated capsule union makes a continuous promenade: no overlapping discs or cracks.
  function walkwayShape() {
    const step = .2, left = -13, back = -13, columns = 130, rows = 113, radius = 1.225;
    function field(x, z) {
      let distance = Infinity;
      for (const [a, b] of edges) {
        const A = nodes[a], B = nodes[b], dx = B.x - A.x, dz = B.z - A.z;
        const ratio = Math.max(0, Math.min(1, ((x - A.x) * dx + (z - A.z) * dz) / (dx * dx + dz * dz)));
        distance = Math.min(distance, Math.hypot(x - A.x - dx * ratio, z - A.z - dz * ratio));
      }
      return distance - radius;
    }
    const samples = new Float32Array((columns + 1) * (rows + 1));
    for (let z = 0; z <= rows; z++) for (let x = 0; x <= columns; x++) samples[z * (columns + 1) + x] = field(left + x * step, back + z * step);
    const links = new Map(), coordinates = new Map();
    const key = point => `${Math.round(point[0] * 10000)},${Math.round(point[1] * 10000)}`;
    function connect(a, b) {
      const ka = key(a), kb = key(b); coordinates.set(ka, a); coordinates.set(kb, b);
      if (!links.has(ka)) links.set(ka, []); if (!links.has(kb)) links.set(kb, []);
      links.get(ka).push(kb); links.get(kb).push(ka);
    }
    const table = { 1:[[3,0]],2:[[0,1]],3:[[3,1]],4:[[1,2]],6:[[0,2]],7:[[3,2]],8:[[2,3]],9:[[0,2]],11:[[1,2]],12:[[1,3]],13:[[0,1]],14:[[3,0]] };
    for (let row = 0; row < rows; row++) for (let col = 0; col < columns; col++) {
      const x = left + col * step, z = back + row * step;
      const points = [[x,z],[x+step,z],[x+step,z+step],[x,z+step]];
      const values = [samples[row*(columns+1)+col],samples[row*(columns+1)+col+1],samples[(row+1)*(columns+1)+col+1],samples[(row+1)*(columns+1)+col]];
      const bits = values.reduce((value, sample, index) => value | (sample < 0 ? 1 << index : 0), 0);
      if (!bits || bits === 15) continue;
      let pairs = table[bits];
      if (bits === 5) pairs = field(x+step/2,z+step/2)<0 ? [[3,2],[0,1]] : [[3,0],[1,2]];
      if (bits === 10) pairs = field(x+step/2,z+step/2)<0 ? [[3,0],[1,2]] : [[0,1],[2,3]];
      const crossings = {};
      function crossing(edge) {
        if (crossings[edge]) return crossings[edge];
        const next = (edge + 1) % 4, amount = values[edge] / (values[edge] - values[next]);
        return crossings[edge] = [points[edge][0] + (points[next][0]-points[edge][0])*amount, points[edge][1] + (points[next][1]-points[edge][1])*amount];
      }
      for (const [a, b] of pairs) connect(crossing(a), crossing(b));
    }
    const visited = new Set(), contours = [];
    for (const start of links.keys()) {
      if (visited.has(start)) continue;
      const loop = []; let current = start, previous = null;
      while (!visited.has(current)) {
        visited.add(current); const point = coordinates.get(current); loop.push(new T.Vector2(point[0], -point[1]));
        const next = links.get(current).find(item => item !== previous); previous = current; current = next;
        if (!current) break;
      }
      if (loop.length > 3) contours.push(loop);
    }
    contours.sort((a, b) => Math.abs(T.ShapeUtils.area(b)) - Math.abs(T.ShapeUtils.area(a)));
    const shape = new T.Shape(contours[0]);
    for (const contour of contours.slice(1)) shape.holes.push(new T.Path(contour));
    return shape;
  }
  const promenade = mesh(new T.ShapeGeometry(walkwayShape()), materials.cream, 0, .055, 0);
  promenade.rotation.x = -Math.PI / 2; promenade.castShadow = false;

  // Shared soft contact patches provide gentle modeled AO, without noisy post-processing.
  const aoCanvas = document.createElement('canvas'); aoCanvas.width = aoCanvas.height = 64;
  const aoCtx = aoCanvas.getContext('2d');
  const aoGradient = aoCtx.createRadialGradient(32, 32, 2, 32, 32, 30);
  aoGradient.addColorStop(0, 'rgba(38,59,64,.18)'); aoGradient.addColorStop(.4, 'rgba(38,59,64,.13)'); aoGradient.addColorStop(1, 'rgba(38,59,64,0)');
  aoCtx.fillStyle = aoGradient; aoCtx.fillRect(0, 0, 64, 64);
  const aoTexture = new T.CanvasTexture(aoCanvas);
  const aoMaterial = new T.MeshBasicMaterial({ map: aoTexture, transparent: true, depthWrite: false });
  const contacts = [];
  function contact(x, z, width, depth) { contacts.push({ x, z, width, depth }); }

  const obstacles = [];
  const exhibitPositions = {
    got: [-5.8, -.8], dexter: [5.8, -.8], sherlock: [-10, -6.8], archer: [-5.5, -10.5],
    'breaking-bad': [5.5, -10.5], 'house-of-cards': [10, -6.8], severance: [0, -13]
  };
  const safePoses = { clock: { x: 0, z: 6.5, yaw: 0 } };
  const screens = [], leaves = [], flags = [], interactive = [];
  const textures = [];
  let carousel, carouselTarget = 0;
  function namePlate(text, x, y, z, width = 3.6, fontSize = 32) {
    const canvas = document.createElement('canvas'); canvas.width = 640; canvas.height = 80;
    const c = canvas.getContext('2d');
    c.fillStyle = '#263b40'; c.font = `${fontSize}px Georgia, serif`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(text, 320, 41, 596);
    const texture = new T.CanvasTexture(canvas); texture.colorSpace = T.SRGBColorSpace; textures.push(texture);
    const plate = mesh(new T.PlaneGeometry(width, width / 8), new T.MeshBasicMaterial({ map: texture, transparent: true, toneMapped: false }), x, y, z);
    plate.castShadow = false; return plate;
  }
  function preview(info, slug, x, y, z, width = 1.35, parent = world, tilt = 0) {
    const hinge = new T.Group(); hinge.position.set(x, y, z); parent.add(hinge);
    box(width + .13, width * .64 + .13, .11, materials.ink, 0, 0, 0, hinge);
    const surfaceMaterial = new T.MeshBasicMaterial({ color: 0xf2e5cc, toneMapped: false });
    const surface = mesh(new T.PlaneGeometry(width, width * .64), surfaceMaterial, 0, 0, .062, hinge);
    surface.castShadow = false; surface.userData.preview = info; surface.userData.slug = slug;
    const edge = box(width + .17, .028, .13, materials.coral, 0, -width * .32 - .055, .018, hinge);
    edge.visible = false;
    hinge.rotation.x = tilt;
    screens.push(surface); interactive.push(surface); leaves.push({ hinge, slug, tilt, edge });
    if (info.thumb) Promise.resolve(ctx.texture(info.thumb)).then(texture => {
      if (!texture || disposed) return;
      surfaceMaterial.map = texture; surfaceMaterial.color.set(0xffffff); surfaceMaterial.needsUpdate = true; ctx.wake();
    }).catch(() => {});
    return hinge;
  }
  function roofFlag(x, y, z) {
    batch('box', 'cream', x, y + .25, z, .035, .55, .035);
    const shape = new T.Shape(); shape.moveTo(0, 0); shape.lineTo(.42, -.1); shape.lineTo(0, -.21); shape.closePath();
    const flag = mesh(new T.ShapeGeometry(shape), materials.coral, x, y + .48, z);
    flag.castShadow = false; flags.push(flag);
  }
  function routeMark(x, y, z) {
    const ring = mesh(new T.RingGeometry(.105, .14, 12), materials.coral, x, y, z); ring.castShadow = false;
    const shape = new T.Shape(); shape.moveTo(-.045, -.07); shape.lineTo(.045, -.07); shape.lineTo(0, .08); shape.closePath();
    mesh(new T.ShapeGeometry(shape), materials.coral, x, y, z + .008).castShadow = false;
  }

  for (const show of ctx.showData) {
    const [x, z] = exhibitPositions[show.slug];
    safePoses[show.slug] = { x, z: z + 3.15, yaw: 0 };
    obstacles.push({ minX: x - 2.1, maxX: x + 2.1, minZ: z - 1.1, maxZ: z + .9, height: 3.6 });
  }
  for (const x of [-2.51, 2.51]) obstacles.push({ minX: x - .24, maxX: x + .24, minZ: -.32, maxZ: .32, height: 5.5 });
  obstacles.push({ minX: .46, maxX: 2.04, minZ: 1.3, maxZ: 2.9, height: 1.5 });
  const architecture = createFairArchitecture(ctx, world, {
    materials, exhibitPositions, showData: ctx.showData.map(show => ({ ...show, cards: show.cards.map(info => ({ ...info, node: resolveCard(info) })) })),
    preview, namePlate, roofFlag, contact
  });
  const { cap, buttonHit } = architecture.reset;
  cap.traverse(object => { if(object.isMesh){object.userData.reset=true; interactive.push(object);} });
  for(const surface of [architecture.reset.labelSurface,architecture.reset.numberSurface]){surface.userData.reset=true;interactive.push(surface);}
  const resetShell = mesh(new T.CylinderGeometry(.72,.78,1.25,24),new T.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false}),0,.75,0,architecture.reset.group);
  resetShell.castShadow = false; resetShell.receiveShadow = false;
  resetShell.userData.reset=true;interactive.push(resetShell);
  const resetFocus=mesh(new T.TorusGeometry(.67,.016,8,40),materials.cream,0,.18,0,cap);resetFocus.rotation.x=-Math.PI/2;resetFocus.visible=false;
  carousel = architecture.carousel;
  if (architecture.carouselHit) interactive.push(architecture.carouselHit);
  // Small cabinet latches retain access to every collapsed version and the Dexter timeline.
  for(const show of ctx.showData){
    const more=ctx.shelves.find(section=>section.id===show.slug)?.querySelector('a.more');if(!more)continue;
    const [x,z]=exhibitPositions[show.slug];
    const latch=mesh(new T.TorusGeometry(.13,.035,8,24),materials.brass||materials.cream,x+1.75,1.02,z+1.14);
    const plate=namePlate('+',x+1.75,1.36,z+1.16,.32,64);plate.userData.world=more.getAttribute('href');interactive.push(plate);
    const hit=mesh(new T.PlaneGeometry(.55,.68),new T.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false}),x+1.75,1.17,z+1.19);
    hit.castShadow=false;hit.receiveShadow=false;
    hit.userData.world=more.getAttribute('href');interactive.push(hit);
    ctx.on(more,'focus',()=>{if(ready&&!disposed&&!focusRestoring&&!frozen&&!sceneLost)travel(show.slug,false);});
  }
  const machinery = await createFairMachinery(ctx, architecture, world, materials);
  const crownShape = new T.Shape();
  crownShape.moveTo(-.1, -.05); crownShape.lineTo(-.13, .09); crownShape.lineTo(-.05, .035);
  crownShape.lineTo(0, .13); crownShape.lineTo(.05, .035); crownShape.lineTo(.13, .09); crownShape.lineTo(.1, -.05); crownShape.closePath();
  const crown = mesh(new T.ShapeGeometry(crownShape), materials.coral, -2.3, 1.57, .35); crown.castShadow = false;
  crown.userData.secret = true; interactive.push(crown);
  const crownFocus = mesh(new T.TorusGeometry(.20,.016,8,32),new T.MeshBasicMaterial({color:palette.cream,toneMapped:false}),-2.3,1.59,.371);
  crownFocus.castShadow=false;crownFocus.receiveShadow=false;crownFocus.visible=false;
  const secretPlate = namePlate('Long may I count', 0, 4.43, .24, 2.55); secretPlate.visible = false;

  const plan = new T.Group(); plan.position.set(-3.65, 0, 5.0); world.add(plan);
  mesh(new T.CylinderGeometry(.87, 1.02, .30, 32), materials.jade, 0, .20, 0, plan);
  mesh(new T.CylinderGeometry(.70, .87, .65, 32), materials.cream, 0, .66, 0, plan);
  const planFace = mesh(new T.CylinderGeometry(1.04, 1.02, .12, 48), materials.cream, 0, 1.06, 0, plan);
  planFace.userData.plan = true; interactive.push(planFace);
  const planNavFocus = mesh(new T.TorusGeometry(1.025,.02,8,48),materials.coral,0,1.132,0,plan);
  planNavFocus.rotation.x=-Math.PI/2;planNavFocus.castShadow=false;planNavFocus.receiveShadow=false;planNavFocus.visible=false;
  const planObjects = new T.Group(); planObjects.position.y = 1.13; plan.add(planObjects);
  const planTokens = new Map();
  const planScale = .066;
  for (const [a, b] of edges) {
    const A = nodes[a], B = nodes[b], length = Math.hypot(B.x - A.x, B.z - A.z) * planScale;
    const line = box(.025, .008, length, materials.jade, (A.x + B.x) * planScale / 2, .005, (A.z + B.z + 8) * planScale / 2, planObjects);
    line.rotation.y = Math.atan2(B.x - A.x, B.z - A.z);
  }
  for (const show of ctx.showData) {
    const [x, z] = exhibitPositions[show.slug];
    const token = mesh(show.slug === 'dexter' ? new T.BoxGeometry(.22,.17,.16) : show.slug === 'severance' ? new T.ConeGeometry(.16,.21,4) : new T.CylinderGeometry(show.slug==='got'||show.slug==='archer'?.015:.10,.13,.15,8),
      ['got', 'sherlock', 'house-of-cards'].includes(show.slug) ? materials.jade : materials.coral,
      x * planScale, .085, (z + 4) * planScale, planObjects);
    token.userData.travel = show.slug; interactive.push(token);
    planTokens.set(show.slug,token);
    const hit = mesh(new T.CylinderGeometry(.17, .17, .18, 16), new T.MeshBasicMaterial({ transparent:true, opacity:0, depthWrite:false }),
      x * planScale, .09, (z + 4) * planScale, planObjects);
    hit.userData.travel = show.slug; interactive.push(hit);
    hit.castShadow=false;hit.receiveShadow=false;
  }
  const planFocus=mesh(new T.TorusGeometry(.17,.018,8,24),materials.cream,0,.20,0,planObjects);planFocus.rotation.x=-Math.PI/2;planFocus.visible=false;
  const clockToken = mesh(new T.TorusGeometry(.105, .022, 8, 20, Math.PI), materials.jade, 0, .07, .25, planObjects);
  clockToken.userData.travel = 'clock'; interactive.push(clockToken);
  planTokens.set('clock',clockToken);
  const planLetter = namePlate('↗', -3.65, .73, 5.88, .45);
  contact(-3.65, 5, 2.7, 2.7);
  const planBounds = {minX:-4.7,maxX:-2.6,minZ:3.95,maxZ:6.05,height:1.25}; obstacles.push(planBounds);
  const gateway = new T.Group(); gateway.position.set(4.15, 0, 5.35); world.add(gateway);
  mesh(new T.CylinderGeometry(.74, .86, .18, 32), materials.jade, 0, .15, 0, gateway);
  mesh(new T.CylinderGeometry(.66, .72, .64, 32), materials.cream, 0, .56, 0, gateway);
  const worldGate = mesh(new T.TorusGeometry(.47, .08, 12, 40), materials.jade, 0, 1.21, 0, gateway);
  const gateCore = mesh(new T.SphereGeometry(.36, 20, 12), materials.roundCream, 0, 1.21, .02, gateway);
  gateCore.userData.worldGate = true; worldGate.userData.worldGate = true; interactive.push(gateCore, worldGate);
  const gatewayLetter = namePlate('Worlds', 4.15, .60, 6.06, 1.0);
  const destinations = [document.querySelector('.home-link'),...document.querySelectorAll('.theme-menu-list a')].filter(link => link.dataset.themeLink !== 'the-almost-fair');
  const constellation = new T.Group(); constellation.position.set(4.15, 1.25, 5.43); constellation.visible = false; world.add(constellation);
  const destinationHits = [];
  destinations.forEach((link, index) => {
    const angle = Math.PI * 2 * index / destinations.length;
    const id=link.dataset.themeLink;
    const tokenGeometry=id==='control'?new T.BoxGeometry(.34,.31,.28):id==='tomorrows-roadworks'?new T.ConeGeometry(.21,.43,8):id==='after-the-flame'?new T.CylinderGeometry(.12,.15,.40,12):id==='low-tide-later'?new T.TorusGeometry(.17,.055,8,20):id==='still-drawing-tomorrow'?new T.OctahedronGeometry(.23,0):id==='held-in-suspense'?new T.TorusKnotGeometry(.14,.04,24,6):new T.SphereGeometry(.20,16,10);
    const token = mesh(tokenGeometry, index % 2 ? materials.coral : materials.jade,
      Math.sin(angle) * 1.24, Math.cos(angle) * 1.24, .02, constellation);
    token.userData.world = link.getAttribute('href'); destinationHits.push(token);
    const thread = mesh(new T.CylinderGeometry(.014,.014,.97,6),materials.cream,
      Math.sin(angle)*.71,Math.cos(angle)*.71,0,constellation); thread.rotation.z = -angle;
    const plate = namePlate(link.classList.contains('home-link')?'Home':link.textContent, 0, 0, 0, 1.05,64);plate.userData.world=link.getAttribute('href');destinationHits.push(plate); plate.position.set(token.position.x, token.position.y - .29, .07); constellation.add(plate);
  });
  contact(4.15,5.35,2.1,2.1);
  const gatewayBounds = {minX:3.35,maxX:4.95,minZ:4.55,maxZ:6.15,height:1.8}; obstacles.push(gatewayBounds);

  // Build navigation only after every collider exists, using the same clearance as walking.
  let walkableEdges = edges.filter(([a, b]) => clearSegment(nodes[a], nodes[b]));
  for (const [a, b] of walkableEdges) {
    const length = Math.hypot(nodes[b].x - nodes[a].x, nodes[b].z - nodes[a].z);
    nodes[a].edges.push({ to: b, length }); nodes[b].edges.push({ to: a, length });
  }

  for (const { geometry, material, matrices, castShadow } of batches.values()) {
    const instances = new T.InstancedMesh(geometry, material, matrices.length);
    matrices.forEach((m, i) => instances.setMatrixAt(i, m)); instances.castShadow = castShadow; instances.receiveShadow = true; world.add(instances);
  }
  const aoInstances = new T.InstancedMesh(new T.PlaneGeometry(1, 1), aoMaterial, contacts.length);
  contacts.forEach((item, i) => {
    positionVector.set(item.x, .065, item.z); scaleVector.set(item.width, item.depth, 1); quaternion.setFromEuler(euler.set(-Math.PI / 2, 0, 0));
    matrix.compose(positionVector, quaternion, scaleVector); aoInstances.setMatrixAt(i, matrix);
  }); world.add(aoInstances);

  const player = new T.Group(); player.position.set(0, .015, 6.5); world.add(player);
  const body = mesh(new T.CylinderGeometry(.19, .30, .49, 24), materials.coral, 0, .49, 0, player);
  mesh(new T.SphereGeometry(.235, 24, 16), roundCream, 0, .87, 0, player);
  const feet = [-.22, .22].map(x => mesh(new T.SphereGeometry(.10, 12, 8), materials.ink, x, .13, -.14, player));
  feet.forEach(foot => foot.scale.set(1,.72,1.45));
  const playerAO = mesh(new T.PlaneGeometry(.8, .8), aoMaterial, 0, .044, 0, player);
  playerAO.rotation.x = -Math.PI / 2; playerAO.castShadow = false;

  let focusRestoring = false, inspectedSurface = null, routePlanFocus=false;
  let frozen = false, sceneLost = false, snapshot = null, held = new Set(), restoreCamera = false, previewOrigin = null;
  let yaw = 0, pitch = Math.PI / 6, cameraDistance = 6.5, followX = player.position.x, followZ = player.position.z;
  let vx = 0, vz = 0, walkPhase = 0, heading = Math.PI, selected = 'clock';
  let pointer = null, joystickPointer = null, joyX = 0, joyZ = 0, route = [], travelAt = -Infinity, travelPose = null;
  let cameraMotion = null, inspectionMode = null, preInspection = null;
  let pressDepth = 0, localBurst = -Infinity, remoteBurst = -Infinity, hoveredSlug = '';
  const raycaster = new T.Raycaster(), rayPoint = new T.Vector2(), groundPlane = new T.Plane(new T.Vector3(0, 1, 0), 0), groundHit = new T.Vector3();
  const cameraTarget = new T.Vector3(), cameraDesired = new T.Vector3(), collisionOrigin = new T.Vector3();
  const hint = document.createElement('span'); hint.className = 'fair-hint'; hint.textContent = 'Walk · drag'; ctx.stage.append(hint);
  ctx.canvas.tabIndex = 0; ctx.canvas.setAttribute('aria-label', 'Countdown fairground. Arrow keys or WASD move; drag turns the view.');
  ctx.canvas.setAttribute('aria-keyshortcuts', 'ArrowUp ArrowDown ArrowLeft ArrowRight W A S D');
  ctx.dom.route.classList.add('fair-route'); ctx.dom.archiveToggle.classList.add('fair-navbutton'); ctx.dom.joystick.classList.add('fair-joystick');
  ctx.dom.tally.querySelector('small').textContent = 'postponements';
  ctx.dom.archiveToggle.hidden = false; ctx.dom.archiveToggle.setAttribute('aria-label', 'Archive');
  ctx.dom.archiveToggle.innerHTML = '<svg viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="16" r="11"/><path d="m16 7 5 16-5-3-5 3Z"/></svg>';
  ctx.dom.route.id ||= 'fair-route'; ctx.dom.archiveToggle.setAttribute('aria-controls', ctx.dom.route.id); ctx.dom.archiveToggle.setAttribute('aria-expanded', 'false');
  ctx.dom.route.hidden = true;
  const routeHeading = document.createElement('div'); routeHeading.className = 'fair-route-heading';
  const clockTravel = document.createElement('button'); clockTravel.type = 'button'; clockTravel.textContent = 'Clock';
  ctx.on(clockTravel, 'click', () => travel('clock')); routeHeading.append(clockTravel); ctx.dom.route.append(routeHeading);
  for (const show of ctx.showData) {
    const row = document.createElement('div'); row.className = 'fair-route-row';row.dataset.fairSlug=show.slug;
    const open = document.createElement('a'); open.textContent = show.name;
    const first = show.cards[0]; open.href = first.href; open.target = '_blank'; open.rel = 'noopener';
    ctx.on(open, 'click', event => routePreview(event, first)); row.append(open);
    const go = document.createElement('button'); go.type = 'button'; go.className = 'fair-travel-button'; go.textContent = '↗'; go.setAttribute('aria-label', `Travel to ${show.name}`);
    ctx.on(go, 'click', () => travel(show.slug)); row.append(go);
    const versions = document.createElement('details'); const summary = document.createElement('summary'); summary.textContent = '+'; summary.setAttribute('aria-label', `${show.name} versions`); versions.append(summary);
    const links = document.createElement('div'); links.className = 'fair-version-links';
    for (const info of show.cards) {
      const link = document.createElement('a'); link.href = info.href; link.target = '_blank'; link.rel = 'noopener'; link.textContent = info.label;
      ctx.on(link, 'click', event => routePreview(event, info)); links.append(link);
    }
    const shelf = ctx.shelves.find(section => section.id === show.slug);
    const more = shelf?.querySelector('a.more');
    if (more) { const link = more.cloneNode(true); link.textContent = 'All versions'; links.append(link); }
    versions.append(links); row.append(versions); ctx.dom.route.append(row);
  }
  const archive = document.createElement('a'); archive.className = 'fair-static-link'; archive.textContent = 'Archive ↓'; archive.href = '#archive-shelves';
  archive.textContent='Plan';
  ctx.on(archive, 'click', event => {
    if(!sceneLost && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey){event.preventDefault();closeRoute();ctx.canvas.focus({preventScroll:true});inspectPlan();}
    else{closeRoute();clearInput();}
  }); ctx.dom.route.append(archive);
  const stick = document.createElement('span'); stick.className = 'fair-stick'; ctx.dom.joystick.append(stick);
  ctx.dom.joystick.setAttribute('aria-label', 'Walk'); ctx.dom.joystick.setAttribute('role', 'group');
  // Hero samples rejoin their shelves: the conventional archive remains complete below the world.
  for (const card of ctx.mounts) {
    const slug = card.getAttribute('href').split('/')[2];
    const shelf = ctx.shelves.find(section => section.id === slug); const grid = shelf?.querySelector('.grid');
    if (grid) {
      grid.querySelector('.art-return')?.remove(); grid.prepend(card); card.classList.remove('art-mount');
      if (card.dataset.previewLabel) card.querySelector('.label').textContent = card.dataset.previewLabel;
    }
  }
  ready=true;ctx.stage.dataset.fairView='walk';document.documentElement.classList.add('fair-ready', 'fair-world-active');
  for (const screen of screens) {
    const card = resolveCard(screen.userData.preview);
    if (!card) continue;
    ctx.on(card, 'focus', () => { if (!focusRestoring && !frozen && !sceneLost) { travel(screen.userData.slug, false); hoveredSlug = screen.userData.slug; } });
    ctx.on(card, 'click', event => {
      if (sceneLost || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
      event.preventDefault(); event.stopImmediatePropagation(); previewOrigin = {element:card,route:false}; inspectScreen(screen);
    }, true);
  }
  for (const link of document.querySelectorAll('.shownav a')) {
    const slug = link.hash.slice(1);
    ctx.on(link, 'focus', () => { if (!focusRestoring) travel(slug, false); });
    ctx.on(link, 'click', event => { if (!sceneLost) {event.preventDefault(); travel(slug); } });
  }
  ctx.on(ctx.dom.reset, 'focus', () => { if (!focusRestoring && !sceneLost && !frozen) travel('clock', false); });
  ctx.on(ctx.dom.secretButton, 'focus', () => { if (!focusRestoring && !sceneLost && !frozen) travel('clock', false);ctx.wake(); });
  ctx.on(ctx.dom.secretButton,'blur',()=>ctx.wake());
  ctx.on(ctx.dom.archiveToggle,'focus',()=>{if(!focusRestoring&&!sceneLost&&!frozen)inspectPlan();ctx.wake();});
  ctx.on(ctx.dom.archiveToggle,'blur',()=>ctx.wake());
  ctx.on(ctx.dom.route,'focusin',()=>{if(!focusRestoring&&!sceneLost&&!frozen&&inspectionMode!=='plan')inspectPlan();ctx.wake();});
  ctx.on(ctx.dom.route,'focusout',()=>{queueMicrotask(()=>{if(!disposed&&!frozen&&!ctx.dom.route.contains(document.activeElement))closeRoute();});ctx.wake();});
  ctx.on(document.querySelector('.home-link'),'focus',()=>{if(!focusRestoring&&!sceneLost&&!frozen)inspectWorlds();});
  const worldsSummary = document.querySelector('.theme-menu summary');
  if (worldsSummary) ctx.on(worldsSummary,'focus',()=>{if(!focusRestoring&&!sceneLost&&!frozen)inspectWorlds();});
  for (const link of document.querySelectorAll('.theme-menu-list a')) ctx.on(link, 'focus', () => { if (!focusRestoring && !sceneLost && !frozen) inspectWorlds(); });

  function resolveCard(info) {
    if (info.node?.nodeType) return info.node;
    return ctx.cards.find(card => card.getAttribute('href') === info.href || card.href === info.href);
  }
  function routePreview(event, info) {
    if (sceneLost) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    const card = resolveCard(info); if (!card) return;
    event.preventDefault(); const originRect = event.currentTarget.getBoundingClientRect();
    previewOrigin = { element: event.currentTarget, route: true }; closeRoute(); clearInput();
    const screen = screens.find(item => resolveCard(item.userData.preview) === card);
    if (screen && !sceneLost) inspectScreen(screen); else ctx.openPreview(card, { originRect });
  }
  function closeRoute() { ctx.dom.route.hidden = true; ctx.dom.archiveToggle.setAttribute('aria-expanded', 'false'); }
  function clearInput() {
    if (pointer && ctx.canvas.hasPointerCapture(pointer.id)) ctx.canvas.releasePointerCapture(pointer.id);
    if (joystickPointer !== null && ctx.dom.joystick.hasPointerCapture(joystickPointer)) ctx.dom.joystick.releasePointerCapture(joystickPointer);
    held.clear(); joyX = joyZ = vx = vz = 0; joystickPointer = null; route = []; pointer = null;
    stick.style.transform = 'translate(0,0)';
  }
  function travel(slug, focus = true) {
    if (frozen || sceneLost) return;
    exitInspection(false); clearInput(); if (focus) ctx.canvas.focus({ preventScroll: true }); closeRoute(); selected = slug;
    if (ctx.reduced) { setPose(safePoses[slug]); return; }
    travelPose = safePoses[slug]; travelAt = performance.now() / 1000;
    ctx.stage.classList.remove('fair-travel'); void ctx.stage.offsetWidth; ctx.stage.classList.add('fair-travel'); ctx.wake();
  }
  function setPose(pose) {
    if (!pose) return;
    player.position.x = followX = pose.x; player.position.z = followZ = pose.z; yaw = pose.yaw; heading = Math.PI; player.rotation.y = heading;
    restoreCamera = false; cameraDistance = ctx.mobile ? 7.5 : 6.5; updateCamera(1, true); hint.hidden = true; ctx.wake();
  }
  function closestPath(x, z, clearApproach = false) {
    let best = null;
    for (const [a, b] of walkableEdges) {
      const A = nodes[a], B = nodes[b], dx = B.x - A.x, dz = B.z - A.z;
      const ratio = Math.max(0, Math.min(1, ((x - A.x) * dx + (z - A.z) * dz) / (dx * dx + dz * dz)));
      const px = A.x + dx * ratio, pz = A.z + dz * ratio, distance = Math.hypot(x - px, z - pz);
      if (clearApproach && !clearSegment({ x, z }, { x: px, z: pz })) continue;
      if (!best || distance < best.distance) best = { x: px, z: pz, a, b, distance };
    }
    return best;
  }
  function walkTo(x, z) {
    const target = closestPath(x, z); if (!target || target.distance > 1.3) return;
    const start = closestPath(player.position.x, player.position.z, true); if (!start) return;
    if (start.a === target.a && start.b === target.b) { route = [start, target]; ctx.wake(); return; }
    const distance = nodes.map(() => Infinity), previous = nodes.map(() => -1), unvisited = new Set(nodes.map((_, i) => i));
    for (const index of [start.a, start.b]) distance[index] = Math.hypot(start.x - nodes[index].x, start.z - nodes[index].z);
    while (unvisited.size) {
      let nearest = -1; for (const index of unvisited) if (nearest < 0 || distance[index] < distance[nearest]) nearest = index;
      if (!Number.isFinite(distance[nearest])) break;
      unvisited.delete(nearest);
      for (const edge of nodes[nearest].edges) if (distance[nearest] + edge.length < distance[edge.to]) { distance[edge.to] = distance[nearest] + edge.length; previous[edge.to] = nearest; }
    }
    const finish = distance[target.a] + Math.hypot(target.x - nodes[target.a].x, target.z - nodes[target.a].z) < distance[target.b] + Math.hypot(target.x - nodes[target.b].x, target.z - nodes[target.b].z) ? target.a : target.b;
    if (!Number.isFinite(distance[finish])) return;
    const chain = []; let current = finish;
    while (current >= 0) { chain.unshift(nodes[current]); current = previous[current]; }
    route = [start, ...chain, target]; ctx.wake();
  }
  function capturePose() {
    return { x: player.position.x, z: player.position.z, y: player.position.y, heading, yaw, pitch, cameraDistance, followX, followZ, selected,
      camera: camera.position.toArray(), quaternion: camera.quaternion.toArray() };
  }
  function moveCamera(position, target, done, duration = .65) {
    const desired = camera.clone(); desired.position.copy(position); desired.lookAt(target);
    ctx.stage.dataset.fairView='approaching';
    cameraMotion = {start:performance.now()/1000, from:camera.position.clone(), quaternion:camera.quaternion.clone(),
      to:position.clone(), rotation:desired.quaternion.clone(), duration:ctx.reduced?0:duration, done};
    clearInput(); restoreCamera = true; ctx.wake();
  }
  function exitInspection(restore = true) {
    if (!inspectionMode && !cameraMotion) return;
    cameraMotion = null; inspectionMode = null; inspectedSurface = null; constellation.visible = false;
    interactive.splice(0,interactive.length,...interactive.filter(item=>!destinationHits.includes(item)));
    if (restore && preInspection) {camera.position.fromArray(preInspection.camera); camera.quaternion.fromArray(preInspection.quaternion); restoreCamera = true;}
    preInspection = null;ctx.stage.dataset.fairView='walk';ctx.wake();
  }
  function inspectWorlds() {
    if (inspectionMode === 'worlds') return;
    exitInspection(); preInspection = capturePose(); inspectionMode = 'worlds'; constellation.visible = true;
    interactive.push(...destinationHits); moveCamera(new T.Vector3(gateway.position.x,1.25*gateway.scale.y,gateway.position.z+(ctx.mobile?6.6:4.35)),new T.Vector3(gateway.position.x,1.25*gateway.scale.y,gateway.position.z+.08));
  }
  function inspectPlan() {
    if(inspectionMode==='plan')return;
    exitInspection(); preInspection = capturePose(); inspectionMode = 'plan';
    moveCamera(new T.Vector3(plan.position.x,ctx.mobile?4.9:3.65,plan.position.z+.8),new T.Vector3(plan.position.x,1.12*plan.scale.y,plan.position.z));
  }
  function inspectScreen(surface) {
    if (frozen || sceneLost) return;
    exitInspection(); preInspection = capturePose(); inspectionMode = 'screen'; inspectedSurface = surface;
    world.updateMatrixWorld(true);
    const center = surface.getWorldPosition(new T.Vector3()), normal = new T.Vector3(0,0,1).applyQuaternion(surface.getWorldQuaternion(new T.Quaternion()));
    const {width,height} = surface.geometry.parameters;
    const fit = Math.max(height/.72,width/(camera.aspect*.88))/(2*Math.tan(T.MathUtils.degToRad(camera.fov/2)));
    moveCamera(center.clone().addScaledVector(normal,fit),center,()=>{
      camera.updateMatrixWorld(true); const rect = screenRect(surface), style = document.documentElement.style;
      for (const [key,value] of Object.entries(rect)) style.setProperty(`--fair-aperture-${key}`,`${value}px`);
      document.documentElement.classList.add('fair-projecting');
      const card = resolveCard(surface.userData.preview); if (card) ctx.openPreview(card,{originRect:rect});
    });
  }
  function pointerRay(event) {
    const rect = ctx.canvas.getBoundingClientRect();
    rayPoint.set((event.clientX - rect.left) / rect.width * 2 - 1, -(event.clientY - rect.top) / rect.height * 2 + 1); raycaster.setFromCamera(rayPoint, camera);
  }
  function pickInteractive() {
    const candidates = raycaster.intersectObjects(interactive,false);
    const firstSolid = raycaster.intersectObject(world,true).find(hit => {
      let object=hit.object;while(object){if(!object.visible)return false;object=object.parent;}
      const material=hit.object.material;return !material?.transparent || material.opacity > .05;
    });
    return candidates.find(hit => {
      let object=hit.object;while(object){if(!object.visible)return false;object=object.parent;}
      return !firstSolid || firstSolid.object === hit.object || firstSolid.distance >= hit.distance - .07;
    });
  }
  function screenRect(surface) {
    const { width, height } = surface.geometry.parameters, bounds = ctx.stage.getBoundingClientRect();
    const corners = [[-1,-1],[-1,1],[1,-1],[1,1]].map(([x, y]) => ctx.project(surface.localToWorld(new T.Vector3(x * width / 2, y * height / 2, 0))));
    const left = Math.min(...corners.map(point => point.x)), right = Math.max(...corners.map(point => point.x));
    const top = Math.min(...corners.map(point => point.y)), bottom = Math.max(...corners.map(point => point.y));
    return { left: bounds.left + left, top: bounds.top + top, width: right - left, height: bottom - top };
  }
  ctx.on(ctx.dom.archiveToggle, 'click', () => {
    clearInput(); ctx.dom.route.hidden = !ctx.dom.route.hidden; ctx.dom.archiveToggle.setAttribute('aria-expanded', String(!ctx.dom.route.hidden));
    if (!ctx.dom.route.hidden) clockTravel.focus({ preventScroll: true });
  });
  ctx.on(ctx.dom.route, 'keydown', event => { if (event.key === 'Escape' && !sceneLost) { event.stopPropagation(); closeRoute(); ctx.dom.archiveToggle.focus({ preventScroll: true }); } });
  ctx.on(ctx.canvas, 'webglcontextlost', () => {
    const active = document.activeElement;
    const moveFocus = active === ctx.canvas || active === ctx.dom.archiveToggle || active?.closest?.('.fair-travel-button,.fair-route-heading,.fair-route-row details');
    document.documentElement.classList.remove('fair-world-active', 'fair-projecting');ctx.dom.secret.style.cssText='';
    sceneLost = true; frozen = true; travelPose = null; clearInput();
    ctx.stage.classList.remove('fair-travel'); ctx.dom.route.hidden = false;
    ctx.dom.archiveToggle.setAttribute('aria-expanded', 'true');
    archive.textContent='Archive ↓';
    // The existing drawer becomes ordinary direct links; its genuine anchors need no clones.
    queueMicrotask(() => { if (moveFocus && !disposed) ctx.dom.route.querySelector('.fair-route-row>a')?.focus({ preventScroll: true }); });
  });
  ctx.on(ctx.canvas, 'keydown', event => {
    if (frozen || document.activeElement !== ctx.canvas) return;
    if (event.key === 'Escape') { exitInspection(); event.preventDefault(); return; }
    const key = event.key.toLowerCase();
    if (['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright'].includes(key)) { event.preventDefault(); exitInspection(); restoreCamera = false; held.add(key); route = []; ctx.wake(); }
  });
  ctx.on(document,'keydown',event=>{if(event.key==='Escape'&&!event.defaultPrevented&&inspectionMode&&!frozen){event.preventDefault();exitInspection();ctx.canvas.focus({preventScroll:true});}if(event.key==='Tab')document.documentElement.classList.add('fair-keyboard');});
  ctx.on(window, 'keyup', event => held.delete(event.key.toLowerCase()));
  ctx.on(ctx.canvas, 'blur', clearInput); ctx.on(window, 'blur', clearInput);
  ctx.on(document, 'visibilitychange', () => { if (document.hidden) clearInput(); });
  ctx.on(ctx.canvas, 'pointerdown', event => {
    document.documentElement.classList.remove('fair-keyboard');
    if (frozen || event.button > 0) return;
    if (pointer && pointer.id !== event.pointerId) return;
    held.clear(); route = []; restoreCamera = false; closeRoute(); ctx.canvas.focus({ preventScroll: true });
    ctx.canvas.style.cursor = 'grabbing';
    pointer = { id: event.pointerId, x: event.clientX, y: event.clientY, lastX: event.clientX, lastY: event.clientY, orbit: false, touch: event.pointerType === 'touch' };
    ctx.canvas.setPointerCapture(event.pointerId); ctx.wake();
  });
  ctx.on(ctx.canvas, 'pointermove', event => {
    if (frozen) return;
    if (!pointer) {
      pointerRay(event); const hit = pickInteractive();
      hoveredSlug = hit?.object.userData.slug || ''; planFocus.visible=!!hit?.object.userData.travel;if(planFocus.visible)planFocus.position.set(hit.object.position.x,.20,hit.object.position.z);ctx.canvas.style.cursor = hit ? 'pointer' : 'grab'; ctx.wake(); return;
    }
    if (pointer.id !== event.pointerId) return;
    const threshold = pointer.touch ? 10 : 6;
    if (!pointer.orbit && Math.hypot(event.clientX - pointer.x, event.clientY - pointer.y) > threshold) { pointer.orbit = true; route = []; if (inspectionMode !== 'screen') {exitInspection();restoreCamera=false;} }
    if (pointer.orbit && !inspectionMode) {
      yaw -= (event.clientX - pointer.lastX) * .006; pitch = Math.max(Math.PI / 9, Math.min(Math.PI / 4, pitch + (event.clientY - pointer.lastY) * .003)); hint.hidden = true;
    }
    pointer.lastX = event.clientX; pointer.lastY = event.clientY; ctx.wake();
  });
  ctx.on(ctx.canvas, 'pointerup', event => {
    if (!pointer || pointer.id !== event.pointerId) return;
    const wasOrbit = pointer.orbit; pointer = null;
    ctx.canvas.style.cursor = 'grab';
    if (ctx.canvas.hasPointerCapture(event.pointerId)) ctx.canvas.releasePointerCapture(event.pointerId);
    if (frozen || wasOrbit) return;
    pointerRay(event);
    const hit = pickInteractive();
    if (hit?.object.userData.preview) {
      const card = resolveCard(hit.object.userData.preview); if (!card) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) { window.open(card.href, '_blank', 'noopener'); return; }
      previewOrigin = { element: ctx.canvas, route: false }; clearInput(); inspectScreen(hit.object); return;
    }
    if (hit?.object.userData.reset) { clearInput(); ctx.requestReset(); return; }
    if (hit?.object.userData.secret) { ctx.revealSecret(); ctx.wake(); return; }
    if (hit?.object.userData.plan) { inspectPlan(); return; }
    if (hit?.object.userData.worldGate) { inspectWorlds(); return; }
    if (hit?.object.userData.travel) { travel(hit.object.userData.travel); return; }
    if (hit?.object.userData.world) {if(event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)window.open(hit.object.userData.world,'_blank','noopener');else window.location.assign(hit.object.userData.world);return;}
    if (hit?.object.userData.carousel) { carouselTarget += Math.PI / 3; ctx.wake(); return; }
    if (inspectionMode) { exitInspection(); return; }
    if (raycaster.ray.intersectPlane(groundPlane, groundHit)) walkTo(groundHit.x, groundHit.z);
  });
  ctx.on(ctx.canvas, 'pointercancel', clearInput);
  ctx.on(ctx.canvas, 'pointerleave', () => { hoveredSlug = '';planFocus.visible=false;ctx.canvas.style.cursor = 'grab'; ctx.wake(); });
  ctx.on(ctx.dom.secretButton, 'click', ()=>{clearInput();ctx.wake();});
  ctx.on(ctx.canvas, 'auxclick', event => {
    if (frozen || event.button !== 1) return;
    pointerRay(event); const hit = pickInteractive();
    if(hit?.object.userData.world){event.preventDefault();window.open(hit.object.userData.world,'_blank','noopener');return;}
    if (hit?.object.userData.preview) { const card = resolveCard(hit.object.userData.preview); if (card) { event.preventDefault(); window.open(card.href, '_blank', 'noopener'); } }
  });
  ctx.on(ctx.dom.joystick, 'pointerdown', event => {
    if (frozen) return;
    event.preventDefault(); event.stopPropagation(); exitInspection(); held.clear(); route = []; restoreCamera = false; closeRoute(); ctx.canvas.focus({ preventScroll: true });
    joystickPointer = event.pointerId; ctx.dom.joystick.setPointerCapture(event.pointerId); moveStick(event); ctx.wake();
  });
  function moveStick(event) {
    const r = ctx.dom.joystick.getBoundingClientRect(), x = event.clientX - r.left - r.width / 2, z = event.clientY - r.top - r.height / 2;
    const length = Math.hypot(x, z), radius = r.width * .3, dead = radius * .16, amount = Math.max(0, Math.min(1, (length - dead) / (radius - dead)));
    joyX = length ? x / length * amount : 0; joyZ = length ? -z / length * amount : 0;
    stick.style.transform = `translate(${joyX * radius}px,${-joyZ * radius}px)`;
  }
  ctx.on(ctx.dom.joystick, 'pointermove', event => { if (event.pointerId === joystickPointer && !frozen) { event.preventDefault(); moveStick(event); hint.hidden = true; ctx.wake(); } });
  const releaseStick = event => { if (event.pointerId === joystickPointer) { joystickPointer = null; joyX = joyZ = 0; stick.style.transform = 'translate(0,0)'; } };
  ctx.on(ctx.dom.joystick, 'pointerup', releaseStick); ctx.on(ctx.dom.joystick, 'pointercancel', releaseStick);

  function canStand(x, z) {
    if (x < -17 || x > 17 || z < -15 || z > 10.5) return false;
    return !obstacles.some(box => x > box.minX - .28 && x < box.maxX + .28 && z > box.minZ - .28 && z < box.maxZ + .28);
  }
  function clearSegment(from, to) {
    if (!canStand(from.x, from.z) || !canStand(to.x, to.z)) return false;
    for (const bounds of obstacles) {
      let near = 0, far = 1;
      for (const [axis, min, max] of [['x', bounds.minX - .28, bounds.maxX + .28], ['z', bounds.minZ - .28, bounds.maxZ + .28]]) {
        const start = from[axis], delta = to[axis] - start;
        if (Math.abs(delta) < .00001) { if (start <= min || start >= max) { near = Infinity; break; } continue; }
        let a = (min - start) / delta, b = (max - start) / delta; if (a > b) [a, b] = [b, a];
        near = Math.max(near, a); far = Math.min(far, b); if (near >= far) break;
      }
      if (near < far && far > 0 && near < 1) return false;
    }
    return true;
  }
  function segmentBoxDistance(from, to, bounds) {
    let near = 0, far = 1;
    for (const [axis, min, max] of [['x', bounds.minX - .18, bounds.maxX + .18], ['y', 0, bounds.height + .15], ['z', bounds.minZ - .18, bounds.maxZ + .18]]) {
      const start = from[axis], delta = to[axis] - start;
      if (Math.abs(delta) < .00001) { if (start < min || start > max) return Infinity; continue; }
      let a = (min - start) / delta, b = (max - start) / delta; if (a > b) [a, b] = [b, a];
      near = Math.max(near, a); far = Math.min(far, b); if (near > far) return Infinity;
    }
    return near;
  }
  function updateCamera(delta, immediate = false) {
    const ease = immediate || ctx.reduced ? 1 : 1 - Math.exp(-delta / .12);
    followX += (player.position.x - followX) * ease; followZ += (player.position.z - followZ) * ease;
    const requestedDistance = ctx.mobile ? 7.5 : 6.5;
    cameraTarget.set(followX - Math.sin(yaw) * 1.8, ctx.mobile ? 2.45 : 2.1, followZ - Math.cos(yaw) * 1.8);
    collisionOrigin.set(followX, .8, followZ);
    cameraDesired.set(followX + Math.sin(yaw) * Math.cos(pitch) * requestedDistance, .8 + Math.sin(pitch) * requestedDistance, followZ + Math.cos(yaw) * Math.cos(pitch) * requestedDistance);
    let distance = requestedDistance;
    for (const bounds of obstacles) distance = Math.min(distance, Math.max(3, segmentBoxDistance(collisionOrigin, cameraDesired, bounds) * requestedDistance - .3));
    const distanceEase = immediate || ctx.reduced ? 1 : 1 - Math.exp(-delta / (distance < cameraDistance ? .12 : .22));
    cameraDistance += (distance - cameraDistance) * distanceEase;
    camera.position.set(followX + Math.sin(yaw) * Math.cos(pitch) * cameraDistance, .8 + Math.sin(pitch) * cameraDistance, followZ + Math.cos(yaw) * Math.cos(pitch) * cameraDistance);
    camera.lookAt(cameraTarget);
  }
  function angleToward(current, target, amount) { const difference = Math.atan2(Math.sin(target - current), Math.cos(target - current)); return current + difference * amount; }

  function animate(time, delta) {
    if (disposed) return;
    environment.update(time, delta); machinery.update(time); secretPlate.visible = !ctx.dom.secret.hidden; resetFocus.visible=document.activeElement===ctx.dom.reset;
    const focused=document.activeElement;
    crownFocus.visible=!sceneLost&&focused===ctx.dom.secretButton;
    planNavFocus.visible=!sceneLost&&(focused===ctx.dom.archiveToggle||ctx.dom.route.contains(focused));
    if(!sceneLost&&ctx.dom.route.contains(focused)){
      const token=planTokens.get(focused.closest('.fair-route-row')?.dataset.fairSlug||'clock');
      routePlanFocus=true;planFocus.visible=!!token;if(token)planFocus.position.set(token.position.x,.20,token.position.z);
    }else if(routePlanFocus){routePlanFocus=false;planFocus.visible=false;}
    if (frozen) return;
    if (cameraMotion) {
      const motion = cameraMotion, progress = motion.duration ? Math.min(1,(time-motion.start)/motion.duration) : 1;
      const ease = progress*progress*(3-2*progress);
      camera.position.lerpVectors(motion.from,motion.to,ease); camera.quaternion.slerpQuaternions(motion.quaternion,motion.rotation,ease);
      if (progress >= 1) {cameraMotion=null;ctx.stage.dataset.fairView=inspectionMode||'walk';motion.done?.();} else ctx.wake();
      return true;
    }
    if (inspectionMode) return true;
    if (travelPose && performance.now() / 1000 - travelAt >= .15) { setPose(travelPose); travelPose = null; }
    if (performance.now() / 1000 - travelAt > .31) ctx.stage.classList.remove('fair-travel');
    let inputX = joyX, inputZ = joyZ;
    if (held.has('a') || held.has('arrowleft')) inputX -= 1; if (held.has('d') || held.has('arrowright')) inputX += 1;
    if (held.has('w') || held.has('arrowup')) inputZ += 1; if (held.has('s') || held.has('arrowdown')) inputZ -= 1;
    let dx = inputX * Math.cos(yaw) - inputZ * Math.sin(yaw), dz = -inputX * Math.sin(yaw) - inputZ * Math.cos(yaw);
    if (route.length && !inputX && !inputZ) {
      while (route.length && Math.hypot(route[0].x - player.position.x, route[0].z - player.position.z) < .18) route.shift();
      if (route.length) { dx = route[0].x - player.position.x; dz = route[0].z - player.position.z; const length = Math.hypot(dx, dz); dx /= length; dz /= length; }
    }
    const length = Math.hypot(dx, dz); if (length > 1) { dx /= length; dz /= length; }
    const moving = Math.hypot(dx, dz) > .01;
    const acceleration = 1 - Math.exp(-delta / (moving ? .05 : .03));
    vx += (dx * 3 - vx) * acceleration; vz += (dz * 3 - vz) * acceleration;
    if (Math.abs(vx) < .002) vx = 0; if (Math.abs(vz) < .002) vz = 0;
    const nextX = player.position.x + vx * delta, nextZ = player.position.z + vz * delta;
    if (canStand(nextX, player.position.z)) player.position.x = nextX; else vx = 0;
    if (canStand(player.position.x, nextZ)) player.position.z = nextZ; else vz = 0;
    const speed = Math.hypot(vx, vz);
    if (speed > .035) { heading = angleToward(heading, Math.atan2(vx, vz), ctx.reduced ? 1 : 1 - Math.exp(-delta / .06)); hint.hidden = true; walkPhase += delta * speed * 5; }
    player.rotation.y = heading;
    feet[0].rotation.x = speed > .035 ? Math.sin(walkPhase) * .105 : 0; feet[1].rotation.x = -feet[0].rotation.x;
    body.rotation.z = moving ? Math.max(-.035, Math.min(.035, inputX * -.03)) : 0;
    player.position.y = .015 + (ctx.reduced || speed > .035 ? 0 : Math.sin(time * Math.PI / 2) * .0075);
    if (!restoreCamera) updateCamera(delta);
    let closest = 'clock', nearest = Math.hypot(player.position.x, player.position.z);
    for (const [slug, [x, z]] of Object.entries(exhibitPositions)) { const distance = Math.hypot(player.position.x - x, player.position.z - z); if (distance < nearest) { closest = slug; nearest = distance; } }
    selected = closest;
    for (const leaf of leaves) {
      const active = (leaf.slug === closest && nearest < 4.5) || leaf.slug === hoveredSlug;
      leaf.edge.visible = active;
      const target = leaf.tilt + (active && !ctx.reduced ? -.209 : 0);
      leaf.hinge.rotation.x += (target - leaf.hinge.rotation.x) * (ctx.reduced ? 1 : 1 - Math.exp(-delta / (active ? .095 : .13)));
    }
    if (carousel) carousel.rotation.y += (carouselTarget - carousel.rotation.y) * (ctx.reduced ? 1 : 1 - Math.exp(-delta / .3));
    const age = time - localBurst, remoteAge = time - remoteBurst;
    const depression = ctx.pending || age < .18 ? .15 : 0;
    pressDepth += (depression - pressDepth) * (ctx.reduced ? 1 : 1 - Math.exp(-delta / (depression ? .047 : .08)));
    cap.position.y = 1.22 - pressDepth;
    const flagDip = ctx.reduced ? 0 : age < .65 ? Math.sin(age / .65 * Math.PI) * .14 : remoteAge < .4 ? Math.sin(remoteAge / .4 * Math.PI) * .025 : 0;
    for (const flag of flags) flag.rotation.z = -flagDip;
    // Reduced motion still permits deliberate walking and orbiting; those inputs must schedule frames.
    if (moving || speed > .002 || route.length || travelPose || joystickPointer !== null) ctx.wake();
    return true;
  }
  function resize(width, height) {
    camera.aspect = width / Math.max(1, height); camera.updateProjectionMatrix();
    pitch = ctx.mobile ? Math.PI / 5 : Math.PI / 6; ctx.dom.joystick.hidden = !ctx.mobile;
    hint.textContent = ctx.mobile ? 'Walk · drag' : 'Walk · drag';
    const planX = ctx.mobile ? -1.35 : -3.65, gatewayX = ctx.mobile ? 1.35 : 4.15;
    const stationScale=ctx.mobile?.72:1; plan.scale.setScalar(stationScale); gateway.scale.setScalar(stationScale); constellation.scale.setScalar(stationScale);
    plan.position.x = planX; planLetter.position.set(planX,.73*stationScale,5+.88*stationScale);planLetter.scale.setScalar(stationScale);
    gateway.position.x = gatewayX; constellation.position.set(gatewayX,1.25*stationScale,5.43);gatewayLetter.position.set(gatewayX,.60*stationScale,5.35+.71*stationScale);gatewayLetter.scale.setScalar(stationScale);
    Object.assign(planBounds,{minX:planX-1.05*stationScale,maxX:planX+1.05*stationScale,minZ:5-1.05*stationScale,maxZ:5+1.05*stationScale});
    Object.assign(gatewayBounds,{minX:gatewayX-.80*stationScale,maxX:gatewayX+.80*stationScale,minZ:5.35-.80*stationScale,maxZ:5.35+.80*stationScale});
    walkableEdges = edges.filter(([a,b]) => clearSegment(nodes[a],nodes[b]));
    for(const node of nodes)node.edges=[];
    for(const [a,b] of walkableEdges){const length=Math.hypot(nodes[b].x-nodes[a].x,nodes[b].z-nodes[a].z);nodes[a].edges.push({to:b,length});nodes[b].edges.push({to:a,length});}
    ctx.renderer.setPixelRatio(Math.min(devicePixelRatio, ctx.mobile ? 1.25 : 1.5));
    if (inspectionMode === 'screen' && inspectedSurface) {
      const center = inspectedSurface.getWorldPosition(new T.Vector3()), normal = new T.Vector3(0,0,1).applyQuaternion(inspectedSurface.getWorldQuaternion(new T.Quaternion()));
      const {width,height} = inspectedSurface.geometry.parameters;
      const fit = Math.max(height/.72,width/(camera.aspect*.88))/(2*Math.tan(T.MathUtils.degToRad(camera.fov/2)));
      const completion=cameraMotion?.done; cameraMotion = null; camera.position.copy(center).addScaledVector(normal,fit); camera.lookAt(center);camera.updateMatrixWorld(true);
      if(!frozen&&completion)completion();
      if(frozen){const rect=screenRect(inspectedSurface);for(const [key,value]of Object.entries(rect))document.documentElement.style.setProperty(`--fair-aperture-${key}`,`${value}px`);}
    } else if (inspectionMode === 'plan') { const original=preInspection;inspectionMode=null;inspectPlan();preInspection=original; }
    else if (inspectionMode === 'worlds') { const original=preInspection;inspectionMode=null;inspectWorlds();preInspection=original; }
    else updateCamera(1,true);
  }
  function overlay(open) {
    if (open) {
      snapshot = preInspection || capturePose();
      ctx.stage.dataset.fairView='projecting';clearInput(); frozen = true; travelPose = null; closeRoute(); ctx.stage.classList.remove('fair-travel');
      queueMicrotask(()=>{ if(frozen&&!disposed)document.querySelector('.ov-close')?.focus({preventScroll:true}); });
    } else {
      ctx.stage.dataset.fairView='walk';focusRestoring = true; document.documentElement.classList.remove('fair-projecting'); cameraMotion = null; inspectionMode = null; preInspection = null;
      if (snapshot) {
        ({ heading, yaw, pitch, cameraDistance, followX, followZ, selected } = snapshot);
        player.position.set(snapshot.x, snapshot.y, snapshot.z); player.rotation.y = heading;
        camera.position.fromArray(snapshot.camera); camera.quaternion.fromArray(snapshot.quaternion);
      }
      clearInput(); frozen = false; snapshot = null; restoreCamera = true;
      if (previewOrigin) {
        const origin = previewOrigin; previewOrigin = null;
        // The common overlay restores its archive anchor synchronously after this callback.
        queueMicrotask(() => {
          if (disposed || frozen) return;
          if (origin.route) { ctx.dom.route.hidden = false; ctx.dom.archiveToggle.setAttribute('aria-expanded', 'true'); }
          origin.element.focus({ preventScroll: true });
        });
      }
      queueMicrotask(()=>{focusRestoring=false;});
      ctx.wake();
    }
  }
  const clockWake = setInterval(() => { if (ctx.reduced && !document.hidden) ctx.wake(); }, 1000);
  resize(ctx.stage.clientWidth, ctx.stage.clientHeight);
  return {
    animate, resize, overlay,
    celebrate() { machinery.spin(); localBurst = performance.now() / 1000; ctx.wake(); },
    remote() { remoteBurst = performance.now() / 1000; ctx.wake(); },
    pending(value) { if (value) clearInput(); ctx.wake(); },
    dispose() {
      disposed = true; clearInterval(clockWake); clearInput(); document.documentElement.classList.remove('fair-ready', 'fair-world-active', 'fair-projecting');
      machinery.dispose(); environment.dispose();
      [ctx.dom.clock, ctx.dom.reset, ctx.dom.tally, ctx.dom.secretButton].forEach(element => ctx.unpin(element));
      hint.remove();
      const ownedGeometry = new Set(), ownedMaterials = new Set(), ownedTextures = new Set([aoTexture, ...textures]);
      world.traverse(object => {
        if (object.geometry) ownedGeometry.add(object.geometry);
        for (const material of (Array.isArray(object.material) ? object.material : [object.material])) if (material) {
          ownedMaterials.add(material); if (material.map) ownedTextures.add(material.map);
        }
      });
      ownedTextures.forEach(texture => texture.dispose()); ownedMaterials.forEach(material => material.dispose()); ownedGeometry.forEach(geometry => geometry.dispose());
      sun.shadow.map?.dispose();
      world.removeFromParent();
    }
  };
}
