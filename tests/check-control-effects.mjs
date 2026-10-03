// Run with Node 22+: node tests/check-control-effects.mjs
// Uses the actual effect modules and vendored Three; no DOM or WebGL mock.
import assert from 'node:assert/strict';
import * as THREE from '../countdowns/assets/vendor/three.module.min.js';
import { createClockTransformation } from '../countdowns/control-transformation.js';
import { createControlExplosion } from '../countdowns/control-explosion.js';

const pose = object => ({
  position: object.position.toArray(), quaternion: object.quaternion.toArray(),
  scale: object.scale.toArray(), visible: object.visible
});
const finite = (values, label) => assert(values.every(Number.isFinite), `${label} must stay finite`);
const roles = ['base', 'shell', 'display', 'detail', 'cable'];
const geometry = new THREE.BoxGeometry(1.2, .4, .2);
const material = new THREE.MeshStandardMaterial({ color: 0x617063 });
let sourceGeometryDisposals = 0, sourceMaterialDisposals = 0;
geometry.addEventListener('dispose', () => sourceGeometryDisposals++);
material.addEventListener('dispose', () => sourceMaterialDisposals++);
const parts = roles.map((role, index) => {
  const part = new THREE.Mesh(geometry, material);
  part.position.set(index - 2, .2 + index * .13, .12 + index * .01);
  part.rotation.set(.12 * index, .05 * index, -.03 * index);
  part.scale.set(1.25, .8, 1.5);
  part.userData.rebuildRole = role;
  return part;
});
const hidden = new THREE.Mesh(geometry, material);
hidden.position.set(1, 2, 3); hidden.rotation.set(.2, .4, .6);
hidden.scale.set(.6, 1.4, .9); hidden.visible = false; parts.push(hidden);
const scene = new THREE.Scene();
const sourceClock = new THREE.Group(); parts.forEach(part => sourceClock.add(part)); scene.add(sourceClock);
const homes = parts.map(pose);
const originalClockChildren = new Set(sourceClock.children);
const mechanical = createClockTransformation({ THREE, parts: [...parts, parts[0]], center: new THREE.Vector3(0, .79, 0) });
const seedGroups = sourceClock.children.filter(child => !originalClockChildren.has(child));
assert.equal(seedGroups.length, 1, 'Replacement seed must belong to the source clock assembly');
const seedResources = new Map();
seedGroups[0].traverse(object => {
  for (const resource of [object.geometry, ...(Array.isArray(object.material) ? object.material : [object.material])]) {
    if (!resource?.dispose || seedResources.has(resource)) continue;
    seedResources.set(resource, 0);
    resource.addEventListener('dispose', () => seedResources.set(resource, seedResources.get(resource) + 1));
  }
});
assert(!seedResources.has(geometry) && !seedResources.has(material), 'Seed must own its surfaces without taking ownership of source resources');
const checkHomes = () => {
  assert.deepEqual(parts.map(pose), homes, 'Every source pose and visibility must be restored exactly');
  for (const part of parts) {
    assert.equal(part.geometry, geometry); assert.equal(part.material, material);
  }
  assert.equal(sourceGeometryDisposals, 0); assert.equal(sourceMaterialDisposals, 0);
};
assert.equal(mechanical.screenReady, true);
mechanical.start(); assert.equal(mechanical.screenReady, false);
assert.equal(mechanical.update(.4), true);
assert.notDeepEqual(parts[0].position.toArray(), homes[0].position, 'Blast must move source hardware');
assert.equal(hidden.visible, false, 'An originally hidden part must never be exposed');
const firstFlight = parts.map(pose);
mechanical.update(2); assert(parts.every(part => !part.visible), 'Destroyed clock stays absent before replacement growth');
mechanical.update(2.3);
assert.equal(seedGroups[0].visible, true, 'Cube must be visible before the clock grows');
assert(parts.every(part => !part.visible), 'Cube reveal must precede source hardware assembly');
mechanical.update(3); assert.equal(parts[0].visible, true); assert.equal(parts[2].visible, false);
mechanical.update(4.49); assert.equal(mechanical.screenReady, false);
mechanical.update(4.5); assert.equal(mechanical.screenReady, true);
assert.equal(mechanical.update(5.8), false); checkHomes();
mechanical.start(); mechanical.update(.4); assert.deepEqual(parts.map(pose), firstFlight, 'Repeated blast must be deterministic');
mechanical.start();
const replacementCenter = new THREE.Vector3(0, .79, 0);
const replacementReach = Math.max(...homes.filter(home => home.visible).map(home => new THREE.Vector3(...home.position).distanceTo(replacementCenter))) + .9;
for (let step = 0; step < 116; step++) {
  const age = step * .05;
  mechanical.update(age); sourceClock.updateMatrixWorld(true);
  sourceClock.traverse(object => {
    finite([...object.position.toArray(), ...object.quaternion.toArray(), ...object.scale.toArray()], 'Growing machine pose');
    finite(object.matrixWorld.elements, 'Growing machine matrix');
  });
  if (age >= 2.1) for (const part of parts.filter(part => part.visible)) {
    assert(part.position.distanceTo(replacementCenter) <= replacementReach, 'Rebuilding parts must remain in the growing machine footprint');
  }
}
mechanical.finish(); checkHomes();
mechanical.start(); mechanical.update(3.4); mechanical.finish(); checkHomes();
assert.equal(seedGroups[0].visible, false, 'Interrupted growth must remove the replacement cube');
mechanical.start(); mechanical.update(4); mechanical.dispose(); checkHomes();
assert.equal(seedGroups[0].parent, null, 'Disposed replacement seed must detach from its assembly');
assert([...seedResources.values()].every(count => count === 1), 'Seed resources must be disposed exactly once');
mechanical.dispose(); mechanical.start(); assert.equal(mechanical.update(.4), false);
assert([...seedResources.values()].every(count => count === 1), 'Repeated seed disposal must stay idempotent');
const empty = createClockTransformation({ THREE, parts: [] });
empty.start(); assert.equal(empty.update(1), false); assert.equal(empty.screenReady, true); empty.dispose();

