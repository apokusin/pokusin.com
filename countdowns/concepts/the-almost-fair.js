// A hand-authored fair, rather than a game engine: paths, seven exhibits and one visitor.
export function create(ctx) {
  const T = ctx.THREE;
  const palette = { cream: 0xf2e5cc, jade: 0x77958a, coral: 0xd86b55, ink: 0x263b40 };
  const world = new T.Group(); ctx.root.add(world);
  const materials = Object.fromEntries(Object.entries(palette).map(([key, color]) => [key,
    new T.MeshStandardMaterial({ color, roughness: .95, metalness: 0, flatShading: true })]));
  const roundCream = materials.cream.clone(); roundCream.flatShading = false;
  ctx.scene.background = new T.Color(palette.jade);
  ctx.renderer.toneMapping = T.NeutralToneMapping;
  ctx.renderer.toneMappingExposure = 1.18;
  ctx.renderer.shadowMap.enabled = true; ctx.renderer.shadowMap.type = T.PCFSoftShadowMap;
  const sky = new T.HemisphereLight(0xedf2ee, 0xa19c86, .85); world.add(sky);
  const sun = new T.DirectionalLight(0xfff4df, 2.2); sun.position.set(-8, 12, 9);
  sun.castShadow = true; sun.shadow.mapSize.set(1024, 1024);
  Object.assign(sun.shadow.camera, { left: -12, right: 12, top: 12, bottom: -12, near: .5, far: 45 });
  sun.shadow.bias = -.0006; sun.shadow.normalBias = .035; world.add(sun, sun.target);

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
    [8, -2.5], [5.8, 1.65], [3, 2.8], [0, -3.5]
  ].map(([x, z]) => ({ x, z, edges: [] }));
  const edges = [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,8],[7,9],[9,10],
    [10,11],[11,12],[12,13],[13,1],[4,14],[14,11],[14,7]];
  batch('box', 'cream', 0, -.2, -3, 38, .4, 30, 0, 0, 0, false);
  batch('box', 'jade', 0, .005, -3, 31, .025, 23, 0, 0, 0, false);
  for (const [a, b] of edges) {
    const A = nodes[a], B = nodes[b], dx = B.x - A.x, dz = B.z - A.z;
    const length = Math.hypot(dx, dz);
    A.edges.push({ to: b, length }); B.edges.push({ to: a, length });
  }
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
  function namePlate(text, x, y, z, width = 3.6) {
    const canvas = document.createElement('canvas'); canvas.width = 640; canvas.height = 80;
    const c = canvas.getContext('2d'); c.fillStyle = '#f2e5cc'; c.fillRect(0, 0, 640, 80);
    c.fillStyle = '#263b40'; c.font = '500 31px "IBM Plex Mono", monospace'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(text, 320, 41, 596);
    const texture = new T.CanvasTexture(canvas); texture.colorSpace = T.SRGBColorSpace; textures.push(texture);
    const plate = mesh(new T.PlaneGeometry(width, width / 8), new T.MeshBasicMaterial({ map: texture, toneMapped: false }), x, y, z);
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
    const [x, z] = exhibitPositions[show.slug] || [0, -13];
    safePoses[show.slug] = { x, z: z + 3.15, yaw: 0 };
    obstacles.push({ minX: x - 2.1, maxX: x + 2.1, minZ: z - 1.1, maxZ: z + .9, height: 2.7 });
    contact(x, z, 5, 3.6);
    batch('box', 'cream', x, .09, z, 4.4, .12, 2.6);
    const cards = show.cards.map(info => ({ ...info, node: resolveCard(info) }));
    if (show.slug === 'got') {
      for (const dx of [-1.8, 1.8]) batch('box', 'jade', x + dx, 1.25, z - .45, .16, 2.35, .18);
      batch('box', 'jade', x, 2.43, z - .45, 3.85, .16, .5);
      for (let i = 0; i < cards.length; i++) {
        const dx = (i - (cards.length - 1) / 2) * 1.22;
        batch('box', 'cream', x + dx, .65, z + .55, .1, 1.1, .14);
        preview(cards[i], show.slug, x + dx, 1.28, z + .62, 1.08);
      }
      namePlate(show.name, x, 2.14, z + .48);
      routeMark(x - 1.8, .75, z + .48);
    } else if (show.slug === 'dexter') {
      batch('box', 'coral', x, 1.15, z - .75, 4.0, 2.08, .18);
      for (let i = 0; i < 7; i++) batch('box', 'cream', x - 1.8 + i * .6, 1.12, z - .63, .012, 1.94, .024);
      batch('box', 'jade', x, .78, z + .65, 3.45, .1, .19);
      for (const dx of [-1.55, 1.55]) batch('box', 'jade', x + dx, .44, z + .65, .08, .8, .09);
      cards.forEach((info, i) => preview(info, show.slug, x + (i ? .9 : -.9), 1.34, z + .7, 1.45));
      namePlate(show.name, x, 2.38, z - .6);
    } else if (show.slug === 'sherlock') {
      for (const dx of [-1.7, 1.7]) batch('box', 'cream', x + dx, 1.3, z - .6, .32, 2.5, .45);
      batch('box', 'jade', x, 2.56, z - .6, 3.7, .2, .55);
      batch('box', 'jade', x - 1.3, 1.23, z - .58, .52, 2.28, .15, 0, -.28);
      cards.forEach((info, i) => {
        const dx = i ? .9 : -.9;
        batch('box', 'coral', x + dx, .58, z + .5, .14, 1.05, .15);
        preview(info, show.slug, x + dx, 1.15, z + .57, 1.34, world, -.17);
      });
      namePlate(show.name, x, 2.24, z + .17, 2.5);
    } else if (show.slug === 'archer') {
      batch('cylinder', 'jade', x, .2, z, 3.75, .22, 3.75);
      for (const dx of [-1.45, 1.45]) batch('box', 'cream', x + dx, 1.3, z - .3, .12, 2.3, .12);
      batch('cone', 'jade', x, 2.31, z, 4.25, .48, 4.25);
      batch('cone', 'cream', x, 2.6, z, 2.8, .2, 2.8);
      carousel = new T.Group(); carousel.position.set(x, .02, z + .25); world.add(carousel);
      const spindle = mesh(new T.CylinderGeometry(.22, .25, .5, 8), materials.coral, 0, .51, .47, carousel);
      spindle.userData.carousel = true; interactive.push(spindle);
      cards.forEach(info => {
        box(.12, 1.2, .12, materials.cream, 0, .82, .5, carousel);
        preview(info, show.slug, 0, 1.34, .62, 1.6, carousel);
      });
      namePlate(show.name, x, 2.13, z + 1.22, 2.2);
    } else if (show.slug === 'breaking-bad') {
      for (const dx of [-1.6, 1.6]) batch('box', 'cream', x + dx, 1.3, z - .25, .15, 2.45, .17);
      batch('box', 'jade', x, 2.58, z - .05, 4.15, .12, 2.05, .1, 0, -.1);
      cards.forEach((info, i) => {
        const dx = i ? .9 : -.9;
        batch('box', 'cream', x + dx, .65, z + .6, .6, 1.2, .4);
        preview(info, show.slug, x + dx, 1.32, z + .73, 1.4, world, -.12);
      });
      namePlate(show.name, x, 2.25, z + .8);
    } else if (show.slug === 'house-of-cards') {
      batch('box', 'cream', x - 1.1, 1.35, z - .3, .12, 2.5, 2.3, 0, 0, -.29);
      batch('box', 'jade', x + 1.1, 1.35, z - .3, .12, 2.5, 2.3, 0, 0, .29);
      batch('box', 'cream', x, .65, z + .62, .7, 1.2, .45);
      cards.forEach(info => preview(info, show.slug, x, 1.45, z + .73, 1.65));
      namePlate(show.name, x, 2.4, z + .52);
    } else {
      batch('box', 'jade', x, 1.25, z - .72, 4.0, 2.35, .35);
      for (const dx of [-1.9, 0, 1.9]) batch('box', 'cream', x + dx, 1.22, z + .15, .14, 2.3, .5);
      batch('box', 'jade', x, 2.47, z + .14, 4.3, .15, .65);
      cards.forEach((info, i) => {
        const dx = i ? .92 : -.92;
        batch('box', 'jade', x + dx, .47, z + .5, 1.55, .75, .7);
        preview(info, show.slug, x + dx, 1.36, z + .5, 1.48);
      });
      namePlate(show.name, x, 2.17, z + .55);
    }
    roofFlag(x + 1.48, 2.58, z - .15);
  }

  // The clock is a physical gate. HTML reels sit on its four dark drums.
  for (const x of [-2.51, 2.51]) {
    batch('box', 'jade', x, 1.32, 0, .38, 2.65, .48);
    batch('box', 'cream', x, .12, 0, .75, .2, .85);
    obstacles.push({ minX: x - .2, maxX: x + .2, minZ: -.24, maxZ: .24, height: 4.2 });
    contact(x, 0, 1.15, 1.2);
  }
  const archShape = new T.Shape(), outerRadius = 2.7, innerRadius = 2.32;
  archShape.moveTo(-outerRadius, 0); archShape.absarc(0, 0, outerRadius, Math.PI, 0, true);
  archShape.lineTo(innerRadius, 0); archShape.absarc(0, 0, innerRadius, 0, Math.PI, false); archShape.closePath();
  mesh(new T.ExtrudeGeometry(archShape, { depth: .32, bevelEnabled: false, curveSegments: 12 }), materials.jade, 0, 2.5, -.16);
  const clockAnchor = new T.Object3D(); clockAnchor.position.set(0, 3.15, .71); world.add(clockAnchor);
  for (let i = 0; i < 4; i++) {
    const drum = mesh(new T.CylinderGeometry(.66, .66, 1.12, 16), materials.ink, (i - 1.5) * 1.17, 3.15, 0);
    drum.rotation.z = Math.PI / 2;
  }
  const plunger = new T.Group(); plunger.position.set(1.25, 0, 2.1); world.add(plunger); contact(1.25, 2.1, 1.8, 1.8);
  obstacles.push({ minX: .64, maxX: 1.86, minZ: 1.49, maxZ: 2.71, height: 1.4 });
  mesh(new T.CylinderGeometry(.61, .68, 1.02, 12), materials.cream, 0, .6, 0, plunger);
  mesh(new T.CylinderGeometry(.66, .66, .13, 12), materials.coral, 0, .08, 0, plunger);
  const cap = new T.Group(); cap.position.y = 1.22; plunger.add(cap);
  mesh(new T.CylinderGeometry(.18, .18, .26, 12), materials.coral, 0, -.09, 0, cap);
  mesh(new T.CylinderGeometry(.57, .59, .18, 12), materials.coral, 0, .1, 0, cap);
  const plungerAnchor = new T.Object3D(); plungerAnchor.position.set(0, .16, .42); cap.add(plungerAnchor);
  const tallyAnchor = new T.Object3D(); tallyAnchor.position.set(0, .66, .63); plunger.add(tallyAnchor);
  const crownShape = new T.Shape();
  crownShape.moveTo(-.1, -.05); crownShape.lineTo(-.13, .09); crownShape.lineTo(-.05, .035);
  crownShape.lineTo(0, .13); crownShape.lineTo(.05, .035); crownShape.lineTo(.13, .09); crownShape.lineTo(.1, -.05); crownShape.closePath();
  const crown = mesh(new T.ShapeGeometry(crownShape), materials.coral, -2.3, 1.57, .25); crown.castShadow = false;
  ctx.pin(ctx.dom.clock, clockAnchor, { width: 4.45 });
  ctx.pin(ctx.dom.reset, plungerAnchor, { width: 1.0 });
  ctx.pin(ctx.dom.tally, tallyAnchor, { width: .85 });
  ctx.pin(ctx.dom.secretButton, crown, { width: .3 });

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
  const body = mesh(new T.CylinderGeometry(.19, .32, .53, 8), materials.coral, 0, .44, 0, player);
  mesh(new T.SphereGeometry(.235, 12, 8), roundCream, 0, .87, 0, player);
  const feet = [-.13, .13].map(x => mesh(new T.BoxGeometry(.14, .12, .24), materials.ink, x, .1, .02, player));
  const playerAO = mesh(new T.PlaneGeometry(.8, .8), aoMaterial, 0, .044, 0, player);
  playerAO.rotation.x = -Math.PI / 2; playerAO.castShadow = false;

  let disposed = false, frozen = false, snapshot = null, held = new Set(), restoreCamera = false, previewOrigin = null;
  let yaw = 0, pitch = Math.PI / 6, cameraDistance = 6.5, followX = player.position.x, followZ = player.position.z;
  let vx = 0, vz = 0, walkPhase = 0, heading = Math.PI, selected = 'clock';
  let pointer = null, joystickPointer = null, joyX = 0, joyZ = 0, route = [], travelAt = -Infinity, travelPose = null;
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
    const row = document.createElement('div'); row.className = 'fair-route-row';
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
  ctx.on(archive, 'click', () => { closeRoute(); clearInput(); }); ctx.dom.route.append(archive);
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
  document.documentElement.classList.add('fair-ready');

  function resolveCard(info) {
    if (info.node?.nodeType) return info.node;
    return ctx.cards.find(card => card.getAttribute('href') === info.href || card.href === info.href);
  }
  function routePreview(event, info) {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    const card = resolveCard(info); if (!card) return;
    event.preventDefault(); const originRect = event.currentTarget.getBoundingClientRect();
    previewOrigin = { element: event.currentTarget, route: true }; closeRoute(); clearInput(); ctx.openPreview(card, { originRect });
  }
  function closeRoute() { ctx.dom.route.hidden = true; ctx.dom.archiveToggle.setAttribute('aria-expanded', 'false'); }
  function clearInput() {
    if (pointer && ctx.canvas.hasPointerCapture(pointer.id)) ctx.canvas.releasePointerCapture(pointer.id);
    if (joystickPointer !== null && ctx.dom.joystick.hasPointerCapture(joystickPointer)) ctx.dom.joystick.releasePointerCapture(joystickPointer);
    held.clear(); joyX = joyZ = vx = vz = 0; joystickPointer = null; route = []; pointer = null;
    stick.style.transform = 'translate(0,0)';
  }
  function travel(slug) {
    if (frozen) return;
    clearInput(); closeRoute(); selected = slug;
    if (ctx.reduced) { setPose(safePoses[slug]); return; }
    travelPose = safePoses[slug]; travelAt = performance.now() / 1000;
    ctx.stage.classList.remove('fair-travel'); void ctx.stage.offsetWidth; ctx.stage.classList.add('fair-travel'); ctx.wake();
  }
  function setPose(pose) {
    if (!pose) return;
    player.position.x = followX = pose.x; player.position.z = followZ = pose.z; yaw = pose.yaw; heading = Math.PI; player.rotation.y = heading;
    restoreCamera = false; cameraDistance = ctx.mobile ? 7.5 : 6.5; updateCamera(1, true); hint.hidden = true; ctx.wake();
  }
  function closestPath(x, z) {
    let best = null;
    for (const [a, b] of edges) {
      const A = nodes[a], B = nodes[b], dx = B.x - A.x, dz = B.z - A.z;
      const ratio = Math.max(0, Math.min(1, ((x - A.x) * dx + (z - A.z) * dz) / (dx * dx + dz * dz)));
      const px = A.x + dx * ratio, pz = A.z + dz * ratio, distance = Math.hypot(x - px, z - pz);
      if (!best || distance < best.distance) best = { x: px, z: pz, a, b, distance };
    }
    return best;
  }
  function walkTo(x, z) {
    const target = closestPath(x, z); if (!target || target.distance > 1.3) return;
    const start = closestPath(player.position.x, player.position.z);
    if (start.a === target.a && start.b === target.b) { route = [start, target]; ctx.wake(); return; }
    const distance = nodes.map(() => Infinity), previous = nodes.map(() => -1), unvisited = new Set(nodes.map((_, i) => i));
    for (const index of [start.a, start.b]) distance[index] = Math.hypot(start.x - nodes[index].x, start.z - nodes[index].z);
    while (unvisited.size) {
      let nearest = -1; for (const index of unvisited) if (nearest < 0 || distance[index] < distance[nearest]) nearest = index;
      unvisited.delete(nearest);
      for (const edge of nodes[nearest].edges) if (distance[nearest] + edge.length < distance[edge.to]) { distance[edge.to] = distance[nearest] + edge.length; previous[edge.to] = nearest; }
    }
    const finish = distance[target.a] + Math.hypot(target.x - nodes[target.a].x, target.z - nodes[target.a].z) < distance[target.b] + Math.hypot(target.x - nodes[target.b].x, target.z - nodes[target.b].z) ? target.a : target.b;
    const chain = []; let current = finish;
    while (current >= 0) { chain.unshift(nodes[current]); current = previous[current]; }
    route = [start, ...chain, target]; ctx.wake();
  }
  function pointerRay(event) {
    const rect = ctx.canvas.getBoundingClientRect();
    rayPoint.set((event.clientX - rect.left) / rect.width * 2 - 1, -(event.clientY - rect.top) / rect.height * 2 + 1); raycaster.setFromCamera(rayPoint, camera);
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
  ctx.on(ctx.dom.route, 'keydown', event => { if (event.key === 'Escape') { event.stopPropagation(); closeRoute(); ctx.dom.archiveToggle.focus({ preventScroll: true }); } });
  ctx.on(ctx.canvas, 'keydown', event => {
    if (frozen || document.activeElement !== ctx.canvas) return;
    const key = event.key.toLowerCase();
    if (['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright'].includes(key)) { event.preventDefault(); restoreCamera = false; held.add(key); route = []; ctx.wake(); }
  });
  ctx.on(window, 'keyup', event => held.delete(event.key.toLowerCase()));
  ctx.on(ctx.canvas, 'blur', clearInput); ctx.on(window, 'blur', clearInput);
  ctx.on(document, 'visibilitychange', () => { if (document.hidden) clearInput(); });
  ctx.on(ctx.canvas, 'pointerdown', event => {
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
      pointerRay(event); const hit = raycaster.intersectObjects(interactive, false)[0];
      hoveredSlug = hit?.object.userData.slug || ''; ctx.canvas.style.cursor = hit ? 'pointer' : 'grab'; ctx.wake(); return;
    }
    if (pointer.id !== event.pointerId) return;
    const threshold = pointer.touch ? 10 : 6;
    if (!pointer.orbit && Math.hypot(event.clientX - pointer.x, event.clientY - pointer.y) > threshold) { pointer.orbit = true; route = []; }
    if (pointer.orbit) {
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
    const hit = raycaster.intersectObjects(interactive, false)[0];
    if (hit?.object.userData.preview) {
      const card = resolveCard(hit.object.userData.preview); if (!card) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) { window.open(card.href, '_blank', 'noopener'); return; }
      previewOrigin = { element: ctx.canvas, route: false }; clearInput(); ctx.openPreview(card, { originRect: screenRect(hit.object) }); return;
    }
    if (hit?.object.userData.carousel) { carouselTarget += Math.PI / 3; ctx.wake(); return; }
    if (raycaster.ray.intersectPlane(groundPlane, groundHit)) walkTo(groundHit.x, groundHit.z);
  });
  ctx.on(ctx.canvas, 'pointercancel', clearInput);
  ctx.on(ctx.canvas, 'pointerleave', () => { hoveredSlug = ''; ctx.canvas.style.cursor = 'grab'; ctx.wake(); });
  ctx.on(ctx.dom.secretButton, 'click', clearInput);
  ctx.on(ctx.canvas, 'auxclick', event => {
    if (frozen || event.button !== 1) return;
    pointerRay(event); const hit = raycaster.intersectObjects(screens, false)[0];
    if (hit?.object.userData.preview) { const card = resolveCard(hit.object.userData.preview); if (card) { event.preventDefault(); window.open(card.href, '_blank', 'noopener'); } }
  });
  ctx.on(ctx.dom.joystick, 'pointerdown', event => {
    if (frozen) return;
    event.preventDefault(); event.stopPropagation(); held.clear(); route = []; restoreCamera = false; closeRoute(); ctx.canvas.focus({ preventScroll: true });
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
    cameraTarget.set(followX - Math.sin(yaw) * 1.8, 1.8, followZ - Math.cos(yaw) * 1.8);
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
    if (frozen || disposed) return;
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
    sun.position.set(player.position.x - 8, 12, player.position.z + 9); sun.target.position.set(player.position.x, 0, player.position.z);
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
    hint.textContent = ctx.mobile ? '↕  ↔' : 'Walk · drag';
    ctx.renderer.setPixelRatio(Math.min(devicePixelRatio, ctx.mobile ? 1.25 : 1.5)); updateCamera(1, true);
  }
  function overlay(open) {
    if (open) {
      snapshot = { x: player.position.x, z: player.position.z, y: player.position.y, heading, yaw, pitch, cameraDistance, followX, followZ, selected, camera: camera.position.toArray(), quaternion: camera.quaternion.toArray() };
      clearInput(); frozen = true; travelPose = null; closeRoute(); ctx.stage.classList.remove('fair-travel');
    } else {
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
      ctx.wake();
    }
  }
  resize(ctx.stage.clientWidth, ctx.stage.clientHeight);
  return {
    animate, resize, overlay,
    celebrate() { localBurst = performance.now() / 1000; ctx.wake(); },
    remote() { remoteBurst = performance.now() / 1000; ctx.wake(); },
    pending(value) { if (value) clearInput(); ctx.wake(); },
    dispose() {
      disposed = true; clearInput(); document.documentElement.classList.remove('fair-ready');
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
