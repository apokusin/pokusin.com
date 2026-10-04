export async function create(ctx) {
 const { engineeredMaterials, studioEnvironment, contactDisc } = await import(`./engineered-materials.js?v=${document.documentElement.dataset.artVersion || '1'}`);
  const T = ctx.THREE;
  const scene = ctx.scene;
  scene.background = null;
  const world = new T.Group();
  ctx.root.add(world);
  const resources = [];
  const mat = (color, roughness = .85, extra = {}) => { const m = new T.MeshStandardMaterial({ color, roughness, ...extra }); resources.push(m); return m; };
  const surfaces = engineeredMaterials(T, resources);
  const concrete = surfaces.surface('concrete', '#cbae94', .87);
  const asphalt = surfaces.surface('asphalt', '#245ba9', .79, 0, .75);
  const orange = surfaces.surface('paint', '#ee6e25', .39, .2);
  orange.clearcoat = .22; orange.clearcoatRoughness = .32;
  const black = surfaces.surface('rubber', '#20201d', .94, 0, 2);
  const enamel = surfaces.surface('paint', '#222320', .72);
  const cream = surfaces.surface('paint', '#f5dfb8', .73);
  const steel = surfaces.simple('#788a95', .36, .78);
  const yellow = surfaces.surface('paint', '#d1d640', .55);
  const underside = surfaces.surface('asphalt', '#173966', .9, 0, 3);
  studioEnvironment(T, ctx.renderer, scene, resources, 'road');
  scene.environmentIntensity = .43;
  ctx.renderer.toneMappingExposure = 1.04;
  function mesh(geometry, material, parent = world) { resources.push(geometry); const m = new T.Mesh(geometry, material); m.castShadow = true; m.receiveShadow = true; parent.add(m); return m; }
  function box(w,h,d,material,x=0,y=0,z=0,parent=world) { const m=mesh(new T.BoxGeometry(w,h,d),material,parent);m.position.set(x,y,z);return m; }
  function cylinder(r1,r2,h,material,x=0,y=0,z=0,parent=world,n=16) {const m=mesh(new T.CylinderGeometry(r1,r2,h,n),material,parent);m.position.set(x,y,z);return m;}
  const rand = surfaces.random;
  const key = new T.DirectionalLight('#ffecd0', 2.9);
  key.position.set(-8, 14, 9); key.castShadow = true;
  key.shadow.mapSize.set(ctx.mobile ? 1024 : 2048, ctx.mobile ? 1024 : 2048);
  Object.assign(key.shadow.camera, {left:-14,right:14,top:14,bottom:-14,near:1,far:45});
  key.shadow.bias=-.0007; key.shadow.normalBias=.035;
  const rim = new T.DirectionalLight('#c4d9ef', .45); rim.position.set(9, 8, -7);
  world.add(key, rim, new T.HemisphereLight('#d1e1ee', '#9f7458', .58));
  function rounded(w, h, d, material, x, y, z, parent, radius = .12) {
    const shape = new T.Shape(), l=-w/2, r=w/2, bottom=-h/2, top=h/2;
    shape.moveTo(l+radius,bottom); shape.lineTo(r-radius,bottom); shape.quadraticCurveTo(r,bottom,r,bottom+radius);
    shape.lineTo(r,top-radius); shape.quadraticCurveTo(r,top,r-radius,top); shape.lineTo(l+radius,top);
    shape.quadraticCurveTo(l,top,l,top-radius); shape.lineTo(l,bottom+radius); shape.quadraticCurveTo(l,bottom,l+radius,bottom);
    const geo=new T.ExtrudeGeometry(shape,{depth:d-.045,bevelEnabled:true,bevelSize:.025,bevelThickness:.025,bevelSegments:2,curveSegments:5});
    const uv=geo.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)/w+.5,uv.getY(i)/h+.5);
    if(material===concrete){const p=geo.attributes.position;for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),n=(Math.sin(x*39+y*23)+Math.sin(x*17-y*53))*.009;p.setXYZ(i,x+n,y+n*.65,p.getZ(i));}geo.computeVertexNormals();}
    const o=mesh(geo,material,parent);o.position.set(x,y,z-d/2);return o;
  }
  const ground=box(50,.2,45,concrete,0,-.55,0);ground.castShadow=false;const shadowMaterial=new T.ShadowMaterial({opacity:.22});resources.push(shadowMaterial);ground.material=shadowMaterial;
  const terrain=new T.Group();world.add(terrain);
  const rockGeo=new T.IcosahedronGeometry(1,2);resources.push(rockGeo);
  const rp=rockGeo.attributes.position;
  for(let i=0;i<rp.count;i++){const x=rp.getX(i),y=rp.getY(i),z=rp.getZ(i),n=Math.sin(x*8+y*13+z*11)*.055;rp.setXYZ(i,x*(1+n),y*(1+n*2),z*(1+n));}rockGeo.computeVertexNormals();
  const rockMats=['#d1a081','#c28b6b','#b77e62'].map(c=>surfaces.surface('slate',c,.97));
  for(let i=0;i<22;i++){const rock=new T.Mesh(rockGeo,rockMats[i%3]);rock.position.set((rand()-.5)*27,-.25,(rand()-.5)*20);rock.scale.set(.3+rand()*.65,.18+rand()*.55,.25+rand()*.65);rock.rotation.set(rand(),rand()*6,rand());rock.castShadow=true;rock.receiveShadow=true;terrain.add(rock);}
  const routeDesktop=new T.Group(), routeMobile=new T.Group();world.add(routeDesktop,routeMobile);
  function road(points,width,parent) {
    const curve=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p)));const samples=curve.getPoints(96);const positions=[],indices=[],uvs=[];let distance=0;
    for(let i=0;i<samples.length;i++){const p=samples[i],t=curve.getTangent(i/(samples.length-1)),side=new T.Vector3(-t.z,0,t.x).normalize();if(side.length()<.1)side.set(1,0,0);
      if(i)distance+=p.distanceTo(samples[i-1]);uvs.push(0,distance, width,distance);
      positions.push(p.x-side.x*width/2,p.y,p.z-side.z*width/2,p.x+side.x*width/2,p.y,p.z+side.z*width/2);
      if(i<samples.length-1){const a=i*2;indices.push(a,a+1,a+2,a+1,a+3,a+2);}
    }
    const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(positions,3));g.setAttribute('uv',new T.Float32BufferAttribute(uvs,2));g.setIndex(indices);g.computeVertexNormals();const r=mesh(g,asphalt,parent);const bottom=g.clone();bottom.translate(0,-.13,0);mesh(bottom,underside,parent).material.side=T.DoubleSide;
    const dashGeometry=new T.BoxGeometry(.04,.018,.2),postGeometry=new T.BoxGeometry(.035,.19,.035);resources.push(dashGeometry,postGeometry);const dashes=new T.InstancedMesh(dashGeometry,cream,25),posts=new T.InstancedMesh(postGeometry,yellow,34);parent.add(dashes,posts);const dummy=new T.Object3D();let di=0,pi=0;
    for(let i=0;i<=96;i+=4){const p=samples[i],t=curve.getTangent(i/96);dummy.position.set(p.x,p.y+.025,p.z);dummy.rotation.set(0,Math.atan2(t.x,t.z),0);dummy.updateMatrix();dashes.setMatrixAt(di++,dummy.matrix);}
    const sides=[[],[]];for(let i=0;i<=96;i+=6){const p=samples[i],t=curve.getTangent(i/96),side=new T.Vector3(-t.z,0,t.x).normalize();for(const sign of [-1,1]){dummy.position.set(p.x+side.x*width*.52*sign,p.y+.1,p.z+side.z*width*.52*sign);dummy.rotation.set(0,0,0);dummy.updateMatrix();posts.setMatrixAt(pi++,dummy.matrix);sides[sign===-1?0:1].push(new T.Vector3(dummy.position.x,p.y+.19,dummy.position.z));}}
    for(const points of sides)mesh(new T.TubeGeometry(new T.CatmullRomCurve3(points),72,.018,4,false),steel,parent);
    const wallPositions=[],wallIndices=[],wallUvs=[];for(const sign of [-1,1]){const offset=wallPositions.length/3;for(let i=0;i<samples.length;i++){const p=samples[i],t=curve.getTangent(i/(samples.length-1)),side=new T.Vector3(-t.z,0,t.x).normalize();wallUvs.push(i*.16,0,i*.16,.13);wallPositions.push(p.x+side.x*width*.5*sign,p.y-.006,p.z+side.z*width*.5*sign,p.x+side.x*width*.5*sign,p.y-.13,p.z+side.z*width*.5*sign);if(i<samples.length-1){const j=offset+i*2;wallIndices.push(j,j+1,j+2,j+1,j+3,j+2);}}}const wallGeometry=new T.BufferGeometry();wallGeometry.setAttribute('position',new T.Float32BufferAttribute(wallPositions,3));wallGeometry.setAttribute('uv',new T.Float32BufferAttribute(wallUvs,2));wallGeometry.setIndex(wallIndices);wallGeometry.computeVertexNormals();mesh(wallGeometry,asphalt,parent).material.side=T.DoubleSide;
    return {curve,mesh:r};
  }
  const mainRoad=road([[-9,.1,8],[-5,.2,5],[-3,.3,2],[1,.7,3],[5,1.2,2],[4,1.7,-1],[1,2.3,-2]],1.35,routeDesktop);
  const loopPoints=[];for(let i=0;i<=20;i++){const a=i/20*Math.PI*3.8;loopPoints.push([3.7+Math.cos(a)*2.5,1.8+i*.13,-2+Math.sin(a)*1.7]);}road(loopPoints,1.15,routeDesktop);
  for(let i=2;i<loopPoints.length-1;i+=4){const p=loopPoints[i],height=p[1]+.55;cylinder(.25,.30,height,concrete,p[0],(p[1]-.55)/2,p[2],routeDesktop,12);box(.72,.16,.78,concrete,p[0],p[1]-.2,p[2],routeDesktop);contactDisc(T,resources,routeDesktop,p[0],-.43,p[2],1.4,1.4,.22);}
  road([[-2,-4.8,3],[1.6,-3.4,2],[-1.6,-1.6,3],[1.5,.1,2],[-1.5,2,3],[1.4,3.8,2],[0,5.4,2]],1.0,routeMobile);
  for(let i=0;i<8;i++){const p=mainRoad.curve.getPoint(i/7);cylinder(.18,.23,p.y+.6,concrete,p.x,(p.y-.6)/2,p.z,routeDesktop,12);box(.48,.12,.57,concrete,p.x,p.y-.16,p.z,routeDesktop);}
  const clock=new T.Group();world.add(clock);rounded(6.65,2.6,.44,concrete,0,0,0,clock,.18);rounded(6.18,2.14,.08,enamel,0,0,.27,clock,.12);
  for(const x of [-3.04,3.04])for(const y of [-1.03,1.03]){const bolt=cylinder(.042,.042,.023,steel,x,y,.329,clock,6);bolt.rotation.x=Math.PI/2;}
  for(const x of [-2.28,-.76,.76,2.28]){rounded(1.34,1.43,.055,black,x,-.02,.343,clock,.07);}

  for(const x of [-2.2,2.2]){cylinder(.12,.14,2.9,asphalt,x,-2.4,0,clock);box(.54,.22,.7,concrete,x,-3.7,0,clock);}
  const glowMaterials=[];for(const x of [-2.4,0,2.4]){const lamp=cylinder(.22,.12,.18,black,x,1.43,.2,clock);lamp.rotation.x=.2;const glow=mesh(new T.CircleGeometry(.13,16),mat('#fff0b8',.7,{emissive:'#ffde87',emissiveIntensity:.5}),clock);glowMaterials.push(glow.material);glow.position.set(x,1.31,.25);glow.rotation.x=-Math.PI/2;}
  const clockPin=new T.Object3D();clockPin.position.set(0,-.04,.34);clock.add(clockPin);ctx.pin(ctx.dom.clock,clockPin,{width:5.92});
  const pillar=new T.Group();world.add(pillar);rounded(1.55,2.5,.6,concrete,0,0,0,pillar,.08);const cap=cylinder(.59,.64,.25,orange,0,.38,.45,pillar,32);cap.rotation.x=Math.PI/2;const resetPin=new T.Object3D();resetPin.position.set(0,.38,.65);pillar.add(resetPin);ctx.pin(ctx.dom.reset,resetPin,{width:1.15});
  const tallyPin=new T.Object3D();tallyPin.position.set(0,-.73,.36);pillar.add(tallyPin);ctx.pin(ctx.dom.tally,tallyPin,{width:.95});
  for(const x of [-.4,.4])cylinder(.055,.055,1.8,steel,x,-2.1,0,pillar);
  const mounts=[];
  function strut(start,end,material,parent,radius=.025){const av=new T.Vector3(...start),bv=new T.Vector3(...end),v=bv.clone().sub(av);const o=cylinder(radius,radius,v.length(),material,0,0,0,parent,8);o.position.copy(av).add(bv).multiplyScalar(.5);o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),v.normalize());return o;}
  function workLamp(parent,x,y,z){
    const hood=cylinder(.11,.23,.16,enamel,x,y,z,parent,20);hood.rotation.x=.3;
    const disc=mesh(new T.CircleGeometry(.16,20),mat('#ffe4a2',.5,{emissive:'#ffd485',emissiveIntensity:1.7}),parent);disc.position.set(x,y-.055,z+.09);disc.rotation.x=-1.24;
    strut([x,y,z],[x,y-.27,z-.19],steel,parent,.025);
    const light=new T.PointLight('#ffd79b',1.65,2.9,2);light.position.set(x,y-.06,z+.19);parent.add(light);
  }

  ctx.mounts.forEach((card,i)=>{const group=new T.Group();world.add(group);for(const x of [-1.64,1.64])box(.075,2.0,.12,cream,x,0,0,group);for(const y of [-.96,.96])box(3.35,.075,.12,cream,0,y,0,group);for(const x of [-1.1,1.1]){box(.09,1.8,.12,steel,x,-1.8,-.11,group);box(.36,.12,.4,concrete,x,-2.64,-.11,group);contactDisc(T,resources,group,x,-2.699,-.11,.8,.8,.32);}strut([-1.1,-2.54,-.11],[1.1,-1.02,-.11],steel,group,.029);strut([1.1,-2.54,-.11],[-1.1,-1.02,-.11],steel,group,.029);box(2.32,.085,.10,steel,0,-2.54,-.11,group);for(const x of [-.95,.95])workLamp(group,x,1.16,.2);box(3.45,.08,.19,cream,0,1,0,group);const pin=new T.Object3D();pin.position.set(0,-.04,.16);group.add(pin);ctx.pin(card,pin,{width:3.14});mounts.push(group);});
  // The clock's recessed enamel receives the same warm work light as each real billboard.
  for(const x of [-2.4,0,2.4]){const l=new T.PointLight('#ffd79b',2.0,3.8,2);l.position.set(x,1.34,.72);clock.add(l);strut([x,1.45,.18],[x,1.25,-.05],steel,clock,.028);}
  const crane=new T.Group();world.add(crane);box(.18,6.45,.18,orange,4.7,3.2,-2.4,crane);box(5.4,.13,.15,orange,2.2,6.4,-2.4,crane);for(let i=0;i<11;i++){const y=i*.55;strut([4.47,y,-2.4],[4.93,y+.55,-2.4],orange,crane,.023);strut([4.93,y,-2.4],[4.47,y+.55,-2.4],orange,crane,.023);}for(const x of [4.47,4.93])box(.055,6.45,.055,orange,x,3.2,-2.4,crane);for(let i=0;i<10;i++){const x=-.5+i*.54;strut([x,6.4,-2.4],[x+.54,6.85,-2.4],orange,crane,.022);strut([x+.54,6.4,-2.4],[x,6.85,-2.4],orange,crane,.022);}box(5.4,.055,.055,orange,2.2,6.85,-2.4,crane);box(.65,.4,.8,concrete,4.7,.0,-2.4,crane);
  const roll=new T.Group();roll.position.set(3.25,5.55,-2.4);crane.add(roll);const drum=cylinder(.44,.44,1.25,asphalt,0,0,0,roll,32);drum.rotation.z=Math.PI/2;const inner=cylinder(.19,.19,1.27,black,0,0,0,roll);inner.rotation.z=Math.PI/2;for(const x of [-.63,.63])for(const radius of [.23,.31,.40]){const layer=mesh(new T.TorusGeometry(radius,.015,5,32),cream,roll);layer.rotation.y=Math.PI/2;layer.position.x=x;}
  for(const x of [-.43,.43]){const cable=box(.016,.9,.016,steel,roll.position.x+x,6.0,-2.4,crane);cable.castShadow=false;}
  const stripCurve=new T.CatmullRomCurve3([[3.25,5.11,-2.4],[3.28,4.74,-2.25],[4.36,4.42,-2.55],loopPoints.at(-1)].map(p=>new T.Vector3(...p)));
  const stripGeometry=new T.BufferGeometry(),stripPositions=new Float32Array(49*6),stripUvs=[],stripIndices=[];for(let i=0;i<49;i++)stripUvs.push(0,i*.055,1.25,i*.055);stripGeometry.setAttribute('position',new T.BufferAttribute(stripPositions,3));for(let i=0;i<48;i++){const a=i*2;stripIndices.push(a,a+1,a+2,a+1,a+3,a+2);}stripGeometry.setAttribute('uv',new T.Float32BufferAttribute(stripUvs,2));stripGeometry.setIndex(stripIndices);const stripMaterial=asphalt.clone();stripMaterial.side=T.DoubleSide;resources.push(stripMaterial);const strip=mesh(stripGeometry,stripMaterial,crane);
  const stripDashGeometry=new T.BoxGeometry(.045,.025,.18);resources.push(stripDashGeometry);const stripDashes=new T.InstancedMesh(stripDashGeometry,cream,9);crane.add(stripDashes);const stripDummy=new T.Object3D(),stripPoint=new T.Vector3(),stripTangent=new T.Vector3(),stripSide=new T.Vector3(),stripAhead=new T.Vector3(),stripY=new T.Vector3(0,0,1);
  function ribbonPoint(u,flex,target){stripCurve.getPoint(u,target);const envelope=Math.sin(Math.PI*u);target.y-=flex*envelope*.13;target.z+=flex*envelope*.2;return target;}
  function setRibbon(flex){for(let i=0;i<49;i++){const u=i/48;ribbonPoint(u,flex,stripPoint);ribbonPoint(Math.min(1,u+.002),flex,stripAhead);if(i===48){ribbonPoint(u-.002,flex,stripAhead);stripTangent.subVectors(stripPoint,stripAhead);}else stripTangent.subVectors(stripAhead,stripPoint);stripTangent.normalize();stripSide.set(-stripTangent.z,0,stripTangent.x).normalize();stripPositions.set([stripPoint.x-stripSide.x*.625,stripPoint.y,stripPoint.z-stripSide.z*.625,stripPoint.x+stripSide.x*.625,stripPoint.y,stripPoint.z+stripSide.z*.625],i*6);}stripGeometry.attributes.position.needsUpdate=true;stripGeometry.computeVertexNormals();for(let i=0;i<9;i++){const u=(i+.5)/9;ribbonPoint(u,flex,stripPoint);ribbonPoint(Math.min(1,u+.002),flex,stripAhead);stripTangent.subVectors(stripAhead,stripPoint).normalize();stripDummy.position.copy(stripPoint);stripDummy.position.z+=.017;stripDummy.quaternion.setFromUnitVectors(stripY,stripTangent);stripDummy.updateMatrix();stripDashes.setMatrixAt(i,stripDummy.matrix);}stripDashes.instanceMatrix.needsUpdate=true;}
  setRibbon(0);let ribbonFlex=0;
  const crownPin=new T.Object3D();crownPin.position.set(.59,-.15,.4);roll.add(crownPin);ctx.pin(ctx.dom.secretButton,crownPin,{width:.32});
  const crownShape=new T.Shape();crownShape.moveTo(-.13,-.06);crownShape.lineTo(-.16,.09);crownShape.lineTo(-.06,.04);crownShape.lineTo(0,.16);crownShape.lineTo(.06,.04);crownShape.lineTo(.16,.09);crownShape.lineTo(.13,-.06);crownShape.closePath();const crown=mesh(new T.ShapeGeometry(crownShape),yellow,roll);crown.position.set(.57,-.16,.34);crown.visible=false;
  function truck() {const g=new T.Group();box(.65,.18,.35,orange,0,.16,0,g);box(.22,.35,.32,orange,.2,.3,0,g);box(.03,.12,.28,black,.32,.4,0,g);for(const x of [-.22,.21])for(const z of [-.18,.18]){const w=cylinder(.095,.095,.04,black,x,.08,z,g,10);w.rotation.x=Math.PI/2;}return g;}
  const roller=new T.Group();world.add(roller);roller.position.set(-5.2,.2,6.2);box(.85,.26,.55,orange,0,.25,0,roller);box(.27,.37,.4,orange,.15,.52,0,roller);box(.36,.035,.49,black,.15,.77,0,roller);for(const x of [.015,.285])for(const z of [-.21,.21])box(.025,.29,.025,black,x,.61,z,roller);const rollerDrum=cylinder(.28,.28,.62,steel,-.39,.2,0,roller,24);rollerDrum.rotation.x=Math.PI/2;for(const z of [-.29,.29]){const wheel=cylinder(.17,.17,.055,black,.34,.16,z,roller,16);wheel.rotation.x=Math.PI/2;const hub=cylinder(.073,.073,.062,steel,.34,.16,z,roller,12);hub.rotation.x=Math.PI/2;}
  const movingTruck=truck();world.add(movingTruck);for(let i=0;i<3;i++){const g=truck();g.position.set(-5+i*3.5,.13,-1.5-i);g.rotation.y=i*.8;world.add(g);}
  function roadsideCones(curve,parent,count) {
    const coneGeo=new T.CylinderGeometry(.018,.10,.28,12),bandGeo=new T.CylinderGeometry(.052,.069,.054,12),baseGeo=new T.BoxGeometry(.22,.025,.22);
    resources.push(coneGeo,bandGeo,baseGeo);
    const cones=new T.InstancedMesh(coneGeo,orange,count),bands=new T.InstancedMesh(bandGeo,cream,count),bases=new T.InstancedMesh(baseGeo,black,count),dummy=new T.Object3D();parent.add(cones,bands,bases);
    for(let i=0;i<count;i++){const u=(i+.35)/count,p=curve.getPoint(u),t=curve.getTangent(u),side=new T.Vector3(-t.z,0,t.x).normalize();dummy.rotation.set(0,0,0);dummy.position.copy(p).addScaledVector(side,.5*(i%2?1:-1));dummy.position.y+=.16;dummy.updateMatrix();cones.setMatrixAt(i,dummy.matrix);dummy.position.y-=.025;dummy.updateMatrix();bands.setMatrixAt(i,dummy.matrix);dummy.position.y=p.y+.028;dummy.updateMatrix();bases.setMatrixAt(i,dummy.matrix);}
    cones.castShadow=bands.castShadow=true;
  }
  roadsideCones(mainRoad.curve,routeDesktop,15);
  let elapsed=99, remoteTime=99, pending=false, freeze=false, rollLift=0, rollTarget=0;
  ctx.on(ctx.dom.secretButton,'pointerenter',()=>{rollTarget=.25;ctx.wake();});ctx.on(ctx.dom.secretButton,'focus',()=>{rollTarget=.25;ctx.wake();});ctx.on(ctx.dom.secretButton,'pointerleave',()=>{rollTarget=0;ctx.wake();});ctx.on(ctx.dom.secretButton,'blur',()=>{rollTarget=0;ctx.wake();});
  const ray=new T.Raycaster(), pointer=new T.Vector2();let draggingRoll=false;
  ctx.on(ctx.canvas,'pointerdown',e=>{const b=ctx.canvas.getBoundingClientRect();pointer.set((e.clientX-b.left)/b.width*2-1,-((e.clientY-b.top)/b.height)*2+1);ray.setFromCamera(pointer,ctx.camera);if(ray.intersectObject(drum,false).length){draggingRoll=true;ctx.canvas.setPointerCapture(e.pointerId);rollTarget=.25;ctx.wake();}});
  ctx.on(ctx.canvas,'pointermove',e=>{if(draggingRoll){const b=ctx.canvas.getBoundingClientRect();rollTarget=Math.min(.35,Math.max(.05,(e.clientX-b.left)/b.width*.4));ctx.wake();}});
  for(const event of ['pointerup','pointercancel'])ctx.on(ctx.canvas,event,()=>{draggingRoll=false;rollTarget=0;ctx.wake();});
  ctx.on(window,'blur',()=>{draggingRoll=false;rollTarget=0;ctx.wake();});
  let mobile=false;
  function resize(){mobile=ctx.mobile;const w=Math.max(1,ctx.stage.clientWidth),h=Math.max(1,ctx.stage.clientHeight),span=mobile?3.65*h/w:Math.max(5.75,9.2*h/w),yAt=p=>1.1+(.5-p)*h/(w/7.3);routeDesktop.visible=!mobile;routeMobile.visible=mobile;routeMobile.scale.y=mobile?span/9.5:1;terrain.visible=!mobile;roller.visible=!mobile;ground.position.y=mobile?yAt(.96)-.5:-.55;clock.position.set(mobile?0:-3.5,mobile?yAt(.18):4.85,mobile?1.1:.4);clock.scale.setScalar(mobile?1:1.28);ctx.pin(ctx.dom.clock,clockPin,{width:5.92*(mobile?1:1.28)});pillar.position.set(mobile?1.35:1.8,mobile?yAt(.29):4.42,mobile?2.7:1.3);crane.position.set(mobile?-2.6:0,mobile?yAt(.34)-5.55*.63:0,mobile?2:0);crane.scale.setScalar(mobile?.63:1);
    const positions=mobile?[[0,yAt(.45),4],[0,yAt(.63),4],[0,yAt(.81),4]]:[[-5.15,1.0,4.2],[4.8,3.15,.1],[.9,1.05,4.1]];
    mounts.forEach((g,i)=>{g.position.set(...positions[i]);g.scale.setScalar(mobile?1.84:1.22);ctx.pin(ctx.mounts[i],g.children.find(o=>o.type==='Object3D'),{width:3.14*(mobile?1.84:1.22)});});
    ctx.fitCamera(span,[0,mobile?1.1:2.0,0],[0,mobile?3.1:8.7,23]);ctx.wake();
  }
  ctx.on(document,'visibilitychange',()=>{if(document.hidden){elapsed=99;remoteTime=99;draggingRoll=false;rollTarget=0;}});
  resize();
  return {resize,celebrate(){elapsed=document.hidden||freeze?99:0;ctx.wake();},pending(value){pending=value;ctx.wake();},overlay(value){freeze=value;draggingRoll=false;rollTarget=0;},remote(){remoteTime=0;ctx.wake();},animate(time,dt){if(freeze)return;elapsed+=dt;remoteTime+=dt;const reduced=ctx.reduced;for(const m of glowMaterials)m.emissiveIntensity=.5+(reduced?0:remoteTime<.6?Math.sin(remoteTime/.6*Math.PI)*.35:0);const press=pending?.15:elapsed<.25?.15*(1-elapsed/.25):0;cap.position.z=.45-press;rollLift=reduced?rollTarget:rollLift+(rollTarget-rollLift)*Math.min(1,dt*10);crown.visible=rollLift>.035;roll.rotation.x=rollLift;
      const active=!reduced&&elapsed>=.14&&elapsed<1.9;drum.rotation.x=active?-(elapsed-.14)*1.5:0;const flex=active?Math.sin((elapsed-.14)/1.76*Math.PI):0;if(Math.abs(flex-ribbonFlex)>.0001){ribbonFlex=flex;setRibbon(flex);}
      movingTruck.visible=!reduced&&elapsed>1.8&&elapsed<4.0&&!mobile;if(movingTruck.visible){const p=mainRoad.curve.getPoint(Math.min(1,.58+(elapsed-1.8)*.12));movingTruck.position.copy(p);movingTruck.position.y+=.025;const t=mainRoad.curve.getTangent(Math.min(1,.58+(elapsed-1.8)*.12));movingTruck.rotation.y=Math.atan2(-t.z,t.x);}
    },dispose(){scene.environment=null;scene.environmentIntensity=1;for(const r of resources)r.dispose?.();for(const el of [ctx.dom.clock,ctx.dom.reset,ctx.dom.tally,ctx.dom.secretButton,...ctx.mounts])ctx.unpin(el);}};
}
