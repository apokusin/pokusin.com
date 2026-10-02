// The fair is a sunlit physical miniature: stone, painted timber, canvas and enamel.
// A packed, world-projected texture keeps pores the same size on every authored object.
export function createFairMaterials(ctx, world) {
  const T = ctx.THREE;
  const palette = { cream: 0xf2e5cc, jade: 0x77958a, coral: 0xd86b55, ink: 0x263b40 };
  const ownedTextures = new Set(), ownedMaterials = new Set(), ownedGeometry = new Set();
  const atmosphere = new T.Group(); atmosphere.name = 'Fair atmosphere'; world.add(atmosphere);
  const oldEnvironment = ctx.scene.environment;
  const oldEnvironmentIntensity = ctx.scene.environmentIntensity;
  const oldBackground = ctx.scene.background;
  const oldFog = ctx.scene.fog;
  let disposed = false;

  function random(seed) {
    let value = seed >>> 0;
    return () => { value = (value * 1664525 + 1013904223) >>> 0; return value / 4294967296; };
  }
  function field(size, seed) {
    const rand = random(seed);
    return Float32Array.from({ length: size * size }, () => rand());
  }
  function sample(data, size, x, y) {
    const ix = Math.floor(x), iy = Math.floor(y), fx = x - ix, fy = y - iy;
    const sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy);
    const at = (a, b) => data[((b % size + size) % size) * size + ((a % size + size) % size)];
    const first = at(ix, iy) * (1 - sx) + at(ix + 1, iy) * sx;
    const second = at(ix, iy + 1) * (1 - sx) + at(ix + 1, iy + 1) * sx;
    return first * (1 - sy) + second * sy;
  }

  function grainTexture(kind) {
    const size = 256, canvas = document.createElement('canvas'); canvas.width = canvas.height = size;
    const c = canvas.getContext('2d'), pixels = c.createImageData(size, size);
    const broad = field(8, 51), medium = field(32, 107), pores = field(128, 719);
    const rand = random(811);
    for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      const a = sample(broad, 8, x / 32, y / 32) - .5;
      const b = sample(medium, 32, x / 8, y / 8) - .5;
      const p = sample(pores, 128, x / 2, y / 2) - .5;
      const fine = rand() - .5;
      const weave = kind === 'cloth' ? (Math.sin(x * Math.PI / 2) + Math.sin(y * Math.PI / 2)) * .028 : 0;
      const height = .5 + a * .28 + b * .20 + p * .34 + fine * .12 + weave;
      const mottling = kind === 'enamel' ? .018 : kind === 'ground' ? .06 : .035;
      // R = linear albedo multiplier, G = roughness multiplier, B = microscopic height.
      pixels.data[i] = Math.round(255 * Math.max(.82, Math.min(1, .965 + a * mottling + b * .055 + p * .08 + weave * .20)));
      pixels.data[i + 1] = Math.round(255 * Math.max(.72, Math.min(1, .93 + b * .1 + p * .08)));
      pixels.data[i + 2] = Math.round(Math.max(0, Math.min(255, height * 255)));
      pixels.data[i + 3] = 255;
    }
    c.putImageData(pixels, 0, 0);
    const texture = new T.CanvasTexture(canvas);
    texture.wrapS = texture.wrapT = T.RepeatWrapping;
    texture.anisotropy = Math.min(4, ctx.renderer.capabilities.getMaxAnisotropy());
    // Packed data is linear; applying SRGB conversion here would crush the height channel.
    texture.colorSpace = T.NoColorSpace; ownedTextures.add(texture); return texture;
  }

  const packed = {
    stone: grainTexture('stone'), paint: grainTexture('paint'),
    cloth: grainTexture('cloth'), enamel: grainTexture('enamel'), ground: grainTexture('ground')
  };
  function material(color, type, roughness, bump, scale, metalness = 0) {
    const result = new T.MeshStandardMaterial({ color, roughness, metalness, map: packed[type], flatShading: false });
    result.onBeforeCompile = shader => {
      shader.uniforms.fairMap = { value: packed[type] };
      shader.uniforms.fairScale = { value: scale };
      shader.uniforms.fairBump = { value: bump };
      shader.vertexShader = shader.vertexShader.replace('#include <common>', `#include <common>
        varying vec3 vFairPosition;
        varying vec3 vFairNormal;
      `).replace('#include <defaultnormal_vertex>', `#include <defaultnormal_vertex>
        vFairNormal = inverseTransformDirection(normalize(transformedNormal), viewMatrix);
      `).replace('#include <project_vertex>', `#include <project_vertex>
        vec4 fairWorldPosition = vec4(transformed, 1.0);
        #ifdef USE_BATCHING
          fairWorldPosition = batchingMatrix * fairWorldPosition;
        #endif
        #ifdef USE_INSTANCING
          fairWorldPosition = instanceMatrix * fairWorldPosition;
        #endif
        vFairPosition = (modelMatrix * fairWorldPosition).xyz;
      `);
      shader.fragmentShader = shader.fragmentShader.replace('#include <common>', `#include <common>
        varying vec3 vFairPosition;
        varying vec3 vFairNormal;
        uniform float fairScale;
        uniform float fairBump;
        uniform sampler2D fairMap;
        vec3 fairWeights() {
          vec3 weights = pow(abs(normalize(vFairNormal)), vec3(5.0));
          return weights / max(dot(weights, vec3(1.0)), .00001);
        }
        vec3 fairGrain(vec3 point, vec3 weights) {
          return texture2D(fairMap, point.yz * fairScale).rgb * weights.x
            + texture2D(fairMap, point.xz * fairScale).rgb * weights.y
            + texture2D(fairMap, point.xy * fairScale).rgb * weights.z;
        }
      `).replace('#include <map_fragment>', `
        vec3 fairSurfaceWeights = fairWeights();
        vec3 fairSurface = fairGrain(vFairPosition, fairSurfaceWeights);
        diffuseColor.rgb *= fairSurface.r;
      `).replace('#include <roughnessmap_fragment>', `
        float roughnessFactor = roughness * fairSurface.g;
      `).replace('#include <normal_fragment_maps>', `#include <normal_fragment_maps>
        vec3 fairDx = dFdx(vFairPosition), fairDy = dFdy(vFairPosition);
        float fairHx = (fairGrain(vFairPosition + fairDx, fairSurfaceWeights).b - fairSurface.b) * fairBump;
        float fairHy = (fairGrain(vFairPosition + fairDy, fairSurfaceWeights).b - fairSurface.b) * fairBump;
        vec3 fairSigmaX = normalize(dFdx(-vViewPosition));
        vec3 fairSigmaY = normalize(dFdy(-vViewPosition));
        vec3 fairR1 = cross(fairSigmaY, normal), fairR2 = cross(normal, fairSigmaX);
        float fairDet = dot(fairSigmaX, fairR1) * faceDirection;
        normal = normalize(max(abs(fairDet), .00001) * normal - sign(fairDet) * (fairHx * fairR1 + fairHy * fairR2));
      `);
    };
    result.customProgramCacheKey = () => 'fair-world-grain-v1';
    ownedMaterials.add(result); return result;
  }
  const materials = {
    cream: material(palette.cream, 'stone', .87, .30, .68),
    roundCream: material(palette.cream, 'stone', .82, .23, .68),
    jade: material(palette.jade, 'paint', .70, .13, .85),
    coral: material(palette.coral, 'cloth', .79, .18, .95),
    ink: material(palette.ink, 'enamel', .38, .012, 1.55, .12),
    ground: material(palette.jade, 'ground', .97, .31, .68),
    limestone: material(palette.cream, 'stone', .85, .30, .68),
    plaster: material(palette.cream, 'stone', .90, .12, .96),
    canvasCream: material(palette.cream, 'cloth', .92, .19, 1.12),
    canvasJade: material(palette.jade, 'cloth', .92, .19, 1.12),
    canvasCoral: material(palette.coral, 'cloth', .92, .19, 1.12),
    terracotta: material(palette.coral, 'stone', .65, .15, .91),
    brass: material(palette.cream, 'enamel', .42, .009, 1.4, .25),
    crevice: material(new T.Color(palette.jade).multiplyScalar(.50), 'paint', .92, .025, .85)
  };
  materials.darkMetal = materials.ink;

  ctx.renderer.toneMapping = T.NeutralToneMapping;
  ctx.renderer.toneMappingExposure = 1.05;
  ctx.renderer.shadowMap.enabled = true; ctx.renderer.shadowMap.type = T.PCFSoftShadowMap;
  const skyLight = new T.HemisphereLight(0xd3e0e8, 0x787d72, .57);
  atmosphere.add(skyLight);
  const sun = new T.DirectionalLight(0xfff2de, 2.65);
  sun.position.set(-22, 30, 21); sun.target.position.set(0, 0, -3);
  sun.castShadow = true; sun.shadow.mapSize.set(ctx.mobile ? 1024 : 2048, ctx.mobile ? 1024 : 2048);
  Object.assign(sun.shadow.camera, { left: -24, right: 24, top: 24, bottom: -24, near: 1, far: 90 });
  sun.shadow.bias = -.00018; sun.shadow.normalBias = .024; sun.shadow.radius = 3;
  atmosphere.add(sun, sun.target);
  const rim = new T.DirectionalLight(0xc9dce6, .28); rim.position.set(17, 14, -23); atmosphere.add(rim);

  // The enamel receives a broad sky reflection rather than a computer-screen shine.
  const environmentCanvas = document.createElement('canvas'); environmentCanvas.width = 512; environmentCanvas.height = 256;
  const ec = environmentCanvas.getContext('2d');
  const eg = ec.createLinearGradient(0, 0, 0, 256);
  eg.addColorStop(0, '#adc3d2'); eg.addColorStop(.46, '#ccd6d4'); eg.addColorStop(.55, '#a1ac9e'); eg.addColorStop(1, '#687369');
  ec.fillStyle = eg; ec.fillRect(0, 0, 512, 256);
  const glow = ec.createRadialGradient(130, 60, 0, 130, 60, 105);
  glow.addColorStop(0, 'rgba(255,242,216,.85)'); glow.addColorStop(1, 'rgba(255,242,216,0)');
  ec.fillStyle = glow; ec.fillRect(0, 0, 512, 256);
  const environmentTexture = new T.CanvasTexture(environmentCanvas);
  environmentTexture.mapping = T.EquirectangularReflectionMapping; environmentTexture.colorSpace = T.SRGBColorSpace;
  const pmrem = new T.PMREMGenerator(ctx.renderer);
  const environment = pmrem.fromEquirectangular(environmentTexture); pmrem.dispose(); environmentTexture.dispose();
  ctx.scene.environment = environment.texture; ctx.scene.environmentIntensity = .34;
  const fairBackground = new T.Color(0xb6c5cc), fairFog = new T.Fog(0xb6c5cc, 29, 77);
  ctx.scene.background = fairBackground; ctx.scene.fog = fairFog;

  const skyMaterial = new T.ShaderMaterial({
    side: T.BackSide, depthWrite: false,
    uniforms: { time: { value: 0 }, zenith: { value: new T.Color(0x566f85) }, horizon: { value: new T.Color(0xb6c5cc) } },
    vertexShader: `varying vec3 skyDirection;
      void main() { skyDirection = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: `uniform float time; uniform vec3 zenith; uniform vec3 horizon; varying vec3 skyDirection;
      float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453123); }
      float noise(vec2 p) { vec2 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f);
        return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y); }
      float cloudNoise(vec2 p) { float sum=0.0, a=.5; for(int i=0;i<5;i++){sum+=noise(p)*a;p=p*2.07+vec2(9.3,4.1);a*=.5;} return sum; }
      void main() {
        vec3 direction=normalize(skyDirection);
        float elevation=max(direction.y,0.0);
        vec3 color=mix(horizon,zenith,pow(elevation,.62));
        vec2 cp=direction.xz/max(direction.y,.075)*.92+vec2(time*.0022,0.0);
        float cloud=smoothstep(.48,.74,cloudNoise(cp));
        cloud*=smoothstep(.065,.20,elevation)*(1.0-smoothstep(.72,.96,elevation));
        color=mix(color,vec3(.83,.86,.86),cloud*.62);
        float haze=pow(max(0.0,dot(direction,normalize(vec3(-.47,.72,.48)))),10.0);
        color=mix(color,vec3(.90,.86,.74),haze*.13);
        gl_FragColor=vec4(color,1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`
  });
  ownedMaterials.add(skyMaterial);
  const skyGeometry = new T.SphereGeometry(72, 32, 16); ownedGeometry.add(skyGeometry);
  const dome = new T.Mesh(skyGeometry, skyMaterial); dome.renderOrder = -100; atmosphere.add(dome);

  const groundGeometry = new T.CircleGeometry(73, 96); ownedGeometry.add(groundGeometry);
  const ground = new T.Mesh(groundGeometry, materials.ground); ground.rotation.x = -Math.PI / 2;
  ground.position.y = -.16; ground.receiveShadow = true; atmosphere.add(ground);

  // A sparse distant tree belt gives an inhabited horizon without filling the promenade.
  const leafGeometry = new T.IcosahedronGeometry(1, 1), trunkGeometry = new T.CylinderGeometry(.11, .19, 1, 6);
  ownedGeometry.add(leafGeometry); ownedGeometry.add(trunkGeometry);
  const treeCount = 44, leaves = new T.InstancedMesh(leafGeometry, materials.jade, treeCount * 3);
  const trunks = new T.InstancedMesh(trunkGeometry, materials.ink, treeCount);
  const rand = random(7805), transform = new T.Object3D(), instanceColor = new T.Color();
  // Clusters leave an intentional opening behind the clock rather than forming a garden fence.
  const treeClusters = [[-29,-42],[-16,-47],[17,-44],[31,-39],[-37,-13],[-41,12],[38,-19],[42,8]];
  for (let i = 0; i < treeCount; i++) {
    const cluster = treeClusters[i % treeClusters.length];
    const angle = rand() * Math.PI * 2, radius = Math.sqrt(rand()) * 4.7;
    const x = cluster[0] + Math.cos(angle) * radius;
    const z = cluster[1] + Math.sin(angle) * radius * .74;
    const height = 2.30 + rand() * 2.05;
    transform.position.set(x, height / 2, z); transform.rotation.set(0, 0, .04 * (rand() - .5)); transform.scale.set(1, height, 1); transform.updateMatrix();
    trunks.setMatrixAt(i, transform.matrix);
    for (let j = 0; j < 3; j++) {
      transform.position.set(x + (rand() - .5) * 1.7, height * .83 + j * .14, z + (rand() - .5) * 1.5);
      transform.rotation.set(rand() * .6, rand() * Math.PI, rand() * .6);
      transform.scale.set(1.0 + rand() * .55, .95 + rand() * .45, 1.0 + rand() * .55); transform.updateMatrix();
      leaves.setMatrixAt(i * 3 + j, transform.matrix);
      instanceColor.setRGB(.88 + rand() * .12, .90 + rand() * .10, .83 + rand() * .12);
      leaves.setColorAt(i * 3 + j, instanceColor);
    }
  }
  leaves.receiveShadow = true;
  atmosphere.add(leaves, trunks);

  return {
    materials, palette, sun, ground,
    update(time) { if (!disposed && !ctx.reduced) skyMaterial.uniforms.time.value = time; },
    dispose() {
      if (disposed) return; disposed = true;
      if (ctx.scene.environment === environment.texture) {
        ctx.scene.environment = oldEnvironment;
        ctx.scene.environmentIntensity = oldEnvironmentIntensity;
      }
      if (ctx.scene.background === fairBackground) ctx.scene.background = oldBackground;
      if (ctx.scene.fog === fairFog) ctx.scene.fog = oldFog;
      environment.dispose(); sun.shadow.map?.dispose();
      ownedTextures.forEach(texture => texture.dispose());
      ownedMaterials.forEach(item => item.dispose()); ownedGeometry.forEach(item => item.dispose());
      atmosphere.removeFromParent();
    }
  };
}