const studioLight = new THREE.PointLight(0xffffff, 3.5); scene.add(studioLight);
const camera = new THREE.PerspectiveCamera(30, 1, .1, 100);
camera.position.set(0, 4, 12.4); camera.lookAt(0, .55, 0);
const cameraHome = pose(camera), studioHome = pose(studioLight);
const origin = new THREE.Vector3(-1.18, .79, 0);
const previousChildren = new Set(scene.children);
const explosion = createControlExplosion({ THREE, scene, camera, origin });
const additions = scene.children.filter(child => !previousChildren.has(child));
assert.equal(additions.length, 1, 'Effect must own one scene group');
const group = additions[0], nodes = [];
group.traverse(object => nodes.push(object));
assert.deepEqual(group.position.toArray(), origin.toArray());
assert.equal(group.visible, false);
const effectLight = nodes.find(object => object.isPointLight);
assert(effectLight, 'Blast must provide its own finite transient light');

const owned = new Map();
function watch(resource) {
  if (!resource?.dispose || owned.has(resource)) return;
  owned.set(resource, 0);
  resource.addEventListener('dispose', () => owned.set(resource, owned.get(resource) + 1));
}
for (const object of nodes) {
  watch(object.geometry);
  for (const surface of Array.isArray(object.material) ? object.material : [object.material]) {
    if (!surface) continue;
    watch(surface);
    for (const uniform of Object.values(surface.uniforms || {})) if (uniform.value?.isTexture) watch(uniform.value);
    for (const value of Object.values(surface)) if (value?.isTexture) watch(value);
  }
}
for (const type of ['isBufferGeometry', 'isMaterial', 'isTexture']) {
  assert([...owned.keys()].some(resource => resource[type]), `Coverage must include ${type} resources`);
}
const shapedVolumes = nodes.filter(object => object.material?.uniforms?.uGlyph);
assert.equal(shapedVolumes.length, 1, 'The explosion itself must form the count without a second numeral volume');
const numberedBlast = shapedVolumes[0], blastUniforms = numberedBlast.material.uniforms;
const glyphMask = blastUniforms.uGlyph.value;
assert(glyphMask.isDataTexture, 'DOM-free checks use the real digit-density mask');
explosion.start({ count: 425 });
assert(glyphMask.image.data.some(value => value > 0), 'An accepted count must shape the explosion');
const capturedMask = glyphMask.image.data.slice();
explosion.update(.5);
assert.equal(numberedBlast.visible, true, 'The early burning explosion must already form the count');
assert.equal(blastUniforms.uHasNumber.value, 1); assert.equal(blastUniforms.uShape.value, 1);
assert(blastUniforms.uCooling.value < .2, 'Number formation must precede cooling');
explosion.update(1.9, { phone: true });
assert.equal(numberedBlast.visible, true);
assert(blastUniforms.uCooling.value > .7, 'The same numbered volume must cool into smoke');
explosion.update(2.1, { count: 999 });
assert.deepEqual(glyphMask.image.data, capturedMask, 'Later updates must not change the accepted count');
explosion.update(3.4); assert.equal(numberedBlast.visible, false, 'The numbered blast must dissolve during clock growth');
explosion.finish();
assert(glyphMask.image.data.every(value => value === 0), 'Finish must erase the previous numeral');
assert.equal(blastUniforms.uHasNumber.value, 0);
for (const count of [0, 1, Number.MAX_SAFE_INTEGER]) {
  explosion.start({ count }); explosion.update(1.9);
  assert.equal(blastUniforms.uHasNumber.value, 1, 'Every safe count, including zero, must form');
  assert.equal(numberedBlast.visible, true);
  assert(numberedBlast.scale.x <= 3.6, 'A growing tally must stay inside its fitted width');
  assert.equal(blastUniforms.uGlyph.value, glyphMask, 'Repeated presses must reuse the mask texture');
  explosion.finish();
}
for (const count of [-1, NaN, Number.MAX_SAFE_INTEGER + 1, 'unavailable']) {
  explosion.start({ count }); explosion.update(1.9);
  assert.equal(blastUniforms.uHasNumber.value, 0, 'Invalid counts must retain the unnumbered blast');
  assert(glyphMask.image.data.every(value => value === 0), 'Invalid counts must not retain an earlier numeral');
  explosion.finish();
}
for (const phone of [false, true]) {
  explosion.start({ count: 425 });
  for (let step = 0; step < 116; step++) {
    explosion.update(step * .05, { phone }); checkFinite();
  }
  explosion.finish();
}
assert(!owned.has(geometry) && !owned.has(material), 'Effect resources must exclude source clock resources');
function checkFinite() {
  group.updateMatrixWorld(true);
  for (const object of nodes) {
    finite([...object.position.toArray(), ...object.quaternion.toArray(), ...object.scale.toArray()], 'Effect pose');
    finite(object.matrixWorld.elements, 'Effect world matrix');
    if (object.instanceMatrix) finite(Array.from(object.instanceMatrix.array), 'Fragment instance matrices');
    if (object.isLight) finite([object.intensity], 'Effect light');
    for (const uniform of Object.values(object.material?.uniforms || {})) {
      if (typeof uniform.value === 'number') finite([uniform.value], 'Shader uniform');
    }
  }
  finite(explosion.shake.toArray(), 'Camera shake');
  assert.deepEqual(pose(camera), cameraHome, 'Effect must return shake without mutating the caller camera');
  assert.deepEqual(pose(studioLight), studioHome); assert.equal(studioLight.intensity, 3.5);
  checkHomes();
}
const state = () => ({
  poses: nodes.map(pose), shake: explosion.shake.toArray(), light: effectLight.intensity,
  fragments: nodes.filter(object => object.instanceMatrix).map(object => Array.from(object.instanceMatrix.array))
});
explosion.start(); explosion.update(.4); checkFinite();
const firstExplosion = state(); assert(effectLight.intensity > 0);
explosion.finish(); assert.equal(group.visible, false); assert.equal(effectLight.intensity, 0);
assert.deepEqual(explosion.shake.toArray(), [0, 0]);
assert([...owned.values()].every(count => count === 0), 'Finish must retain reusable resources');
explosion.start(); explosion.update(.4); assert.deepEqual(state(), firstExplosion, 'Repeated explosion must be deterministic');
for (const phone of [false, true]) {
  explosion.start();
  for (let step = 0; step < 116; step++) {
    assert.equal(explosion.update(step * .05, { phone }), true); checkFinite();
  }
  assert.equal(explosion.update(5.8, { phone }), false);
  assert.equal(group.visible, false); assert.equal(effectLight.intensity, 0);
  assert.deepEqual(explosion.shake.toArray(), [0, 0]);
}
explosion.start(); explosion.update(.1); explosion.dispose();
assert.equal(group.parent, null, 'Dispose must remove its group from the scene');
assert.deepEqual(scene.children, [sourceClock, studioLight]);
assert.equal(effectLight.intensity, 0); assert.deepEqual(explosion.shake.toArray(), [0, 0]);
assert([...owned.values()].every(count => count === 1), 'Each owned resource must be disposed exactly once');
explosion.dispose(); explosion.start(); assert.equal(explosion.update(.4), false);
assert([...owned.values()].every(count => count === 1), 'Repeated disposal must remain idempotent');
checkHomes();
geometry.dispose(); material.dispose();
console.log('Control effects passed: one burning-to-smoke count volume, captured accepted counts, finite fitted numerals, deterministic staged motion, exact source restoration, screen ignition, owned cleanup, and repeat-safe lifecycle.');
