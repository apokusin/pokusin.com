// A finite, deliberately disproportionate practical-effects interlude. Everything
// here belongs to this effect; the instrument's lights and materials stay intact.
export function createControlExplosion({ THREE, scene, camera, origin }) {
  const group = new THREE.Group();
  group.position.copy(origin);
  group.visible = false;
  scene.add(group);
  const shake = new THREE.Vector2();
  const resources = new Set();
  const keep = resource => { resources.add(resource); return resource; };
  const clamp = value => Math.max(0, Math.min(1, value));
  const smooth = value => { const x = clamp(value); return x * x * (3 - 2 * x); };
  let active = false, disposed = false;
  let seed = 173;
  const random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
  // Seamless, coherent noise is baked once. Turbulence remains live in the
  // shader, but neither a huge blast nor its translucent plume pays for dozens
  // of hash calculations at every covered pixel.
  const noiseSize = 128, noisePixels = new Uint8Array(noiseSize * noiseSize * 4);
  for (let channel = 0; channel < 3; channel++) {
    const layers = [8, 16, 32, 64].map(size => {
      const grid = new Float32Array(size * size);
      for (let i = 0; i < grid.length; i++) grid[i] = random();
      return { size, grid };
    });
    for (let y = 0; y < noiseSize; y++) for (let x = 0; x < noiseSize; x++) {
      let value = 0, weight = .55;
      for (let octave = 0; octave < layers.length; octave++) {
        const layer = layers[octave], px = x / noiseSize * layer.size, py = y / noiseSize * layer.size;
        const ix = Math.floor(px), iy = Math.floor(py), mask = layer.size - 1;
        const fx = smooth(px - ix), fy = smooth(py - iy);
        const a = layer.grid[(iy & mask) * layer.size + (ix & mask)];
        const b = layer.grid[(iy & mask) * layer.size + ((ix + 1) & mask)];
        const c = layer.grid[((iy + 1) & mask) * layer.size + (ix & mask)];
        const d = layer.grid[((iy + 1) & mask) * layer.size + ((ix + 1) & mask)];
        value += ((a + (b - a) * fx) * (1 - fy) + (c + (d - c) * fx) * fy) * weight;
        weight *= .5;
      }
      const index = (y * noiseSize + x) * 4;
      noisePixels[index + channel] = Math.round(clamp((value - .5) * 1.35 + .5) * 255);
      noisePixels[index + 3] = 255;
    }
  }
  const noiseTexture = keep(new THREE.DataTexture(noisePixels, noiseSize, noiseSize));
  noiseTexture.wrapS = noiseTexture.wrapT = THREE.RepeatWrapping;
  noiseTexture.magFilter = noiseTexture.minFilter = THREE.LinearFilter;
  noiseTexture.generateMipmaps = false; noiseTexture.needsUpdate = true;
  const noise = `
    uniform sampler2D uNoise;
    float noise3(vec3 p) {
      float a=texture2D(uNoise,p.xy*.145+vec2(p.z*.041,-p.z*.023)).r;
      float b=texture2D(uNoise,p.yz*.145+vec2(p.x*.037,p.x*.019)).g;
      return clamp((a*.66+b*.34-.5)*1.4+.5,0.,1.);
    }
    float fbm(vec3 p) {
      return .55*noise3(p)+.28*noise3(p*2.07+7.)+.14*noise3(p*4.19+19.);
    }
  `;
  const planeGeometry = keep(new THREE.PlaneGeometry(2, 2));
  const billboardVertex = `varying vec2 vUv;
    void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`;
  const fireFragment = `${noise}
    uniform float uTime,uOpacity,uCooling,uSteps;
    varying vec2 vUv;
    float mass(vec3 p,out float roll,out float curl) {
      // Connected, asymmetric rolling volumes are integrated together, not
      // drawn as overlapping opaque balls. Density fades through every edge.
      float d=length(p-vec3(0.,-.12,.07))-.57;
      d=min(d,length(p-vec3(-.29,.25,-.10))-.43);
      d=min(d,length(p-vec3(.27,.28,-.14))-.38);
      d=min(d,length(p-vec3(-.46,-.11,-.06))-.32);
      d=min(d,length(p-vec3(.43,-.08,-.12))-.34);
      d=min(d,length(p-vec3(-.09,.55,-.19))-.29);
      vec3 q=p*5.+vec3(.3,-uTime*.76,uTime*.24);
      roll=noise3(q);
      curl=noise3(q*1.8+roll*2.3);
      return 1.-smoothstep(-.075,.105,d+(roll-.5)*.25+(curl-.5)*.085);
    }
    void main() {
      vec2 uv=vUv*2.-1.;
      vec3 integrated=vec3(0.);float opacity=0.;
      for(int i=0;i<14;i++) {
        if(float(i)>=uSteps)break;
        vec3 p=vec3(uv,.90-(float(i)+.5)*1.8/uSteps);
        float roll,curl;
        float density=mass(p,roll,curl);
        float core=exp(-dot(p-vec3(0.,-.22,.11),p-vec3(0.,-.22,.11))*6.4);
        float temperature=clamp((.31+core*.79+(1.-curl)*.21-roll*.16
          +pow(1.-density,2.)*.16)*(1.-uCooling*1.16),0.,1.);
        vec3 ash=mix(vec3(.012,.017,.013),vec3(.12,.125,.095),roll*.39+max(p.z,0.)*.12);
        float underside=exp(-length(p-vec3(0.,-.58,.27))*2.7);
        ash+=vec3(.38,.19,.056)*underside*(1.-uCooling)*.55;
        vec3 flame=mix(vec3(.25,.12,.045),vec3(1.5,.61,.10),smoothstep(.25,.61,temperature));
        flame=mix(flame,vec3(4.6,3.7,2.05),smoothstep(.63,.91,temperature));
        float burning=smoothstep(.12,.46,temperature);
        float soot=smoothstep(.42,.79,roll+uCooling*.35)*(.25+uCooling*.45);
        vec3 radiance=mix(ash,flame,burning*(1.-soot));
        float alpha=density*(2.9/uSteps);
        integrated+=radiance*alpha*(1.-opacity);
        opacity+=alpha*(1.-opacity);
      }
      float fade=1.-smoothstep(.91,1.,max(abs(uv.x),abs(uv.y)));
      float alpha=opacity*uOpacity*fade;
      gl_FragColor=vec4(integrated/max(opacity,.001),alpha);
      #include <colorspace_fragment>
    }
  `;
  const fireMaterial = keep(new THREE.ShaderMaterial({
    vertexShader: billboardVertex, fragmentShader: fireFragment,
    uniforms: { uNoise: { value: noiseTexture }, uTime: { value: 0 }, uOpacity: { value: 0 }, uCooling: { value: 0 }, uSteps: { value: 14 } },
    transparent: true, depthWrite: false, toneMapped: false
  }));
  const fire = new THREE.Mesh(planeGeometry, fireMaterial);
  fire.renderOrder = 25; group.add(fire);
  const smokeFragment = `${noise}
    varying vec2 vUv;
    uniform float uTime,uSeed,uOpacity,uHeat,uSteps;
    void main() {
      vec2 uv=vUv*2.-1.;vec3 integrated=vec3(0.);float opacity=0.;
      for(int i=0;i<10;i++) {
        if(float(i)>=uSteps)break;
        vec3 p=vec3(uv,.83-(float(i)+.5)*1.66/uSteps);
        vec3 q=p*4.6+vec3(uSeed,-uTime*.37,uTime*.21);
        float roll=noise3(q),curl=noise3(q*1.8+roll*2.);
        float shape=length(p*vec3(1.03,.97,1.))-.70;
        float density=1.-smoothstep(-.085,.15,shape+(roll-.5)*.38+(curl-.5)*.10);
        vec3 billowNormal=normalize(p+vec3((roll-.5)*.45,(curl-.5)*.3,.08));
        float shadow=clamp(.15+roll*.2+dot(billowNormal,normalize(vec3(-.5,.7,1.)))*.38,0.,1.);
        vec3 color=mix(vec3(.009,.014,.010),vec3(.25,.28,.23),shadow);
        float rim=pow(clamp(length(p.xy)*1.25,0.,1.),3.);
        float underside=max(0.,.22-p.y);
        color+=vec3(.56,.22,.048)*rim*underside*uHeat*(.35+.65*curl);
        float alpha=density*(2.5/uSteps);
        integrated+=color*alpha*(1.-opacity);opacity+=alpha*(1.-opacity);
      }
      float edge=1.-smoothstep(.90,1.,max(abs(uv.x),abs(uv.y)));
      gl_FragColor=vec4(integrated/max(opacity,.001),opacity*uOpacity*edge);
      #include <colorspace_fragment>
    }
  `;
  const smoke = [];
  for (let i = 0; i < 7; i++) {
    const material = keep(new THREE.ShaderMaterial({
      vertexShader: billboardVertex, fragmentShader: smokeFragment,
      uniforms: { uNoise: { value: noiseTexture }, uTime: { value: 0 }, uSeed: { value: random() * 70 }, uOpacity: { value: 0 }, uHeat: { value: 0 }, uSteps: { value: 10 } },
      transparent: true, depthWrite: false, toneMapped: false
    }));
    const mesh = new THREE.Mesh(planeGeometry, material);
    mesh.renderOrder = 10 + i;
    group.add(mesh);
    smoke.push({ mesh, x: (random() - .5) * 3.4, y: i * .30 - .2, z: -1.25 - random() * 1.1,
      size: 1.6 + random() * .65, birth: .12 + i * .078 });
  }

  const waveFragment = `${noise}
    varying vec2 vUv;
    uniform float uOpacity,uTime,uDust;
    void main() {
      vec2 p=vUv*2.-1.; float r=length(p),angle=atan(p.y,p.x);
      float breakup=noise3(vec3(p*31.,uTime*.8));
      float width=mix(.018,.13,uDust);
      float ring=exp(-pow((r-.79)/width,2.));
      ring*=mix(.70+breakup*.3,.14+breakup*.86,uDust);
      float inner=exp(-pow((r-.73)/.15,2.))*.18;
      vec3 color=mix(vec3(2.8,1.30,.37),vec3(.44,.36,.21),uDust);
      gl_FragColor=vec4(color,(ring+inner)*uOpacity);
    }
  `;
  const waves = [];
  for (let i = 0; i < 3; i++) {
    const material = keep(new THREE.ShaderMaterial({
      vertexShader: billboardVertex, fragmentShader: waveFragment,
      uniforms: { uNoise: { value: noiseTexture }, uOpacity: { value: 0 }, uTime: { value: 0 }, uDust: { value: i ? 1 : 0 } },
      transparent: true, depthWrite: false, toneMapped: false,
      blending: i ? THREE.NormalBlending : THREE.AdditiveBlending, side: THREE.DoubleSide
    }));
    const mesh = new THREE.Mesh(planeGeometry, material);
    mesh.renderOrder = i ? 5 : 38;
    if (i) mesh.rotation.x = -Math.PI / 2;
    group.add(mesh); waves.push(mesh);
  }

  // The radial streaks are one instanced draw. Their ballistic movement, taper,
  // heat and finite lifetimes happen in the shader, without per-frame buffers.
  const sparkCount = 180, burstCount = 128;
  const sparkGeometry = keep(new THREE.InstancedBufferGeometry());
  sparkGeometry.index = planeGeometry.index;
  sparkGeometry.attributes.position = planeGeometry.attributes.position;
  sparkGeometry.attributes.uv = planeGeometry.attributes.uv;
  const starts = new Float32Array(sparkCount * 3), velocities = new Float32Array(sparkCount * 3);
  const timings = new Float32Array(sparkCount * 3), colors = new Float32Array(sparkCount * 3);
  const indexes = new Float32Array(sparkCount);
  for (let i = 0; i < sparkCount; i++) {
    indexes[i] = i;
    const weld = i >= burstCount, angle = random() * Math.PI * 2;
    if (weld) {
      const edge = (i - burstCount) % 4;
      starts[i * 3] = edge < 2 ? (edge ? 1.82 : -1.82) : (random() - .5) * 3.6;
      starts[i * 3 + 1] = edge < 2 ? (random() - .5) * .8 : (edge === 2 ? .45 : -.45);
      starts[i * 3 + 2] = .65;
    }
    const speed = weld ? 1.3 + random() * 2.2 : 6.5 + random() * 7;
    velocities[i * 3] = Math.cos(angle) * speed;
    velocities[i * 3 + 1] = Math.sin(angle) * speed * (weld ? .65 : .84) + (weld ? .6 : 2.7);
    velocities[i * 3 + 2] = (random() - .5) * speed * .58;
    timings[i * 3] = weld ? 2.68 + ((i - burstCount) % 8) * .24 + random() * .05 : .02 + random() * .12;
    timings[i * 3 + 1] = weld ? .35 + random() * .30 : .85 + random() * 1.3;
    timings[i * 3 + 2] = weld ? .012 + random() * .013 : .018 + random() * .025;
    colors[i * 3] = 3.4 + random() * 1.8;
    colors[i * 3 + 1] = .75 + random() * 1.75;
    colors[i * 3 + 2] = .10 + random() * .5;
  }
  sparkGeometry.setAttribute('aStart', new THREE.InstancedBufferAttribute(starts, 3));
  sparkGeometry.setAttribute('aVelocity', new THREE.InstancedBufferAttribute(velocities, 3));
  sparkGeometry.setAttribute('aTiming', new THREE.InstancedBufferAttribute(timings, 3));
  sparkGeometry.setAttribute('aColor', new THREE.InstancedBufferAttribute(colors, 3));
  sparkGeometry.setAttribute('aIndex', new THREE.InstancedBufferAttribute(indexes, 1));
  sparkGeometry.instanceCount = sparkCount;
  const sparkMaterial = keep(new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uPhone: { value: 0 } },
    vertexShader: `
      attribute vec3 aStart,aVelocity,aTiming,aColor;attribute float aIndex;
      uniform float uTime,uPhone;
      varying vec2 vUv; varying vec3 vColor; varying float vFade;
      void main() {
        float age=max(0.,uTime-aTiming.x),life=aTiming.y;
        float alive=step(aTiming.x,uTime)*(1.-step(life,age));
        float visible=1.-uPhone*step(95.,aIndex);
        // Welding accents still run on phones; thin the large radial spray only.
        visible=max(visible,step(2.,aTiming.x));
        vec3 p=aStart+aVelocity*age+vec3(0.,-2.8*age*age,0.);
        vec3 velocity=aVelocity+vec3(0.,-5.6*age,0.);
        vec4 view=modelViewMatrix*vec4(p,1.);
        vec2 direction=normalize((mat3(modelViewMatrix)*velocity).xy+vec2(.001));
        vec2 perpendicular=vec2(-direction.y,direction.x);
        float streak=clamp(length(velocity)*.035,.04,.52);
        view.xy+=perpendicular*position.x*aTiming.z+direction*position.y*streak;
        vUv=uv;vColor=aColor;
        vFade=alive*visible*pow(1.-clamp(age/life,0.,1.),.72);
        gl_Position=projectionMatrix*view;
      }
    `,
    fragmentShader: `varying vec2 vUv;varying vec3 vColor;varying float vFade;
      void main(){float core=exp(-pow((vUv.x-.5)*4.5,2.));
        float tip=sin(vUv.y*3.14159);gl_FragColor=vec4(vColor,core*tip*vFade);}`,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false
  }));
  const sparks = new THREE.Mesh(sparkGeometry, sparkMaterial);
  sparks.frustumCulled = false; sparks.renderOrder = 40; group.add(sparks);

  const fragmentGeometry = keep(new THREE.BoxGeometry(.14, .085, .055));
  const fragmentMaterial = keep(new THREE.MeshStandardMaterial({ color: 0x4c5548, metalness: .62, roughness: .38,
    emissive: 0xdd4916, emissiveIntensity: 1.4 }));
  const fragmentCount = 28;
  const fragments = new THREE.InstancedMesh(fragmentGeometry, fragmentMaterial, fragmentCount);
  fragments.frustumCulled = false;
  group.add(fragments);
  const fragmentPlans = [];
  for (let i = 0; i < fragmentCount; i++) {
    const angle = random() * Math.PI * 2, speed = 3.8 + random() * 5.8;
    fragmentPlans.push({ x: (random() - .5) * 2.8, y: (random() - .5) * .55,
      vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed * .7 + 3.7, vz: (random() - .5) * 5,
      rx: random() * 6, ry: random() * 6, rz: random() * 6, size: .4 + random() * 1.1 });
  }
  const dummy = new THREE.Object3D();

  const flareMaterial = keep(new THREE.ShaderMaterial({
    vertexShader: billboardVertex,
    uniforms: { uOpacity: { value: 0 } },
    fragmentShader: `varying vec2 vUv;uniform float uOpacity;
      void main() {
        vec2 p=vUv*2.-1.;
        float line=exp(-p.y*p.y*5400.)*pow(max(0.,1.-abs(p.x)),.5);
        float halo=exp(-dot(p*vec2(8.,1.8),p*vec2(8.,1.8)))*.22;
        float core=exp(-dot(p*vec2(24.,3.),p*vec2(24.,3.)))*.9;
        float ghost=exp(-pow((length((p-vec2(.42,.02))*vec2(7.,1.))- .30)*17.,2.))*.08;
        vec3 color=mix(vec3(1.5,.36,.035),vec3(5.5,3.8,1.2),core);
        gl_FragColor=vec4(color,(line+halo+core+ghost)*uOpacity);
      }`,
    transparent: true, depthTest: false, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false
  }));
  const flare = new THREE.Mesh(planeGeometry, flareMaterial);
  flare.scale.set(12, 1.9, 1); flare.position.z = 2.5; flare.renderOrder = 80; group.add(flare);
  const ignitionMaterial = keep(new THREE.ShaderMaterial({
    vertexShader: billboardVertex, uniforms: { uOpacity: { value: 0 } },
    fragmentShader: `varying vec2 vUv;uniform float uOpacity;
      void main(){vec2 p=vUv*2.-1.;float glow=exp(-dot(p,p)*2.6);
        gl_FragColor=vec4(vec3(3.8,2.4,.8),glow*uOpacity);}`,
    transparent: true, depthTest: false, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false
  }));
  const ignition = new THREE.Mesh(planeGeometry, ignitionMaterial);
  ignition.position.z = 2.7; ignition.scale.setScalar(6); ignition.renderOrder = 79; group.add(ignition);
  const light = new THREE.PointLight(0xff9341, 0, 17, 2);
  light.position.set(0, .35, 1.8); group.add(light);

  function finish() {
    active = false; group.visible = false; shake.set(0, 0); light.intensity = 0;
  }
  function start() {
    if (disposed) return;
    active = true; group.visible = true; shake.set(0, 0);
    update(0);
  }
  function update(ageSeconds, { phone = false } = {}) {
    if (!active || disposed) return false;
    const age = Math.max(0, ageSeconds);
    if (age >= 5.8) { finish(); return false; }
    const growth = 1 - Math.exp(-age * 7.2);
    const fireFade = 1 - smooth((age - 1.15) / 1.10);
    fire.visible = fireFade > .001;
    fire.position.set(-age * .055, age * .68, .8);
    fire.scale.set(Math.max(.001, growth * (4.4 + age * .17)),
      Math.max(.001, growth * (4.15 + age * .24)), 1);
    fire.quaternion.copy(camera.quaternion);
    fireMaterial.uniforms.uTime.value = age;
    fireMaterial.uniforms.uOpacity.value = fireFade * .99;
    fireMaterial.uniforms.uCooling.value = smooth((age - .52) / 1.55);
    fireMaterial.uniforms.uSteps.value = phone ? 10 : 14;
    for (let i = 0; i < smoke.length; i++) {
      const puff = smoke[i], t = Math.max(0, age - puff.birth);
      const build = smooth(t / .48), fade = 1 - smooth((age - 2.4) / 2.1);
      puff.mesh.visible = age >= puff.birth && fade > .001 && (!phone || i < 5);
      puff.mesh.position.set(puff.x * (1 - Math.exp(-t * 2.8)), puff.y + t * (1.1 + i * .035), puff.z);
      puff.mesh.scale.setScalar(puff.size * (1 + t * .37));
      puff.mesh.quaternion.copy(camera.quaternion);
      puff.mesh.rotateZ(t * (i % 2 ? .04 : -.04));
      const uniforms = puff.mesh.material.uniforms;
      uniforms.uTime.value = t; uniforms.uOpacity.value = build * fade * .78;
      uniforms.uHeat.value = Math.exp(-t * 1.35) * 1.8;
      uniforms.uSteps.value = phone ? 7 : 10;
    }
    for (let i = 0; i < waves.length; i++) {
      const wave = waves[i], t = Math.max(0, age - .08 - i * .075);
      const lifetime = i ? 1.8 : .88;
      wave.visible = age > .08 + i * .075 && t < lifetime;
      wave.position.set(0, i ? -.62 + i * .04 : .25, i ? -.2 : 1.25);
      wave.scale.setScalar(.3 + t * (i ? 6.8 : 13));
      if (!i) { wave.quaternion.copy(camera.quaternion); wave.scale.y *= .78; }
      wave.material.uniforms.uOpacity.value = (1 - smooth(t / lifetime)) * (i ? .49 : .85);
      wave.material.uniforms.uTime.value = t;
    }
    sparkMaterial.uniforms.uTime.value = age;
    sparkMaterial.uniforms.uPhone.value = phone ? 1 : 0;
    fragments.visible = age < 3.1;
    fragmentMaterial.emissiveIntensity = 1.9 * Math.exp(-age * 1.45);
    for (let i = 0; i < fragmentCount; i++) {
      const plan = fragmentPlans[i], t = Math.max(0, age - .055);
      dummy.position.set(plan.x + plan.vx * t, plan.y + plan.vy * t - 3.7 * t * t, plan.vz * t);
      dummy.rotation.set(plan.rx + t * 5, plan.ry + t * 4, plan.rz + t * 3);
      const scale = (phone && i > 17 ? 0 : plan.size) * (1 - smooth((age - 1.9) / 1.1));
      dummy.scale.setScalar(Math.max(0, scale)); dummy.updateMatrix();
      fragments.setMatrixAt(i, dummy.matrix);
    }
    fragments.instanceMatrix.needsUpdate = true;
    flare.quaternion.copy(camera.quaternion);
    ignition.quaternion.copy(camera.quaternion);
    flareMaterial.uniforms.uOpacity.value = smooth(age / .035) * Math.exp(-age * 2.25) * 1.12;
    // A single rounded exposure bloom; never repeated flashes or a hard white cut.
    ignitionMaterial.uniforms.uOpacity.value = Math.sin(Math.PI * clamp(age / .19)) * .54;
    light.intensity = 48 * smooth(age / .045) * Math.exp(-age * 2.9)
      + .75 * smooth((age - 2.7) / .3) * (1 - smooth((age - 4.45) / .55));
    const jolt = smooth(age / .07) * Math.exp(-age * 3.1) * (phone ? .042 : .075);
    shake.set((Math.sin(age * 43) + Math.sin(age * 69) * .3) * jolt,
      (Math.sin(age * 51 + .3) + Math.cos(age * 31) * .27) * jolt * .65);
    return true;
  }
  function dispose() {
    if (disposed) return;
    finish(); disposed = true; scene.remove(group);
    resources.forEach(resource => resource.dispose()); resources.clear();
  }
  return { start, update, finish, dispose, shake };
}
