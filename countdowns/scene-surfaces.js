// Physical ink mirrors the authoritative clock; it never owns a deadline.
import { reelPlan, reelPosition } from './reels.js';

export function projectSurface(host, mesh) {
  const T = host.THREE, camera = host.camera, canvas = host.canvas;
  if (!mesh?.geometry || !camera) return null;
  mesh.updateWorldMatrix(true, false); camera.updateMatrixWorld();
  if (!mesh.geometry.boundingBox) mesh.geometry.computeBoundingBox();
  const box = mesh.geometry.boundingBox, viewport = canvas.getBoundingClientRect();
  // Read the authored UV corners. Exported planes may be baked into XY, XZ,
  // or an oblique mesh, and curled prints must travel with their actual edges.
  const uv = mesh.geometry.attributes.uv, vertices = mesh.geometry.attributes.position;
  let localCorners;
  if (uv && vertices) {
    localCorners = [[0, 1], [1, 1], [1, 0], [0, 0]].map(([u, v]) => {
      let selected = 0, distance = Infinity;
      for (let index = 0; index < uv.count; index++) {
        const score = (uv.getX(index) - u) ** 2 + (uv.getY(index) - v) ** 2;
        if (score < distance) {distance = score; selected = index;}
      }
      return new T.Vector3().fromBufferAttribute(vertices, selected);
    });
  } else {
    const sizes = ['x', 'y', 'z'].map(axis => ({axis, size: box.max[axis] - box.min[axis]})).sort((a, b) => b.size - a.size);
    const [horizontal, vertical] = sizes.map(item => item.axis);
    localCorners = [[0, 1], [1, 1], [1, 0], [0, 0]].map(([u, v]) => {
      const point = box.getCenter(new T.Vector3());
      point[horizontal] = u ? box.max[horizontal] : box.min[horizontal];
      point[vertical] = v ? box.max[vertical] : box.min[vertical]; return point;
    });
  }
  const points = localCorners.map(point => point.applyMatrix4(mesh.matrixWorld).project(camera));
  if (points.some(p => !Number.isFinite(p.x) || !Number.isFinite(p.y) || !Number.isFinite(p.z) || p.z < -1 || p.z > 1)) return null;
  const corners = points.map(p => ({x: viewport.left + (p.x + 1) * viewport.width / 2, y: viewport.top + (1 - p.y) * viewport.height / 2}));
  const left = Math.min(...corners.map(p => p.x)), top = Math.min(...corners.map(p => p.y));
  const width = Math.max(...corners.map(p => p.x)) - left, height = Math.max(...corners.map(p => p.y)) - top;
  return width > 1 && height > 1 ? {left, top, width, height, corners} : null;
}

