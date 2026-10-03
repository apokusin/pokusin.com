# Three.js addons

These unbundled modules are from Three.js **0.180.0**, matching the existing vendored runtime. Their bare `three` imports have been changed to `../../three.module.min.js` for this static site. Their implementation is otherwise unchanged.

- `loaders/GLTFLoader.js`: https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/loaders/GLTFLoader.js
- `utils/BufferGeometryUtils.js`: https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/utils/BufferGeometryUtils.js
- `objects/Reflector.js`: https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/objects/Reflector.js
- `postprocessing/SSAOPass.js`, `postprocessing/Pass.js`, `math/SimplexNoise.js`, `shaders/SSAOShader.js`, `shaders/CopyShader.js`: official [Three.js r180 source](https://github.com/mrdoob/three.js/tree/r180/examples/jsm). Roadworks uses a bounded contact-shading pass; its runtime blends the result gently over the actual scene.

The MIT license is preserved at [THREE-LICENSE.txt](../THREE-LICENSE.txt).
