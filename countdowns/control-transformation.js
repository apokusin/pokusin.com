// The old clock is blown apart; its replacement grows out of one grounded seed.
// Source meshes/materials stay intact. Only the little seed is owned by this helper.
export function createClockTransformation({ THREE, parts = [], center, actuator }) {
  const origin = center?.clone() || new THREE.Vector3();
  const duration = 5.8;
  const clamp = value => Math.max(0, Math.min(1, value));
  const smooth = value => { const t = clamp(value); return t * t * (3 - 2 * t); };
  // Accelerate from rest, then show a positive overshoot and a smaller rebound.
  const spring = (value, damping = 7, frequency = 11) => {
    const t = clamp(value);
    return t === 1 ? 1 : 1 - Math.exp(-damping * t) * (Math.cos(frequency * t) + damping / frequency * Math.sin(frequency * t));
  };
  const euler = new THREE.Euler();
  const offsetQuaternion = new THREE.Quaternion();
  const rotatedPivot = new THREE.Vector3();
  const hingeOffset = new THREE.Vector3();
  const machineScale = new THREE.Vector3();
  const localScale = new THREE.Vector3();
  const lidAxis = new THREE.Vector3(1, 0, 0);
  let active = false, disposed = false, lastAge = duration;

  function randomFor(index) {
    let seed = Math.imul(index + 1, 0x9e3779b1) >>> 0;
    return () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
  }
  // Inspect vertices without writing a bounding box into shared geometry.
  function localBounds(object) {
    const bounds = new THREE.Box3();
    const position = object.geometry?.attributes?.position;
    const vertex = new THREE.Vector3();
    if (position?.count) {
      for (let index = 0; index < position.count; index++) {
        vertex.fromBufferAttribute(position, index); bounds.expandByPoint(vertex);
      }
    } else {
      bounds.min.set(-.05, -.05, -.05); bounds.max.set(.05, .05, .05);
    }
    return bounds;
  }
  function inferRole(object, home, size) {
    const explicit = object.userData?.rebuildRole;
    if (['base', 'shell', 'display', 'detail', 'cable'].includes(explicit)) return explicit;
    if (/cable|plug|strain|tube/i.test(object.name || object.geometry?.type || '')) return 'cable';
    if (home.position.y < origin.y - .65 && size.y < .32 && Math.max(size.x, size.z) > .18) return 'base';
    if (size.x > 2 && size.y > .35 && size.z < .15 && home.position.z > origin.z + .3) return 'display';
    if (Math.max(size.x, size.y, size.z) > 1.08 && size.x * size.y * size.z > .04) return 'shell';
    return 'detail';
  }
  const seen = new Set();
  const records = parts.filter(object => {
    if (!object?.position || !object.quaternion || !object.scale || seen.has(object)) return false;
    seen.add(object); return true;
  }).map((object, index) => {
    const random = randomFor(index);
    const home = { position: object.position.clone(), quaternion: object.quaternion.clone(), scale: object.scale.clone(), visible: object.visible };
    const bounds = localBounds(object), size = bounds.getSize(new THREE.Vector3());
    const role = inferRole(object, home, size);
    const side = Math.abs(home.position.x - origin.x) > .12 ? Math.sign(home.position.x - origin.x) : (random() < .5 ? -1 : 1);
    const direction = home.position.clone().sub(origin);
    direction.x += side * (.5 + random());
    direction.y = Math.max(.4, direction.y + .6 + random() * .8);
    direction.z = .8 + random() * 1.3; direction.normalize();
    const power = role === 'detail' ? 7.2 + random() * 5.4 : 5.2 + random() * 3.6;
    const velocity = direction.multiplyScalar(power); velocity.y += 1.8 + random() * 2.4;
    const spinAxis = new THREE.Vector3(random() * 2 - 1, random() * 2 - 1, random() * 2 - 1).normalize();
    const spinSpeed = (4 + random() * 9) * (random() < .5 ? -1 : 1);
    const blastDelay = random() * .075, vanishesAt = 1.14 + random() * .47;
    return { object, home, bounds, size, role, side, random, velocity, spinAxis, spinSpeed, blastDelay, vanishesAt };
  });

  // Derive the clock's actual footprint, ignoring its outgoing cable and hidden
  // meshes. Scaling both vertices and installed positions about this ground
  // pivot keeps every growing component attached to the same machine.
  const machineBounds = new THREE.Box3(), corner = new THREE.Vector3();
  for (const record of records) {
    if (!record.home.visible || record.role === 'cable') continue;
    for (const x of [record.bounds.min.x, record.bounds.max.x]) for (const y of [record.bounds.min.y, record.bounds.max.y]) for (const z of [record.bounds.min.z, record.bounds.max.z]) {
      corner.set(x, y, z).multiply(record.home.scale).applyQuaternion(record.home.quaternion).add(record.home.position);
      machineBounds.expandByPoint(corner);
    }
  }
  const fullSize = new THREE.Vector3(.65, .65, .65);
  const footprint = origin.clone();
  if (!machineBounds.isEmpty()) {
    machineBounds.getSize(fullSize); machineBounds.getCenter(footprint); footprint.y = machineBounds.min.y;
  } else footprint.y = 0;
  const compactScale = new THREE.Vector3(.65 / Math.max(.65, fullSize.x), .65 / Math.max(.65, fullSize.y), .65 / Math.max(.65, fullSize.z));

  for (const record of records) {
    const { home, role, size, side, random } = record;
    const across = clamp((home.position.x - footprint.x) / Math.max(.65, fullSize.x) + .5);
    record.hinge = new THREE.Vector3(); record.pivot = new THREE.Vector3();
    if (role === 'base') {
      record.begins = 2.58; record.span = .8;
    } else if (role === 'shell') {
      record.begins = 2.65 + random() * .11; record.span = .86 + random() * .12;
      const roof = size.x > 2 && size.y < .1 && size.z > .3;
      const sidePanel = size.x < .2 && size.y > .45;
      const frontRail = size.x > 2 && size.y < .45 && home.position.z > footprint.z + .2;
      if (roof) {
        record.hinge.x = -Math.PI / 2; record.pivot.z = -size.z / 2;
      } else if (sidePanel) {
        record.hinge.z = -side * Math.PI / 2; record.pivot.y = -size.y / 2;
      } else if (frontRail) {
        const upper = home.position.y > origin.y;
        record.hinge.x = (upper ? 1 : -1) * Math.PI / 2; record.pivot.y = (upper ? -1 : 1) * size.y / 2;
      } else if (home.position.z < footprint.z) {
        record.hinge.x = Math.PI / 2; record.pivot.y = -size.y / 2;
      } else {
        record.hinge.y = -side * Math.PI / 2; record.pivot.x = -side * size.x / 2;
      }
    } else if (role === 'display') {
      record.begins = 3.1 + random() * .06; record.span = .94;
      record.hinge.x = -.18; record.pivot.y = -size.y / 2;
    } else if (role === 'cable') {
      record.begins = 3.7 + random() * .07; record.span = .57;
    } else {
      record.begins = 3.65 + across * .25 + random() * .09; record.span = .44;
    }
    record.localCenter = record.bounds.getCenter(new THREE.Vector3());
  }

  // The launch box is a separate assembly (translated into the foreground on
  // phones). Animate its direct modules in that assembly's local coordinates;
  // the cap keeps its ring and the hinged cover keeps its glass and crown.
  const actuatorAssembly = actuator?.assembly;
  const actuatorRecords = [];
  const actuatorBounds = new THREE.Box3();
  const actuatorFootprint = new THREE.Vector3();
  const actuatorPort = new THREE.Vector3();
  const actuatorAnchor = new THREE.Vector3();
  const actuatorVisible = actuatorAssembly?.visible;
  if (actuatorAssembly?.children) {
    actuatorAssembly.updateWorldMatrix(true, true);
    for (const [index, object] of actuatorAssembly.children.entries()) {
      if (!object.isMesh && !object.isGroup) continue;
      const random = randomFor(index + 1024);
      const home = { position: object.position.clone(), quaternion: object.quaternion.clone(), scale: object.scale.clone(), visible: object.visible };
      const role = object === actuator.cover ? 'cover' : object === actuator.button ? 'cap'
        : object.userData?.actuatorRole || (home.position.y < .3 ? 'base' : 'detail');
      const bounds = new THREE.Box3(), inverse = object.matrixWorld.clone().invert();
      const relative = new THREE.Matrix4();
      object.traverse(node => {
        if (!node.geometry || !node.visible) return;
        const local = localBounds(node); relative.multiplyMatrices(inverse, node.matrixWorld);
        for (const x of [local.min.x, local.max.x]) for (const y of [local.min.y, local.max.y]) for (const z of [local.min.z, local.max.z]) {
          corner.set(x, y, z).applyMatrix4(relative); bounds.expandByPoint(corner);
        }
      });
      if (!bounds.isEmpty() && home.visible) {
        for (const x of [bounds.min.x, bounds.max.x]) for (const y of [bounds.min.y, bounds.max.y]) for (const z of [bounds.min.z, bounds.max.z]) {
          corner.set(x, y, z).multiply(home.scale).applyQuaternion(home.quaternion).add(home.position);
          actuatorBounds.expandByPoint(corner);
        }
      }
      const side = random() < .5 ? -1 : 1;
      const velocity = new THREE.Vector3(side * (4 + random() * 3), 4 + random() * 3, 2 + random() * 4);
      const spinAxis = new THREE.Vector3(random() * 2 - 1, random() * 2 - 1, random() * 2 - 1).normalize();
      const begins = role === 'base' ? 4.12 : role === 'cover' ? 4.94 : role === 'cap' ? 4.58 + random() * .06 : role === 'cable' ? 4.36 : 4.44 + random() * .05;
      const span = role === 'cover' ? .71 : role === 'cap' ? .65 : role === 'base' ? .95 : .57;
      actuatorRecords.push({ object, home, role, velocity, spinAxis, spinSpeed: 5 + random() * 8,
        vanishesAt: 1.13 + random() * .4, begins, span, blast: home });
    }
    if (!actuatorBounds.isEmpty()) { actuatorBounds.getCenter(actuatorFootprint); actuatorFootprint.y = actuatorBounds.min.y; }
  }
  function restoreActuator() {
    actuatorRecords.forEach(restore);
    if (actuatorAssembly) actuatorAssembly.visible = actuatorVisible;
  }
  function updateActuator(age) {
    if (!actuatorRecords.length) return;
    // Read the current parent transforms rather than baking desktop positions.
    // Root supplies its real outlet in assembly.parent-local coordinates.
    if (actuator.outlet && actuatorAssembly.parent) {
      actuatorPort.copy(actuator.outlet); actuatorAssembly.parent.localToWorld(actuatorPort);
    } else {
      actuatorPort.set(machineBounds.isEmpty() ? origin.x : machineBounds.max.x, footprint.y + .15, footprint.z);
      parent?.localToWorld(actuatorPort);
    }
    actuatorAssembly.worldToLocal(actuatorPort);
    const travel = clamp(spring((age - 4.12) / .95, 8, 11));
    actuatorAnchor.copy(actuatorPort).lerp(actuatorFootprint, travel);
    const growth = Math.max(.06, .08 + .92 * spring((age - 4.12) / .95, 8, 11));
    let showing = false;
    for (const record of actuatorRecords) {
      const { object, home, blast } = record;
      if (!home.visible) { object.visible = false; continue; }
      if (age < record.vanishesAt) {
        const flight = Math.max(0, age - .025);
        object.visible = true; showing = true;
        object.position.copy(blast.position).addScaledVector(record.velocity, flight); object.position.y -= 4.8 * flight * flight;
        object.quaternion.copy(blast.quaternion);
        if (flight > 0) { offsetQuaternion.setFromAxisAngle(record.spinAxis, record.spinSpeed * flight); object.quaternion.premultiply(offsetQuaternion); }
        object.scale.copy(blast.scale).multiplyScalar(1 - smooth((age - record.vanishesAt + .3) / .3) * .93);
      } else if (age < record.begins) {
        object.visible = false;
      } else if (age < record.begins + record.span) {
        const progress = spring((age - record.begins) / record.span, 7.8, 12);
        const folded = 1 - progress;
        object.visible = true; showing = true;
        object.position.copy(home.position).sub(actuatorFootprint).multiplyScalar(growth).add(actuatorAnchor);
        const pop = record.role === 'base' ? 1 : Math.max(.08, .12 + progress * .88);
        object.scale.copy(home.scale).multiplyScalar(growth * pop);
        object.quaternion.copy(home.quaternion);
        if (record.role === 'cover') {
          // This is the same rear hinge, now closing onto the rebuilt cap. The
          // final rebound is small enough to stay within the physical stop.
          offsetQuaternion.setFromAxisAngle(lidAxis, -1.8 * Math.max(0, folded) - .09 * Math.min(0, folded));
          object.quaternion.multiply(offsetQuaternion);
        } else if (record.role === 'cap') object.position.y += .12 * folded;
        else if (record.role === 'detail') object.position.z += .035 * folded;
      } else { restore(record); showing = true; }
    }
    actuatorAssembly.visible = Boolean(actuatorVisible && showing);
  }

  // A physical seed, rather than a miniature of the final clock. The split
  // front doors and rear-hinged roof reveal the sage internal spine before it
  // telescopes. Its geometry/materials are the only resources owned here.
  const resources = new Set();
  const keep = resource => { resources.add(resource); return resource; };
  const parent = records.find(record => record.object.parent)?.object.parent;
  let seedGroup, seedCore, seedRoof, seedBack;
  const seedDoors = [], seedSeams = [], seedSkins = [];
  let bone, sage, accent, screwMaterial;
  if (parent && records.some(record => record.home.visible)) {
    seedGroup = new THREE.Group(); seedGroup.name = 'clock-replacement-seed'; seedGroup.visible = false;
    seedGroup.position.copy(footprint); parent.add(seedGroup);
    const unitBox = keep(new THREE.BoxGeometry(1, 1, 1));
    bone = keep(new THREE.MeshStandardMaterial({ color: 0xd9d7c9, metalness: .18, roughness: .53, transparent: true, depthWrite: false }));
    sage = keep(new THREE.MeshStandardMaterial({ color: 0x617063, metalness: .25, roughness: .63, transparent: true, depthWrite: false }));
    const dark = keep(new THREE.MeshStandardMaterial({ color: 0x18231d, metalness: .4, roughness: .55 }));
    accent = keep(new THREE.MeshStandardMaterial({ color: 0x18231d, metalness: .4, roughness: .55, transparent: true, depthWrite: false }));
    screwMaterial = keep(new THREE.MeshStandardMaterial({ color: 0x7a7969, metalness: .8, roughness: .3, transparent: true, depthWrite: false }));
    function seedBox(w, h, d, surface, x, y, z, holder = seedGroup) {
      const mesh = new THREE.Mesh(unitBox, surface); mesh.position.set(x, y, z); mesh.scale.set(w, h, d);
      mesh.castShadow = mesh.receiveShadow = true; holder.add(mesh);
      if (surface === bone || surface === sage || surface === accent || surface === screwMaterial) seedSkins.push(mesh);
      return mesh;
    }
    seedCore = seedBox(.52, .46, .52, dark, 0, .325, 0);
    seedBox(.63, .04, .63, sage, 0, .025, 0);
    seedBack = seedBox(.64, .63, .025, sage, 0, .325, -.325);
    for (const side of [-1, 1]) {
      const door = new THREE.Group(); door.position.set(side * .325, .325, .325); seedGroup.add(door);
      seedBox(.321, .63, .028, bone, -side * .163, 0, 0, door);
      const seam = seedBox(.009, .58, .004, accent, -side * .005, 0, .017, door); seedSeams.push(seam);
      for (const y of [-.235, .235]) seedBox(.035, .035, .012, screwMaterial, -side * .27, y, .022, door);
      seedDoors.push({ door, side });
      seedBox(.025, .63, .63, sage, side * .325, .325, 0);
    }
    seedRoof = new THREE.Group(); seedRoof.position.set(0, .65, -.325); seedGroup.add(seedRoof);
    seedBox(.65, .028, .65, bone, 0, 0, .325, seedRoof);
    seedBox(.58, .004, .008, accent, 0, .017, .56, seedRoof);
  }

  function restore(record) {
    record.object.position.copy(record.home.position); record.object.quaternion.copy(record.home.quaternion);
    record.object.scale.copy(record.home.scale); record.object.visible = record.home.visible;
  }
  function finish() {
    records.forEach(restore); restoreActuator(); active = false; lastAge = duration;
    if (seedGroup) seedGroup.visible = false;
    if (bone) bone.opacity = 1;
    if (sage) sage.opacity = 1;
    if (accent) accent.opacity = 1;
    if (screwMaterial) screwMaterial.opacity = 1;
  }
  function growingMachine(age) {
    const width = spring((age - 2.58) / .8, 7, 11);
    const height = spring((age - 3) / .95, 8.5, 11);
    const depth = spring((age - 2.82) / .73, 8, 11);
    machineScale.set(
      compactScale.x + (1 - compactScale.x) * width,
      compactScale.y + (1 - compactScale.y) * height,
      compactScale.z + (1 - compactScale.z) * depth
    );
    if (seedGroup) {
      const pop = Math.max(.035, spring((age - 2.08) / .24, 6.5, 11));
      const anticipation = Math.sin(Math.PI * clamp((age - 2.46) / .12));
      seedGroup.visible = age >= 2.08 && age < 3.86;
      seedGroup.scale.set(machineScale.x / compactScale.x * pop * (1 + anticipation * .055),
        machineScale.y / compactScale.y * pop * (1 - anticipation * .16), machineScale.z / compactScale.z * pop);
      const unlatch = spring((age - 2.5) / .48, 7, 11);
      seedRoof.rotation.x = -unlatch * Math.PI * .53;
      for (const { door, side } of seedDoors) door.rotation.y = side * unlatch * Math.PI * .52;
      const skinFade = 1 - smooth((age - 3.04) / .38);
      bone.opacity = sage.opacity = accent.opacity = screwMaterial.opacity = skinFade;
      for (const skin of seedSkins) { skin.visible = skinFade > .001; skin.castShadow = skinFade > .65; }
      seedRoof.visible = skinFade > .001; seedBack.visible = skinFade > .001;
      for (const { door } of seedDoors) door.visible = skinFade > .001;
      for (const seam of seedSeams) seam.visible = skinFade > .001;
      seedCore.visible = age < 3.86;
    }
  }
  function update(ageSeconds) {
    if (!active || disposed) return false;
    const age = Number.isFinite(ageSeconds) ? Math.max(0, ageSeconds) : 0; lastAge = age;
    if (age >= duration) { finish(); return false; }
    growingMachine(age);
    updateActuator(age);
    for (const record of records) {
      const { object, home } = record;
      if (!home.visible) { object.visible = false; continue; }
      if (age < record.vanishesAt) {
        const flight = Math.max(0, age - record.blastDelay);
        object.visible = true; object.position.copy(home.position).addScaledVector(record.velocity, flight);
        object.position.y -= 4.8 * flight * flight;
        offsetQuaternion.setFromAxisAngle(record.spinAxis, record.spinSpeed * flight);
        object.quaternion.copy(home.quaternion).premultiply(offsetQuaternion);
        object.scale.copy(home.scale).multiplyScalar(1 - smooth((age - record.vanishesAt + .32) / .32) * .93);
      } else if (age < record.begins) {
        object.visible = false;
      } else if (age < 4.5) {
        const t = clamp((age - record.begins) / record.span);
        const progress = spring(t, record.role === 'detail' ? 6.3 : 7.2, 12);
        const folded = 1 - progress;
        object.visible = true;
        // All installed positions and dimensions expand from this same pivot.
        object.position.copy(home.position).sub(footprint).multiply(machineScale).add(footprint);
        localScale.copy(machineScale);
        if (record.role === 'display') localScale.y *= Math.max(.05, .1 + progress * .9);
        else if (record.role === 'detail') {
          // Long trim stays within its installed socket: spring the short axes,
          // rather than stretching a seam or bezel beyond its enclosure.
          const pop = Math.max(.035, .08 + progress * .92);
          for (const axis of ['x', 'y', 'z']) localScale[axis] *= record.size[axis] > .6 ? Math.min(1, pop) : pop;
        } else if (record.role === 'cable') localScale.multiplyScalar(Math.max(.035, .08 + progress * .92));
        object.scale.copy(home.scale).multiply(localScale);
        euler.set(record.hinge.x * folded, record.hinge.y * folded, record.hinge.z * folded);
        offsetQuaternion.setFromEuler(euler); object.quaternion.copy(home.quaternion).multiply(offsetQuaternion);
        rotatedPivot.copy(record.pivot).applyQuaternion(offsetQuaternion);
        hingeOffset.copy(record.pivot).sub(rotatedPivot).multiply(home.scale).applyQuaternion(home.quaternion).multiply(machineScale);
        object.position.add(hingeOffset);
        // Small cassettes emerge from their own sockets, not from outside the
        // instrument. Their stroke and spring recoil remain only centimetres.
        if (record.role === 'display') object.position.z += .09 * folded;
        else if (record.role === 'detail' && record.size.z < .2) object.position.z += .055 * folded;
        if (record.role === 'detail' || record.role === 'cable') {
          hingeOffset.copy(record.localCenter).multiply(home.scale).applyQuaternion(home.quaternion).multiply(machineScale);
          object.position.addScaledVector(hingeOffset, 1 - Math.max(.035, .08 + progress * .92));
        }
      } else restore(record);
    }
    return true;
  }
  return {
    start() {
      if (disposed) return;
      if (active) finish();
      const actuatorFlight = actuatorRecords.map(record => ({ position: record.object.position.clone(), quaternion: record.object.quaternion.clone(), scale: record.object.scale.clone(), visible: record.object.visible }));
      finish(); active = records.some(record => record.home.visible) || actuatorRecords.some(record => record.home.visible); lastAge = active ? 0 : duration;
      actuatorRecords.forEach((record, index) => { record.blast = actuatorFlight[index]; });
      if (active) updateActuator(0);
    },
    update,
    finish,
    dispose() {
      if (disposed) return;
      finish(); disposed = true; seedGroup?.removeFromParent();
      resources.forEach(resource => resource.dispose()); resources.clear(); records.length = 0; actuatorRecords.length = 0; seen.clear();
    },
    get screenReady() { return !active || lastAge >= 4.5; }
  };
}
