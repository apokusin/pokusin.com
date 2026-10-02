// Seven authored exhibits, a clock gate and one postponement machine.
// Static masonry is merged by material; the screens and working parts stay independent.
export function createFairArchitecture(ctx, world, options) {
  const T = ctx.THREE;
  const { materials, exhibitPositions, showData, preview, namePlate, roofFlag, contact } = options;
  const cream = materials.limestone || materials.stone || materials.cream;
  const plaster = materials.plaster || materials.cream;
  const jade = materials.jade;
  const coral = materials.terracotta || materials.coral;
  const canvasCream = materials.canvasCream || plaster;
  const canvasJade = materials.canvasJade || jade;
  const canvasCoral = materials.canvasCoral || materials.coral;
  // Roof fabric is a thin shell with a visible underside when visitors approach.
  for (const material of [canvasCream, canvasJade, canvasCoral]) material.side = T.DoubleSide;
  const ink = materials.darkMetal || materials.ink;
  const brass = materials.brass || materials.cream;
  const crevice = materials.crevice || materials.ink;
  const statics = [];
  const mechanisms = [];
  const group = (x = 0, y = 0, z = 0, parent = world) => {
    const object = new T.Group(); object.position.set(x, y, z); parent.add(object); return object;
  };
  function mesh(geometry, material, x, y, z, parent = world, staticPart = true) {
    const object = new T.Mesh(geometry, material); object.position.set(x, y, z);
    object.castShadow = true; object.receiveShadow = true; parent.add(object);
    if (staticPart) statics.push(object);
    return object;
  }
  function roundedRectangle(w, h, r = .045) {
    r = Math.min(r, w / 3, h / 3);
    const shape = new T.Shape(), left = -w / 2, right = w / 2, bottom = -h / 2, top = h / 2;
    shape.moveTo(left + r, bottom); shape.lineTo(right - r, bottom);
    shape.quadraticCurveTo(right, bottom, right, bottom + r); shape.lineTo(right, top - r);
    shape.quadraticCurveTo(right, top, right - r, top); shape.lineTo(left + r, top);
    shape.quadraticCurveTo(left, top, left, top - r); shape.lineTo(left, bottom + r);
    shape.quadraticCurveTo(left, bottom, left + r, bottom); shape.closePath(); return shape;
  }
  function block(w, h, d, material, x, y, z, parent = world, bevel = .025, staticPart = true) {
    const geometry = new T.ExtrudeGeometry(roundedRectangle(w - bevel * 2, h - bevel * 2), {
      depth: Math.max(.002, d - bevel * 2), bevelEnabled: bevel > 0, bevelThickness: bevel,
      bevelSize: bevel, bevelSegments: 2, steps: 1, curveSegments: 3
    });
    geometry.translate(0, 0, -d / 2 + bevel);
    return mesh(geometry, material, x, y, z, parent, staticPart);
  }
  function cylinder(rt, rb, height, material, x, y, z, parent = world, segments = 24, staticPart = true) {
    return mesh(new T.CylinderGeometry(rt, rb, height, segments), material, x, y, z, parent, staticPart);
  }
  function sphere(radius, material, x, y, z, parent = world) {
    return mesh(new T.SphereGeometry(radius, 16, 10), material, x, y, z, parent);
  }
  function arch(width, stem, thickness, depth, material, x, y, z, parent = world, staticPart = true) {
    const r = width / 2, inner = r - thickness, shape = new T.Shape();
    shape.moveTo(-r, 0); shape.lineTo(-r, stem);
    shape.absarc(0, stem, r, Math.PI, 0, true); shape.lineTo(r, 0);
    shape.lineTo(inner, 0); shape.lineTo(inner, stem);
    shape.absarc(0, stem, inner, 0, Math.PI, false); shape.lineTo(-inner, 0); shape.closePath();
    const geometry = new T.ExtrudeGeometry(shape, { depth, bevelEnabled: true,
      bevelSize: .025, bevelThickness: .025, bevelSegments: 2, curveSegments: 16, steps: 1 });
    geometry.translate(0, 0, -depth / 2);
    return mesh(geometry, material, x, y, z, parent, staticPart);
  }
  function polygon(points, depth, material, x, y, z, parent = world) {
    const shape = new T.Shape(points.map(([px, py]) => new T.Vector2(px, py)));
    const geometry = new T.ExtrudeGeometry(shape, { depth, bevelEnabled: true,
      bevelSize: .018, bevelThickness: .018, bevelSegments: 1, curveSegments: 1, steps: 1 });
    geometry.translate(0, 0, -depth / 2); return mesh(geometry, material, x, y, z, parent);
  }
  function plinth(x, z, width = 4.15, depth = 2.25) {
    block(width, .16, depth, jade, x, .13, z, world, .035);
    block(width - .15, .08, depth - .12, cream, x, .24, z, world, .025);
    // Shallow approach terraces finish before the flat, traversable promenade.
    for (let i = 0; i < 3; i++) block(1.8, .06, .21, jade,
      x, .07 + i * .052, z + 1.18 - i * .17, world, .015);
    contact?.(x, z, width + 1.1, depth + .9);
  }
  function screenFrame(info, slug, x, y, z, width, parent = world, tilt = 0, material = cream) {
    const hinge = preview(info, slug, x, y, z, width, parent, tilt);
    // The archival image is a recess in a substantial object, never a floating UI card.
    const surround = group(0, 0, -.055, hinge);
    block(width + .24, width * .64 + .24, .10, material, 0, 0, -.05, surround);
    block(width + .17, width * .64 + .17, .105, crevice, 0, 0, .005, surround);
    // Only the rear construction batches: the leaf and its frame move together on approach.
    for (const child of [...surround.children]) {
      const index = statics.indexOf(child); if (index >= 0) statics.splice(index, 1);
    }
    return hinge;
  }
  function lectern(info, slug, x, y, z, width, material = cream, tilt = -.10, parent = world) {
    block(.38, Math.max(.15, y - .32), .35, material, x, (y - .32) / 2 + .24, z - .32, parent);
    block(.66, .09, .60, material, x, .3, z - .24, parent);
    block(width + .20, .10, .29, material, x, y - width * .32 - .15, z - .15, parent);
    return screenFrame(info, slug, x, y, z, width, parent, tilt, material);
  }
  function cornice(x, y, z, width, depth, material = cream) {
    block(width, .065, depth, crevice, x, y - .055, z, world, .014);
    block(width + .10, .12, depth + .08, material, x, y + .024, z, world, .025);
  }
  function plaque(text, x, y, z, width = 2.2) {
    namePlate?.(text, x, y, z, width);
  }
  function canopy(x, z, bottom, peak, rx, rz, first, second, sections = 12) {
    // Radial textile strips have a bowed profile, sewn hems and modeled scalloped eaves.
    const apex = peak, eave = bottom;
    for (let n = 0; n < sections; n++) {
      const a = n / sections * Math.PI * 2, b = (n + 1) / sections * Math.PI * 2;
      const positions = [], uv = [];
      for (let ring = 0; ring < 4; ring++) {
        const p = ring / 3, r = .025 + .975 * p, y = apex - (apex - eave) * Math.pow(p, .64);
        for (const angle of [a, b]) { positions.push(Math.cos(angle) * rx * r, y, Math.sin(angle) * rz * r); uv.push((angle - a) / (b - a), p); }
      }
      const indices = [];
      for (let r = 0; r < 3; r++) indices.push(r * 2, r * 2 + 1, r * 2 + 2, r * 2 + 1, r * 2 + 3, r * 2 + 2);
      const geometry = new T.BufferGeometry(); geometry.setAttribute('position', new T.Float32BufferAttribute(positions, 3));
      geometry.setAttribute('uv', new T.Float32BufferAttribute(uv, 2)); geometry.setIndex(indices); geometry.computeVertexNormals();
      mesh(geometry, n % 2 ? second : first, x, 0, z);
      const mid = (a + b) / 2, segmentWidth = Math.hypot(rx * Math.sin(mid), rz * Math.cos(mid)) * Math.PI * 2 / sections;
      const scallop = new T.Shape(); scallop.moveTo(-segmentWidth / 2, 0); scallop.lineTo(segmentWidth / 2, 0);
      scallop.quadraticCurveTo(segmentWidth / 2, -.22, 0, -.25); scallop.quadraticCurveTo(-segmentWidth / 2, -.22, -segmentWidth / 2, 0);
      const valance = mesh(new T.ExtrudeGeometry(scallop, { depth: .025, bevelEnabled: false, curveSegments: 6 }),
        n % 2 ? second : first, x + Math.cos(mid) * rx, eave + .01, z + Math.sin(mid) * rz);
      valance.rotation.y = Math.PI / 2 - mid;
      // The seam follows the sagging textile profile rather than floating as a straight rib.
      const points = Array.from({ length: 7 }, (_, i) => {
        const p = i / 6, r = .025 + .975 * p;
        return new T.Vector3(Math.cos(a) * rx * r, apex - (apex - eave) * Math.pow(p, .64), Math.sin(a) * rz * r);
      });
      mesh(new T.TubeGeometry(new T.CatmullRomCurve3(points), 12, .009, 4, false), cream, x, 0, z);
    }
  }

  let carousel = null, carouselHit = null;
  for (const show of showData) {
    const [x, z] = exhibitPositions[show.slug]; const cards = show.cards;
    plinth(x, z);
    if (show.slug === 'got') {
      // A compressed, striped carousel hall: three real reading leaves under one sewn roof.
      for (const dx of [-1.82, 1.82]) {
        cylinder(.105, .13, 2.12, cream, x + dx, 1.34, z + .33);
        cylinder(.15, .15, .09, brass, x + dx, .36, z + .33);
        block(.33, .13, .34, cream, x + dx, 2.38, z + .33);
      }
      block(3.85, .16, .18, jade, x, 2.38, z + .37);
      canopy(x, z - .08, 2.53, 3.64, 2.06, .96, canvasCream, canvasJade, 12);
      cylinder(.10, .17, .35, jade, x, 3.76, z - .08);
      sphere(.16, materials.coral, x, 4.0, z - .08);
      // One principal exhibit and two folded reading leaves give the hall a hierarchy.
      const middle = Math.floor(cards.length / 2);
      cards.forEach((info, i) => {
        const primary = i === middle, offset = cards.length === 3 ? (i - middle) * 1.34 : (i - (cards.length - 1) / 2) * 1.22;
        const hinge = lectern(info, show.slug, x + offset, primary ? 1.34 : 1.23, z + .58,
          primary ? 1.48 : .79, cream, 0);
        if (!primary) hinge.rotation.y = i < middle ? .14 : -.14;
      });
      plaque(show.name, x, 2.38, z + .475, 2.6);
    } else if (show.slug === 'dexter') {
      // Offset tiled masses wrap a coral court; dark grout belongs to masonry, not UI.
      block(3.94, 2.25, .20, coral, x, 1.40, z - .72);
      block(1.25, .36, .24, coral, x - 1.31, 2.69, z - .71);
      for (let row = 0; row < 6; row++) for (let col = 0; col < 10; col++) {
        block(.378, .345, .026, coral, x - 1.76 + col * .391, .44 + row * .358, z - .604, world, .006);
      }
      for (const dx of [-1.93, 1.93]) {
        block(.22, .88, 1.18, coral, x + dx, .71, z - .21);
        cornice(x + dx, 1.17, z - .21, .24, 1.26, cream);
      }
      block(3.51, .09, .24, jade, x, .95, z + .64);
      for (const dx of [-1.56, 1.56]) cylinder(.065, .075, .71, brass, x + dx, .61, z + .64);
      cards.forEach((info, i) => {
        const dx = (i - (cards.length - 1) / 2) * (cards.length > 2 ? 1.20 : 1.76);
        const width = cards.length > 2 ? .95 : 1.42;
        // Wide embrasures sit inside the court wall, their stone reveals holding the images.
        block(width + .32, width * .64 + .32, .14, crevice, x + dx, 1.47, z - .51, world, .025);
        const screen = screenFrame(info, show.slug, x + dx, 1.47, z - .34, width, world, 0, coral);
        block(width + .37, .08, .30, cream, x + dx, 1.47 - width * .32 - .17, z - .35);
        screen.userData.recessed = true;
      });
      plaque(show.name, x, 2.38, z - .52, 1.5);
      // Timeline notches are the court's continuous physical rail, without invented labels.
      for (let n = 0; n < 12; n++) block(.018, .06, .026, brass, x - 1.53 + n * .278, 1.014, z + .773, world, .003);
    } else if (show.slug === 'sherlock') {
      // Two cylindrical alcoves have real arched voids, shadowed soffits and reading desks.
      for (const dx of [-1.02, 1.02]) {
        const tower = cylinder(.81, .81, 2.25, jade, x + dx, 1.40, z - .20); tower.scale.z = .77;
        cylinder(.82, .82, .11, cream, x + dx, 2.57, z - .20).scale.z = .77;
        cylinder(.85, .85, .09, jade, x + dx, 2.68, z - .20).scale.z = .77;
        arch(1.48, .95, .15, .18, cream, x + dx, .3, z + .49);
        block(.95, 1.26, .065, crevice, x + dx, 1.13, z + .43);
        const insetArch = arch(1.22, .99, .085, .075, plaster, x + dx, .31, z + .58); insetArch.scale.y = .98;
      }
      cards.forEach((info, i) => lectern(info, show.slug, x + (i ? 1.02 : -1.02), 1.28, z + .73, 1.19, cream, -.12));
      block(3.64, .17, .16, cream, x, 2.65, z + .30);
      plaque(show.name, x, 2.65, z + .393, 1.74);
    } else if (show.slug === 'archer') {
      // A coral circus canopy shelters an intentionally rotating, supported easel.
      for (const dx of [-1.70, 1.70]) cylinder(.075, .10, 2.40, cream, x + dx, 1.51, z + .55);
      for (const dx of [-1.40, 1.40]) cylinder(.075, .10, 2.40, jade, x + dx, 1.51, z - .73);
      canopy(x, z - .16, 2.76, 3.83, 2.01, .99, canvasCream, canvasCoral, 8);
      sphere(.15, materials.coral, x, 4.02, z - .16);
      carousel = group(x, .31, z + .13);
      cylinder(.73, .76, .12, jade, 0, .01, 0, carousel, 24, false);
      carouselHit = cylinder(.19, .23, .19, materials.coral, 0, .30, .57, carousel, 20, false);
      carouselHit.userData.carousel = true;
      block(.13, 1.10, .16, brass, 0, .68, 0, carousel, .02, false);
      for (const [i, info] of cards.entries()) screenFrame(info, show.slug, 0, 1.25 + i * .03, .36, 1.69, carousel, -.06, cream);
      plaque(show.name, x, 2.64, z + .878, 1.58);
      mechanisms.push({ slug: show.slug, object: carousel, kind: 'carousel' });
    } else if (show.slug === 'breaking-bad') {
      // A folded limestone shell; alternating facets catch the key rather than merely changing color.
      polygon([[-2, 0], [-1.35, .0], [-1.03, 1.72], [-.72, 2.87], [-1.96, 2.57]], .47, cream, x, .29, z - .37);
      polygon([[.72, 2.87], [1.03, 1.72], [1.35, 0], [2, 0], [1.96, 2.57]], .47, plaster, x, .29, z - .37);
      polygon([[-1.96, 2.57], [-.72, 2.87], [0, 3.16], [1.96, 2.57], [.89, 2.36], [-.70, 2.45]], .58, cream, x, .29, z - .40);
      polygon([[-1.96, 2.57], [-.72, 2.87], [-.70, 2.45], [-1.37, 1.92]], .08, plaster, x, .29, z + .01);
      for (const dx of [-.83, .83]) block(.58, .07, .62, jade, x + dx, .33, z + .51);
      cards.forEach((info, i) => lectern(info, show.slug, x + (i ? .86 : -.86), 1.49, z + .59, 1.40, cream, -.06));
      plaque(show.name, x, 2.95, z - .079, 2.3);
    } else if (show.slug === 'house-of-cards') {
      // An oval colonnade, a round light well and a single large front exhibit.
      const base = cylinder(1.96, 1.96, .16, jade, x, .37, z - .09); base.scale.z = .53;
      for (let i = 0; i < 7; i++) {
        const theta = Math.PI + i / 6 * Math.PI;
        cylinder(.15, .18, 1.52, cream, x + Math.cos(theta) * 1.74, 1.19, z - .09 + Math.sin(theta) * .81);
      }
      const roof = cylinder(1.95, 1.95, .19, cream, x, 2.05, z - .09); roof.scale.z = .53;
      const roofShade = cylinder(1.84, 1.84, .04, crevice, x, 1.93, z - .09); roofShade.scale.z = .51;
      for (const dx of [-1.51, 1.51]) arch(.77, .74, .12, .18, cream, x + dx, .44, z + .40);
      const rim = cylinder(.70, .74, .13, jade, x - .88, 2.23, z - .18); rim.scale.z = .80;
      sphere(.32, jade, x - .88, 2.57, z - .18);
      cards.forEach(info => lectern(info, show.slug, x + .27, 1.25, z + .66, 1.63, cream, 0));
      block(2.87, .17, .10, cream, x + .22, 2.05, z + .84);
      plaque(show.name, x + .22, 2.05, z + .898, 2.16);
    } else {
      // A severely faceted office arcade with terminals sunk between thick jade fins.
      polygon([[-2.03, 0], [-1.57, 0], [-1.32, 2.18], [-1.63, 3.19], [-2.03, 2.75]], .70, cream, x, .27, z - .18);
      polygon([[1.32, 2.18], [1.57, 0], [2.03, 0], [2.03, 2.75], [1.63, 3.19]], .70, plaster, x, .27, z - .18);
      polygon([[-1.63, 3.19], [0, 3.52], [1.63, 3.19], [1.32, 2.18], [.0, 2.67], [-1.32, 2.18]], .80, cream, x, .27, z - .30);
      block(3.08, 2.1, .13, jade, x, 1.39, z - .64);
      for (const dx of [-1.53, 0, 1.53]) block(.13, 2.04, .49, jade, x + dx, 1.40, z + .22);
      block(3.22, .15, .66, jade, x, 2.45, z + .22);
      cards.forEach((info, i) => {
        const dx = i ? .79 : -.79;
        block(1.37, .34, .69, cream, x + dx, .44, z + .21);
        screenFrame(info, show.slug, x + dx, 1.41, z + .51, 1.27, world, 0, jade);
      });
      plaque(show.name, x, 2.45, z + .563, 2.05);
    }
    roofFlag?.(x + 1.58, show.slug === 'got' || show.slug === 'archer' ? 2.90 : 2.70, z - .37);
  }

  // The landmark is a manufactured clock, supported by a thick arched architectural gate.
  for (const x of [-2.51, 2.51]) {
    block(.45, 2.56, .64, jade, x, 1.53, 0, world, .06);
    block(.88, .18, .98, jade, x, .20, 0, world, .045);
    block(.69, .12, .83, cream, x, .34, 0, world, .035);
    block(.57, .08, .75, crevice, x, 2.77, 0, world, .012);
    sphere(.35, cream, x, 2.98, .0);
    contact?.(x, 0, 1.28, 1.45);
  }
  arch(5.4, 0, .38, .51, jade, 0, 2.69, -.10);
  // Keep this shallow applied trim independent: merging it into stone would restore casting.
  const insetBand = arch(5.15, 0, .045, .038, cream, 0, 2.69, .188, world, false); insetBand.castShadow = false;
  block(4.84, .20, .56, jade, 0, 3.87, .035, world, .045);
  for (const x of [-2.08, 2.08]) sphere(.15, brass, x, 3.87, .31);
  const lowerArch = arch(4.63, 0, .36, .47, cream, 0, .29, -.08); lowerArch.scale.y = .61;
  const lowerInset = arch(4.44, 0, .045, .04, crevice, 0, .30, .171); lowerInset.scale.y = .61;
  for (const x of [-2.38, 2.38]) {
    sphere(.37, cream, x, .72, .33);
    cylinder(.30, .32, .12, jade, x, .35, .33);
  }
  const digitSurfaces = [], unitSurfaces = [], drums = [];
  for (let i = 0; i < 4; i++) {
    const x = (i - 1.5) * 1.17;
    const drum = cylinder(.67, .67, 1.065, ink, x, 3.15, .03, world, 32, false); drum.rotation.z = Math.PI / 2;
    drums.push(drum);
    for (const dx of [-.54, .54]) {
      const rim = mesh(new T.TorusGeometry(.674, .026, 8, 32), brass, x + dx, 3.15, .03);
      rim.rotation.y = Math.PI / 2;
    }
    // Reels are live textures supplied by the shared timer; these contain no invented values.
    const faceMaterial = new T.MeshBasicMaterial({ color: 0xffffff, transparent: true, toneMapped: false });
    const face = mesh(new T.PlaneGeometry(.92, .80), faceMaterial, x, 3.26, .712, world, false);
    face.castShadow = false; digitSurfaces.push(face);
    const unit = mesh(new T.PlaneGeometry(.64, .23), faceMaterial.clone(), x, 2.785, .638, world, false);
    unit.castShadow = false; unitSurfaces.push(unit);
  }
  const clockAnchor = new T.Object3D(); clockAnchor.position.set(0, 3.15, .72); world.add(clockAnchor);
  for (const x of [-2.12, 2.12]) {
    cylinder(.030, .030, .80, brass, x, 4.42, -.04);
    sphere(.070, materials.coral, x, 4.86, -.04);
    roofFlag?.(x, 4.54, -.04);
  }

  const plunger = group(1.25, 0, 2.1);
  contact?.(1.25, 2.1, 1.85, 1.9);
  cylinder(.77, .80, .12, materials.coral, 0, .16, 0, plunger, 32);
  cylinder(.68, .73, .12, cream, 0, .28, 0, plunger, 32);
  cylinder(.65, .66, .80, cream, 0, .72, 0, plunger, 32);
  cylinder(.66, .66, .05, brass, 0, 1.135, 0, plunger, 32);
  const cap = group(0, 1.22, 0, plunger);
  cylinder(.19, .19, .32, materials.coral, 0, -.055, 0, cap, 24, false);
  const buttonHit = cylinder(.61, .64, .14, materials.coral, 0, .15, 0, cap, 32, false);
  cylinder(.58, .61, .04, materials.coral, 0, .24, 0, cap, 32, false);
  const labelMaterial = new T.MeshBasicMaterial({ color: 0xffffff, transparent: true, toneMapped: false });
  const labelSurface = mesh(new T.PlaneGeometry(.98, .37), labelMaterial, 0, .75, .658, plunger, false); labelSurface.castShadow = false;
  const numberSurface = mesh(new T.PlaneGeometry(.73, .24), labelMaterial.clone(), 0, .46, .668, plunger, false); numberSurface.castShadow = false;
  const plungerAnchor = new T.Object3D(); plungerAnchor.position.set(0, .16, .47); cap.add(plungerAnchor);
  const tallyAnchor = new T.Object3D(); tallyAnchor.position.set(0, .47, .67); plunger.add(tallyAnchor);

  // Flatten only construction. Hinged archival leaves, labels, the plunger and clock reels remain real meshes.
  // This keeps the visible craft detail under control without a build step or a geometry utility dependency.
  world.updateMatrixWorld(true);
  const inverse = world.matrixWorld.clone().invert(), byMaterial = new Map(), originalGeometries = new Set();
  for (const object of statics) {
    const source = object.geometry.index ? object.geometry.toNonIndexed() : object.geometry.clone();
    source.applyMatrix4(new T.Matrix4().multiplyMatrices(inverse, object.matrixWorld));
    if (!byMaterial.has(object.material)) byMaterial.set(object.material, []);
    byMaterial.get(object.material).push(source); originalGeometries.add(object.geometry); object.removeFromParent();
  }
  const merged = [];
  for (const [material, sources] of byMaterial) {
    const length = sources.reduce((n, geometry) => n + geometry.attributes.position.count, 0);
    const positions = new Float32Array(length * 3), normals = new Float32Array(length * 3), uvs = new Float32Array(length * 2);
    let cursor = 0;
    for (const geometry of sources) {
      const { position, normal, uv } = geometry.attributes;
      positions.set(position.array, cursor * 3); if (normal) normals.set(normal.array, cursor * 3);
      if (uv) uvs.set(uv.array, cursor * 2); cursor += position.count; geometry.dispose();
    }
    const geometry = new T.BufferGeometry(); geometry.setAttribute('position', new T.BufferAttribute(positions, 3));
    geometry.setAttribute('normal', new T.BufferAttribute(normals, 3)); geometry.setAttribute('uv', new T.BufferAttribute(uvs, 2));
    geometry.computeBoundingSphere(); geometry.computeBoundingBox();
    const object = mesh(geometry, material, 0, 0, 0, world, false); object.name = 'Authored fair construction'; merged.push(object);
  }
  for (const geometry of originalGeometries) geometry.dispose();
  return {
    clock: { anchor: clockAnchor, drums, digitSurfaces, unitSurfaces },
    reset: { group: plunger, cap, buttonHit, labelSurface, numberSurface, anchor: plungerAnchor, tallyAnchor, restY: 1.22 },
    carousel, carouselHit, mechanisms, merged,
    statistics: { constructionDrawCalls: merged.length, constructionTriangles: merged.reduce((n, item) => n + item.geometry.attributes.position.count / 3, 0) }
  };
}
