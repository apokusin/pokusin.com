// Clock hardware, rather than a single intact box: the old instrument is lost,
// then a replacement arrives along different paths and assembles in stages.
// Everything stays in its parent's local space, including the saved home poses.
export function createClockTransformation({ THREE, parts = [], center }) {
  const origin = center?.clone() || new THREE.Vector3();
  const duration = 5.8;
  const clamp = value => Math.max(0, Math.min(1, value));
  const smooth = value => { const t = clamp(value); return t * t * (3 - 2 * t); };
  const euler = new THREE.Euler();
  const offsetQuaternion = new THREE.Quaternion();
  const rotatedPivot = new THREE.Vector3();
  const hingeOffset = new THREE.Vector3();
  let active = false, disposed = false, lastAge = duration;

  function randomFor(index) {
    let seed = Math.imul(index + 1, 0x9e3779b1) >>> 0;
    return () => {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      return seed / 4294967296;
    };
  }

  // Inspect vertex bounds without writing a bounding box into shared geometry.
  function dimensions(object) {
    const size = new THREE.Vector3(.1, .1, .1);
    const position = object.geometry?.attributes?.position;
    if (!position || !position.count) return size;
    const bounds = new THREE.Box3();
    const vertex = new THREE.Vector3();
    for (let index = 0; index < position.count; index++) {
      vertex.fromBufferAttribute(position, index); bounds.expandByPoint(vertex);
    }
    return bounds.getSize(size);
  }

  function inferRole(object, home, size) {
    const explicit = object.userData?.rebuildRole;
    if (['base', 'shell', 'display', 'detail', 'cable'].includes(explicit)) return explicit;
    if (/cable|plug|strain|tube/i.test(object.name || object.geometry?.type || '')) return 'cable';
    if (home.position.y < origin.y - .44) return 'base';
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
    const home = {
      position: object.position.clone(), quaternion: object.quaternion.clone(),
      scale: object.scale.clone(), visible: object.visible
    };
    const size = dimensions(object);
    const role = inferRole(object, home, size);
    const side = Math.abs(home.position.x - origin.x) > .12
      ? Math.sign(home.position.x - origin.x) : (random() < .5 ? -1 : 1);
    const direction = home.position.clone().sub(origin);
    direction.x += side * (.5 + random());
    direction.y = Math.max(.4, direction.y + .6 + random() * .8);
    direction.z = .8 + random() * 1.3;
    direction.normalize();
    const power = role === 'detail' ? 7.2 + random() * 5.4 : 5.2 + random() * 3.6;
    const velocity = direction.multiplyScalar(power);
    velocity.y += 1.8 + random() * 2.4;
    const spinAxis = new THREE.Vector3(random() * 2 - 1, random() * 2 - 1, random() * 2 - 1).normalize();
    const spinSpeed = (4 + random() * 9) * (random() < .5 ? -1 : 1);
    const blastDelay = random() * .075;
    const vanishesAt = 1.14 + random() * .47;
    const arrival = new THREE.Vector3();
    const hinge = new THREE.Vector3();
    const pivot = new THREE.Vector3();
    let begins, span;

    if (role === 'base') {
      begins = 2.14 + random() * .18; span = .55;
      arrival.set(side * (2.9 + random() * 1.4), -.16, 1.45 + random() * .65);
      hinge.set(.15 * side, .16 * side, -.12 * side);
    } else if (role === 'shell') {
      begins = 2.64 + random() * .2; span = .89;
      const roof = size.x > size.y * 3 && size.y < .28;
      const sidePanel = size.x < .4 && size.y > .45;
      if (roof) {
        arrival.set(side * .22, 1.95 + random() * .3, -.75);
        hinge.x = -Math.PI / 2;
        pivot.z = -Math.min(.38, size.z / 2);
      } else if (sidePanel) {
        arrival.set(side * (1.75 + random() * .5), .18, -.35);
        hinge.z = side * Math.PI / 2;
        pivot.y = -Math.min(.52, size.y / 2);
      } else {
        arrival.set(side * (1.05 + random() * .5), .55, -2.3 - random() * .5);
        hinge.y = side * Math.PI / 2;
        pivot.x = side * Math.min(1.1, size.x / 2);
      }
    } else if (role === 'display') {
      begins = 3.27 + random() * .13; span = .78;
      arrival.set(side * .25, 1.65 + random() * .3, 1.7 + random() * .4);
      hinge.x = Math.PI / 2;
      pivot.y = -Math.min(.35, size.y / 2);
    } else if (role === 'cable') {
      begins = 3.02 + random() * .23; span = .68;
      arrival.set(side * 2.4, .62, -.5);
      hinge.set(.35, side * .55, -.25 * side);
    } else {
      // Ordered fastener bursts run across the face, with vents arriving as a
      // comb. They fit after the large modules, rather than decorating the blast.
      const across = clamp((home.position.x - origin.x + 2.75) / 5.5);
      begins = 4.02 + across * .3 + random() * .13; span = .38 + random() * .12;
      arrival.set(side * (.7 + random() * .8), .5 + random() * .7, 2 + random());
      hinge.set(random() * .6, random() * .5, (2 + Math.floor(random() * 3)) * Math.PI * 2);
    }
    return { object, home, role, velocity, spinAxis, spinSpeed, blastDelay, vanishesAt, arrival, hinge, pivot, begins, span };
  });

  function restore(record) {
    record.object.position.copy(record.home.position);
    record.object.quaternion.copy(record.home.quaternion);
    record.object.scale.copy(record.home.scale);
    record.object.visible = record.home.visible;
  }

  // Short accelerating travel, a final piston stroke, then a hard impact with
  // two small aftershocks. An assembly should feel heavy, not levitate gently.
  function lockProgress(value) {
    const t = clamp(value);
    if (t < .18) return .13 * Math.pow(t / .18, 2);
    if (t < .72) return .13 + .81 * (t - .18) / .54;
    if (t < .84) return .94 + .092 * smooth((t - .72) / .12);
    if (t >= 1) return 1;
    const tail = (t - .84) / .16;
    return 1 + .032 * Math.exp(-7 * tail) * Math.cos(tail * Math.PI * 3);
  }

  function finish() {
    records.forEach(restore); active = false; lastAge = duration;
  }

  function update(ageSeconds) {
    if (!active || disposed) return false;
    const age = Number.isFinite(ageSeconds) ? Math.max(0, ageSeconds) : 0;
    lastAge = age;
    if (age >= duration) { finish(); return false; }
    for (const record of records) {
      const { object, home } = record;
      if (!home.visible) { object.visible = false; continue; }
      if (age < record.vanishesAt) {
        const flight = Math.max(0, age - record.blastDelay);
        object.visible = true;
        object.position.copy(home.position).addScaledVector(record.velocity, flight);
        object.position.y -= 4.8 * flight * flight;
        offsetQuaternion.setFromAxisAngle(record.spinAxis, record.spinSpeed * flight);
        object.quaternion.copy(home.quaternion).premultiply(offsetQuaternion);
        const burn = smooth((age - record.vanishesAt + .32) / .32);
        object.scale.copy(home.scale).multiplyScalar(1 - burn * .93);
      } else if (age < record.begins) {
        object.visible = false;
      } else if (age < record.begins + record.span) {
        const t = (age - record.begins) / record.span;
        const progress = lockProgress(t);
        object.visible = true;
        object.scale.copy(home.scale);
        object.position.copy(home.position).addScaledVector(record.arrival, 1 - progress);
        euler.set(record.hinge.x * (1 - progress), record.hinge.y * (1 - progress), record.hinge.z * (1 - progress));
        offsetQuaternion.setFromEuler(euler);
        object.quaternion.copy(home.quaternion).multiply(offsetQuaternion);
        // Swing a shell/display around its real attachment edge while the
        // carriage moves inward; local pivots collapse exactly to zero at home.
        rotatedPivot.copy(record.pivot).applyQuaternion(offsetQuaternion);
        hingeOffset.copy(record.pivot).sub(rotatedPivot).multiply(home.scale).applyQuaternion(home.quaternion);
        object.position.add(hingeOffset);
      } else restore(record);
    }
    return true;
  }

  return {
    start() {
      if (disposed) return;
      finish(); active = records.some(record => record.home.visible); lastAge = active ? 0 : duration;
    },
    update,
    finish,
    dispose() { finish(); disposed = true; records.length = 0; seen.clear(); },
    get screenReady() { return !active || lastAge >= 4.5; }
  };
}
