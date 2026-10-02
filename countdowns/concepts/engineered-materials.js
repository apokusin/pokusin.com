// Local, deterministic physical surfaces for the two engineered installations.
// Reflections live in the environment, never painted into a metal's albedo.
export function engineeredMaterials(T, resources) {
  let seed = 481903;
  const random = () => { seed = seed * 16807 % 2147483647; return (seed - 1) / 2147483646; };
  const canvas = () => { const c = document.createElement('canvas'); c.width = c.height = 512; return c; };
  function surface(kind, base, roughness, metalness = 0, repeat = 1) {
    const albedo = canvas(), relief = canvas(), rough = canvas();
    const ac = albedo.getContext('2d'), bc = relief.getContext('2d'), rc = rough.getContext('2d');
    ac.fillStyle = base; ac.fillRect(0, 0, 512, 512);
    bc.fillStyle = '#888'; bc.fillRect(0, 0, 512, 512);
    rc.fillStyle = `rgb(${roughness * 255},${roughness * 255},${roughness * 255})`; rc.fillRect(0, 0, 512, 512);
    const metal = kind === 'brushed';
    for (let i = 0; i < (metal ? 1900 : 22000); i++) {
      const x = random() * 512, y = random() * 512;
      if (metal) {
        const len = 4 + random() * 110, alpha = .008 + random() * .015;
        ac.fillStyle = `rgba(${random() > .5 ? '255,255,255' : '20,27,32'},${alpha})`; ac.fillRect(x, y, len, .35);
        bc.fillStyle = `rgba(${random() > .5 ? '225,225,225' : '30,30,30'},.12)`; bc.fillRect(x, y, len, .45);
        rc.fillStyle = `rgba(255,255,255,${random() * .035})`; rc.fillRect(x, y, len, .5);
      } else {
        const size = .35 + random() * (kind === 'asphalt' ? 3.6 : kind === 'slate' ? 3.8 : 2.3);
        const light = random() > .44;
        ac.fillStyle = `rgba(${light ? '255,247,230' : '29,27,24'},${kind === 'rubber' ? .09 : .035 + random() * .15})`;
        ac.beginPath(); ac.ellipse(x, y, size, size * (.35 + random() * .5), random() * 3, 0, Math.PI * 2); ac.fill();
        bc.fillStyle = light ? '#b7b7b7' : '#3c3c3c'; bc.fillRect(x, y, size, size * .6);
        rc.fillStyle = light ? 'rgba(255,255,255,.22)' : 'rgba(0,0,0,.08)'; rc.fillRect(x, y, size, size);
      }
    }
    if (kind === 'concrete' || kind === 'slate') {
      // Cement laitance/cast seams versus long mineral cleavage: visibly different scales.
      for (let i = 0; i < (kind === 'slate' ? 29 : 11); i++) {
        const y = random() * 512, start = random() * 170;
        ac.strokeStyle = kind === 'slate' ? 'rgba(208,210,196,.22)' : 'rgba(100,70,48,.055)';
        ac.lineWidth = kind === 'slate' ? .6 + random() * 1.8 : 1 + random() * 5;
        ac.beginPath(); ac.moveTo(start, y);
        for (let x = start; x < 512; x += 22) ac.lineTo(x, y + Math.sin(x * .03 + i) * (kind === 'slate' ? 9 : 3));
        ac.stroke();
        if (kind === 'slate') { bc.strokeStyle = '#555'; bc.lineWidth = 1; bc.beginPath(); bc.moveTo(start, y); bc.lineTo(512, y + 8); bc.stroke(); }
      }
      if (kind === 'concrete') {
        for(let i=0;i<64;i++) {
          const x=random()*512,y=random()*512,r=12+random()*55,g=ac.createRadialGradient(x,y,0,x,y,r);
          g.addColorStop(0,i%3?'rgba(87,61,44,.08)':'rgba(255,246,218,.14)');g.addColorStop(1,'rgba(130,100,72,0)');ac.fillStyle=g;ac.fillRect(x-r,y-r,r*2,r*2);
        }
        for(let i=0;i<120;i++) {
          const x=random()*512,y=random()*512,r=.8+random()*2.9;
          ac.fillStyle='rgba(73,58,45,.18)';ac.beginPath();ac.ellipse(x,y,r,r*.67,random()*3,0,Math.PI*2);ac.fill();
          bc.fillStyle='#4b4b4b';bc.beginPath();bc.ellipse(x,y,r,r*.67,0,0,Math.PI*2);bc.fill();
          ac.strokeStyle='rgba(255,244,218,.2)';ac.lineWidth=.7;ac.beginPath();ac.arc(x,y,r,.1,2);ac.stroke();
        }
      }
    }
    if (kind === 'rubber') {
      bc.strokeStyle = '#5e5e5e'; bc.lineWidth = 1.2;
      for (let x = -512; x < 1024; x += 21) { bc.beginPath(); bc.moveTo(x, 0); bc.lineTo(x + 256, 512); bc.stroke(); }
    }
    const texture = (c, color = false) => {
      const t = new T.CanvasTexture(c); t.wrapS = t.wrapT = T.RepeatWrapping; t.repeat.set(repeat, repeat);
      if (color) t.colorSpace = T.SRGBColorSpace; t.anisotropy = 4; resources.push(t); return t;
    };
    const m = new T.MeshPhysicalMaterial({ color: '#ffffff', map: texture(albedo, true), bumpMap: texture(relief), roughnessMap: texture(rough), roughness: 1, metalness, bumpScale: metal ? .001 : kind === 'slate' ? .09 : kind === 'asphalt' ? .027 : .024 });
    if (metal) { m.anisotropy = .52; m.anisotropyRotation = 0; m.envMapIntensity = 1.1; }
    resources.push(m); return m;
  }
  const simple = (color, roughness, metalness = 0, extra = {}) => {
    const m = new T.MeshPhysicalMaterial({ color, roughness, metalness, ...extra }); resources.push(m); return m;
  };
  return { surface, simple, random };
}