export function createInkFace(host, surface, {
  ink = '#24221e', font = '400 310px "Cormorant Garamond", Georgia, serif',
  width = 512, height = 448, background = null, baseline = .53,
  roughness = .86, opacity = 1, paintGlyph = null
} = {}) {
  const T = host.THREE, canvas = document.createElement('canvas');
  canvas.width = width; canvas.height = height;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('The ink surface could not be created');
  const texture = host.own(new T.CanvasTexture(canvas));
  texture.colorSpace = T.SRGBColorSpace; texture.flipY = false;
  texture.anisotropy = Math.min(4, host.renderer.capabilities.getMaxAnisotropy());
  const original = surface.material;
  host.own(original);
  const material = host.own(new T.MeshStandardMaterial({
    map: texture, transparent: !background || opacity < 1, opacity,
    roughness, metalness: 0, side: T.DoubleSide, depthWrite: !!background,
    polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1
  }));
  surface.material = material;
  let value, plans = [], start = 0, queued = null;
  function draw(time) {
    context.clearRect(0, 0, width, height);
    if (background) {context.fillStyle = background; context.fillRect(0, 0, width, height);}
    context.fillStyle = ink; context.font = font;
    context.textAlign = 'center'; context.textBaseline = 'middle';
    const columns = Math.max(1, value?.length || 1), cellWidth = width / columns;
    for (let i = 0; i < columns; i++) {
      context.save(); context.beginPath(); context.rect(i * cellWidth, 0, cellWidth, height); context.clip();
      const plan = plans[i], position = plan ? reelPosition(plan, (time - start) * 1000) : 0;
      const cells = plan?.cells || [value?.[i] || ''], row = Math.floor(position);
      for (let n = Math.max(0, row); n <= Math.min(cells.length - 1, row + 1); n++) {
        const x = (i + .5) * cellWidth, y = height * baseline + (n - position) * height;
        if (paintGlyph) paintGlyph(context, cells[n], {x, y, width: cellWidth * .93, height: height * .88});
        else context.fillText(cells[n], x, y, cellWidth * .93);
      }
      context.restore();
    }
    texture.needsUpdate = true;
  }
  function set(next, time = performance.now() / 1000, {spin = false, offset = 0, immediate = false} = {}) {
    next = String(next);
    if (plans.some(Boolean) && !spin && !immediate && !host.reduced) {queued = next; return;}
    if (next === value && !spin && !immediate) return;
    const old = value?.slice(-next.length).padStart(next.length, '0');
    value = next; start = time; queued = null;
    plans = [...next].map((digit, i) => old && /\d/.test(digit) && /\d/.test(old[i]) && !host.reduced && !immediate && (spin || old[i] !== digit)
      ? reelPlan(old[i], digit, {spin, direction: spin ? 1 : -1, index: offset + i}) : null);
    draw(time); host.wake();
  }
  function update(time) {
    if (!plans.some(Boolean)) return false;
    if (host.reduced || (time - start) * 1000 >= Math.max(...plans.filter(Boolean).map(p => p.duration + p.delay))) {
      plans = []; draw(time);
      if (queued !== null) set(queued, time);
    } else {draw(time); host.wake();}
    return plans.some(Boolean);
  }
  return {canvas, texture, material, surface, set, update, get value(){return value;},
    dispose(){if (surface.material === material) surface.material = original;}};
}

export function createNumerals(host, {surfaces = [], tally, ...appearance} = {}) {
  const faces = surfaces.map(surface => Array.isArray(surface)
    ? surface.map(mesh => createInkFace(host, mesh, appearance))
    : [createInkFace(host, surface, appearance)]);
  const count = tally ? createInkFace(host, tally, {...appearance, font: appearance.tallyFont || '400 110px "IBM Plex Mono", monospace', width: 640, height: 160}) : null;
  let spinNext = false;
  return {
    faces, tally: count,
    update(time = performance.now() / 1000) {
      const digits = host.getDigits().map(v => String(v).padStart(2, '0'));
      faces.forEach((pair, unit) => pair.forEach((face, column) => face.set(pair.length === 1 ? digits[unit] : digits[unit][column], time, {spin: spinNext, offset: unit * 2 + column})));
      count?.set(host.getTally(), time, {spin: spinNext, offset: 8});
      spinNext = false; faces.flat().forEach(face => face.update(time)); count?.update(time);
    },
    spin(){spinNext = true; host.wake();},
    dispose(){faces.flat().forEach(face => face.dispose()); count?.dispose();}
  };
}

export async function loadSurfaceTexture(host, url, {flipY = false, colorSpace = 'srgb'} = {}) {
  // Explicit decoding keeps untextured opening frames out of a promoted scene.
  const image = new Image(); image.decoding = 'async'; image.src = url;
  await image.decode();
  if (host.disposed) throw new Error('Scene disposed during image decoding');
  const texture = host.own(new host.THREE.Texture(image));
  texture.flipY = flipY;
  texture.colorSpace = colorSpace === 'srgb' ? host.THREE.SRGBColorSpace : host.THREE.NoColorSpace;
  texture.anisotropy = Math.min(4, host.renderer.capabilities.getMaxAnisotropy()); texture.needsUpdate = true;
  return texture;
}