export function studioEnvironment(T, renderer, scene, resources, mode = 'steel') {
  const room = new T.Scene();
  room.background = new T.Color(mode === 'steel' ? '#151a1e' : '#6a899e');
  const owned = [];
  function panel(color, w, h, d, x, y, z, ry = 0) {
    const geo = new T.BoxGeometry(w, h, d), mat = new T.MeshBasicMaterial({ color });
    const mesh = new T.Mesh(geo, mat); mesh.position.set(x, y, z); mesh.rotation.y = ry; room.add(mesh); owned.push(geo, mat);
  }
  // Large windows, black flags and a warm bounce card create actual moving reflections.
  if (mode === 'steel') {
    panel('#faf9ee', 5.7, 9, .12, -1.1, -.5, 7.8, .13);
    panel('#e3e7e7', 2.3, 9, .12, -6, 1.0, 5.5, .45);
    panel('#cedee9', .8, 10, .12, 4.3, 1.0, 5.8, -.32);
    // The tilted weight reflects upward, unlike frontal clock plates.
    panel('#fafbf6', 5.5, .08, 8, -2, 9, 4);
    panel('#d2d1c6', 16, .1, 16, 0, -4, 0);
    panel('#60686e', 1.6, 10, .15, .65, -.2, 6.2, 0);
    panel('#131b21', .55, 10, .15, -2.3, -.2, 6.3, -.1);
    panel('#40484c', 13, 7, .15, 0, 2, -8);
  } else {
    panel('#f9e2bf', 12, 7, .15, -6, 6, 9, .45);
    panel('#aac5d9', 12, 6, .15, 6, 6, -8, -.3);
    panel('#b68568', 16, .1, 16, 0, -5, 0);
  }
  try {
    const generator = new T.PMREMGenerator(renderer), target = generator.fromScene(room, .04, .1, 100);
    scene.environment = target.texture; resources.push(target); generator.dispose();
  } catch { scene.environment = null; }
  for (const item of owned) item.dispose();
}

export function contactDisc(T, resources, parent, x, y, z, sx, sz, opacity = .22) {
  const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d');
  const gradient = g.createRadialGradient(64, 64, 3, 64, 64, 64); gradient.addColorStop(0, `rgba(12,15,15,${opacity})`); gradient.addColorStop(.42, `rgba(12,15,15,${opacity * .65})`); gradient.addColorStop(1, 'rgba(12,15,15,0)');
  g.fillStyle = gradient; g.fillRect(0, 0, 128, 128);
  const texture = new T.CanvasTexture(c), material = new T.MeshBasicMaterial({ map: texture, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 }), geometry = new T.PlaneGeometry(sx, sz);
  const mesh = new T.Mesh(geometry, material); mesh.rotation.x = -Math.PI / 2; mesh.position.set(x, y, z); parent.add(mesh); resources.push(texture, material, geometry); return mesh;
}
