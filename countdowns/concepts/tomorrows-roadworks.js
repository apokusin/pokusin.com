export function create(ctx) {
  const T = ctx.THREE;
  const scene = ctx.scene;
  scene.background = null;
  const world = new T.Group();
  ctx.root.add(world);
  const resources = [];
  const mat = (color, roughness = .85, extra = {}) => { const m = new T.MeshStandardMaterial({ color, roughness, ...extra }); resources.push(m); return m; };
  const concrete = mat('#dab398'), asphalt = mat('#2055a4', .78), orange = mat('#ec6b23', .43), black = mat('#24231f', .7), cream = mat('#f4dfb9'), steel = mat('#40505a', .5), yellow = mat('#d7d43d');
  function mesh(geometry, material, parent = world) { resources.push(geometry); const m = new T.Mesh(geometry, material); m.castShadow = true; m.receiveShadow = true; parent.add(m); return m; }
  function box(w,h,d,material,x=0,y=0,z=0,parent=world) { const m=mesh(new T.BoxGeometry(w,h,d),material,parent);m.position.set(x,y,z);return m; }
  function cylinder(r1,r2,h,material,x=0,y=0,z=0,parent=world,n=16) {const m=mesh(new T.CylinderGeometry(r1,r2,h,n),material,parent);m.position.set(x,y,z);return m;}
  const grainCanvas = document.createElement('canvas'); grainCanvas.width=grainCanvas.height=256;
  const gc=grainCanvas.getContext('2d');gc.fillStyle='#c5aa91';gc.fillRect(0,0,256,256);
  let seed=49071;const rand=()=>{seed=(seed*16807)%2147483647;return(seed-1)/2147483646;};
  for(let i=0;i<7000;i++){const v=Math.floor(155+rand()*80);gc.fillStyle=`rgba(${v},${v},${v},.28)`;gc.fillRect(rand()*256,rand()*256,rand()*1.5+.3,rand()*1.5+.3);}
  const grain=new T.CanvasTexture(grainCanvas);grain.wrapS=grain.wrapT=T.RepeatWrapping;grain.repeat.set(2,2);resources.push(grain);concrete.bumpMap=grain;concrete.bumpScale=.025;
  const key=new T.DirectionalLight('#fff0cd',3.2);key.position.set(-8,14,9);key.castShadow=true;key.shadow.mapSize.set(1024,1024);Object.assign(key.shadow.camera,{left:-14,right:14,top:14,bottom:-14,near:1,far:45});key.shadow.bias=-.001;key.shadow.normalBias=.05;world.add(key);
  world.add(new T.HemisphereLight('#bdd6ed','#a1765b',2));
  const ground=box(50,.2,45,concrete,0,-.55,0);ground.castShadow=false;const shadowMaterial=new T.ShadowMaterial({opacity:.22});resources.push(shadowMaterial);ground.material=shadowMaterial;
  const terrain=new T.Group();world.add(terrain);
  const rockGeo=new T.IcosahedronGeometry(1,2);resources.push(rockGeo);
  const rockMats=['#d1a081','#c28b6b','#b77e62'].map(c=>mat(c));for(const m of rockMats){m.bumpMap=grain;m.bumpScale=.07;}
  for(let i=0;i<22;i++){const rock=new T.Mesh(rockGeo,rockMats[i%3]);rock.position.set((rand()-.5)*27,-.25,(rand()-.5)*20);rock.scale.set(.3+rand()*.65,.18+rand()*.55,.25+rand()*.65);rock.rotation.set(rand(),rand()*6,rand());rock.castShadow=true;rock.receiveShadow=true;terrain.add(rock);}
  const routeDesktop=new T.Group(), routeMobile=new T.Group();world.add(routeDesktop,routeMobile);
  function road(points,width,parent) {
    const curve=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p)));const samples=curve.getPoints(96);const positions=[],indices=[];
    for(let i=0;i<samples.length;i++){const p=samples[i],t=curve.getTangent(i/(samples.length-1)),side=new T.Vector3(-t.z,0,t.x).normalize();if(side.length()<.1)side.set(1,0,0);
      positions.push(p.x-side.x*width/2,p.y,p.z-side.z*width/2,p.x+side.x*width/2,p.y,p.z+side.z*width/2);
      if(i<samples.length-1){const a=i*2;indices.push(a,a+1,a+2,a+1,a+3,a+2);}
    }
    const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(positions,3));g.setIndex(indices);g.computeVertexNormals();const r=mesh(g,asphalt,parent);
    const dashGeometry=new T.BoxGeometry(.04,.018,.2),postGeometry=new T.BoxGeometry(.035,.19,.035);resources.push(dashGeometry,postGeometry);const dashes=new T.InstancedMesh(dashGeometry,cream,25),posts=new T.InstancedMesh(postGeometry,yellow,34);parent.add(dashes,posts);const dummy=new T.Object3D();let di=0,pi=0;
    for(let i=0;i<=96;i+=4){const p=samples[i],t=curve.getTangent(i/96);dummy.position.set(p.x,p.y+.025,p.z);dummy.rotation.set(0,Math.atan2(t.x,t.z),0);dummy.updateMatrix();dashes.setMatrixAt(di++,dummy.matrix);}
    const sides=[[],[]];for(let i=0;i<=96;i+=6){const p=samples[i],t=curve.getTangent(i/96),side=new T.Vector3(-t.z,0,t.x).normalize();for(const sign of [-1,1]){dummy.position.set(p.x+side.x*width*.52*sign,p.y+.1,p.z+side.z*width*.52*sign);dummy.rotation.set(0,0,0);dummy.updateMatrix();posts.setMatrixAt(pi++,dummy.matrix);sides[sign===-1?0:1].push(new T.Vector3(dummy.position.x,p.y+.19,dummy.position.z));}}
    for(const points of sides)mesh(new T.TubeGeometry(new T.CatmullRomCurve3(points),72,.018,4,false),steel,parent);
    const wallPositions=[],wallIndices=[];for(const sign of [-1,1]){const offset=wallPositions.length/3;for(let i=0;i<samples.length;i++){const p=samples[i],t=curve.getTangent(i/(samples.length-1)),side=new T.Vector3(-t.z,0,t.x).normalize();wallPositions.push(p.x+side.x*width*.5*sign,p.y-.006,p.z+side.z*width*.5*sign,p.x+side.x*width*.5*sign,p.y-.13,p.z+side.z*width*.5*sign);if(i<samples.length-1){const j=offset+i*2;wallIndices.push(j,j+1,j+2,j+1,j+3,j+2);}}}const wallGeometry=new T.BufferGeometry();wallGeometry.setAttribute('position',new T.Float32BufferAttribute(wallPositions,3));wallGeometry.setIndex(wallIndices);wallGeometry.computeVertexNormals();mesh(wallGeometry,asphalt,parent).material.side=T.DoubleSide;
    return {curve,mesh:r};
  }
  const mainRoad=road([[-9,.1,8],[-5,.2,5],[-3,.3,2],[1,.7,3],[5,1.2,2],[4,1.7,-1],[1,2.3,-2]],1.35,routeDesktop);
  const loopPoints=[];for(let i=0;i<=20;i++){const a=i/20*Math.PI*3.8;loopPoints.push([3.7+Math.cos(a)*2.5,1.8+i*.13,-2+Math.sin(a)*1.7]);}road(loopPoints,1.15,routeDesktop);
  road([[-2,-4.8,3],[1.6,-3.4,2],[-1.6,-1.6,3],[1.5,.1,2],[-1.5,2,3],[1.4,3.8,2],[0,5.4,2]],1.0,routeMobile);
  for(let i=0;i<8;i++){const p=mainRoad.curve.getPoint(i/7);box(.24,p.y+.7,.28,concrete,p.x,(p.y-.6)/2,p.z,routeDesktop);}
  const clock=new T.Group();world.add(clock);box(6.65,2.6,.44,concrete,0,0,0,clock);box(6.18,2.14,.1,black,0,0,.27,clock);
  for(const x of [-2.2,2.2]){cylinder(.12,.14,2.9,asphalt,x,-2.4,0,clock);box(.54,.22,.7,concrete,x,-3.7,0,clock);}
  const glowMaterials=[];for(const x of [-2.4,0,2.4]){const lamp=cylinder(.22,.12,.18,black,x,1.43,.2,clock);lamp.rotation.x=.2;const glow=mesh(new T.CircleGeometry(.13,16),mat('#fff0b8',.7,{emissive:'#ffde87',emissiveIntensity:.5}),clock);glowMaterials.push(glow.material);glow.position.set(x,1.31,.25);glow.rotation.x=-Math.PI/2;}
  const clockPin=new T.Object3D();clockPin.position.set(0,-.04,.34);clock.add(clockPin);ctx.pin(ctx.dom.clock,clockPin,{width:5.92});
  const pillar=new T.Group();world.add(pillar);box(1.55,2.5,.6,concrete,0,0,0,pillar);const cap=cylinder(.59,.64,.25,orange,0,.38,.45,pillar,32);cap.rotation.x=Math.PI/2;const resetPin=new T.Object3D();resetPin.position.set(0,.38,.65);pillar.add(resetPin);ctx.pin(ctx.dom.reset,resetPin,{width:1.15});
  const tallyPin=new T.Object3D();tallyPin.position.set(0,-.73,.36);pillar.add(tallyPin);ctx.pin(ctx.dom.tally,tallyPin,{width:.95});
  for(const x of [-.4,.4])cylinder(.055,.055,1.8,steel,x,-2.1,0,pillar);
  const mounts=[];
  ctx.mounts.forEach((card,i)=>{const group=new T.Group();world.add(group);for(const x of [-1.64,1.64])box(.075,2.0,.12,cream,x,0,0,group);for(const y of [-.96,.96])box(3.35,.075,.12,cream,0,y,0,group);for(const x of [-1.1,1.1]){box(.08,1.8,.08,steel,x,-1.8,-.06,group);box(.3,.12,.3,concrete,x,-2.64,0,group);}box(3.45,.08,.19,cream,0,1,0,group);const pin=new T.Object3D();pin.position.set(0,-.04,.16);group.add(pin);ctx.pin(card,pin,{width:3.14});mounts.push(group);});
  const crane=new T.Group();world.add(crane);box(.18,6.45,.18,orange,4.7,3.2,-2.4,crane);box(5.4,.13,.15,orange,2.2,6.4,-2.4,crane);for(let i=0;i<12;i++){const b=box(.055,.7,.055,orange,4.7,i*.55,-2.4,crane);b.rotation.z=Math.PI/4;}
  const roll=new T.Group();roll.position.set(3.25,5.55,-2.4);crane.add(roll);const drum=cylinder(.44,.44,1.25,asphalt,0,0,0,roll,32);drum.rotation.z=Math.PI/2;const inner=cylinder(.19,.19,1.27,black,0,0,0,roll);inner.rotation.z=Math.PI/2;
  for(const x of [-.43,.43]){const cable=box(.016,.9,.016,steel,roll.position.x+x,6.0,-2.4,crane);cable.castShadow=false;}
  const stripCurve=new T.CatmullRomCurve3([[3.25,5.11,-2.4],[3.28,4.74,-2.25],[4.36,4.42,-2.55],loopPoints.at(-1)].map(p=>new T.Vector3(...p)));
  const stripGeometry=new T.BufferGeometry(),stripPositions=new Float32Array(49*6),stripIndices=[];stripGeometry.setAttribute('position',new T.BufferAttribute(stripPositions,3));for(let i=0;i<48;i++){const a=i*2;stripIndices.push(a,a+1,a+2,a+1,a+3,a+2);}stripGeometry.setIndex(stripIndices);const stripMaterial=asphalt.clone();stripMaterial.side=T.DoubleSide;resources.push(stripMaterial);const strip=mesh(stripGeometry,stripMaterial,crane);
  const stripDashGeometry=new T.BoxGeometry(.045,.025,.18);resources.push(stripDashGeometry);const stripDashes=new T.InstancedMesh(stripDashGeometry,cream,9);crane.add(stripDashes);const stripDummy=new T.Object3D(),stripPoint=new T.Vector3(),stripTangent=new T.Vector3(),stripSide=new T.Vector3(),stripAhead=new T.Vector3(),stripY=new T.Vector3(0,0,1);
  function ribbonPoint(u,flex,target){stripCurve.getPoint(u,target);const envelope=Math.sin(Math.PI*u);target.y-=flex*envelope*.13;target.z+=flex*envelope*.2;return target;}
  function setRibbon(flex){for(let i=0;i<49;i++){const u=i/48;ribbonPoint(u,flex,stripPoint);ribbonPoint(Math.min(1,u+.002),flex,stripAhead);if(i===48){ribbonPoint(u-.002,flex,stripAhead);stripTangent.subVectors(stripPoint,stripAhead);}else stripTangent.subVectors(stripAhead,stripPoint);stripTangent.normalize();stripSide.set(-stripTangent.z,0,stripTangent.x).normalize();stripPositions.set([stripPoint.x-stripSide.x*.625,stripPoint.y,stripPoint.z-stripSide.z*.625,stripPoint.x+stripSide.x*.625,stripPoint.y,stripPoint.z+stripSide.z*.625],i*6);}stripGeometry.attributes.position.needsUpdate=true;stripGeometry.computeVertexNormals();for(let i=0;i<9;i++){const u=(i+.5)/9;ribbonPoint(u,flex,stripPoint);ribbonPoint(Math.min(1,u+.002),flex,stripAhead);stripTangent.subVectors(stripAhead,stripPoint).normalize();stripDummy.position.copy(stripPoint);stripDummy.position.z+=.017;stripDummy.quaternion.setFromUnitVectors(stripY,stripTangent);stripDummy.updateMatrix();stripDashes.setMatrixAt(i,stripDummy.matrix);}stripDashes.instanceMatrix.needsUpdate=true;}
  setRibbon(0);let ribbonFlex=0;
  const crownPin=new T.Object3D();crownPin.position.set(.59,-.15,.4);roll.add(crownPin);ctx.pin(ctx.dom.secretButton,crownPin,{width:.32});
  const crownShape=new T.Shape();crownShape.moveTo(-.13,-.06);crownShape.lineTo(-.16,.09);crownShape.lineTo(-.06,.04);crownShape.lineTo(0,.16);crownShape.lineTo(.06,.04);crownShape.lineTo(.16,.09);crownShape.lineTo(.13,-.06);crownShape.closePath();const crown=mesh(new T.ShapeGeometry(crownShape),yellow,roll);crown.position.set(.57,-.16,.34);crown.visible=false;
  function truck() {const g=new T.Group();box(.65,.18,.35,orange,0,.16,0,g);box(.22,.35,.32,orange,.2,.3,0,g);box(.03,.12,.28,black,.32,.4,0,g);for(const x of [-.22,.21])for(const z of [-.18,.18]){const w=cylinder(.095,.095,.04,black,x,.08,z,g,10);w.rotation.x=Math.PI/2;}return g;}
  const roller=new T.Group();world.add(roller);roller.position.set(-5.2,.2,6.2);box(.85,.26,.55,orange,0,.25,0,roller);box(.27,.37,.4,orange,.15,.52,0,roller);box(.36,.035,.49,black,.15,.77,0,roller);for(const x of [.015,.285])for(const z of [-.21,.21])box(.025,.29,.025,black,x,.61,z,roller);const rollerDrum=cylinder(.28,.28,.62,steel,-.39,.2,0,roller,24);rollerDrum.rotation.x=Math.PI/2;for(const z of [-.29,.29]){const wheel=cylinder(.17,.17,.055,black,.34,.16,z,roller,16);wheel.rotation.x=Math.PI/2;}
  const movingTruck=truck();world.add(movingTruck);for(let i=0;i<3;i++){const g=truck();g.position.set(-5+i*3.5,.13,-1.5-i);g.rotation.y=i*.8;world.add(g);}
  let elapsed=99, remoteTime=99, pending=false, freeze=false, rollLift=0, rollTarget=0;
  ctx.on(ctx.dom.secretButton,'pointerenter',()=>{rollTarget=.25;ctx.wake();});ctx.on(ctx.dom.secretButton,'focus',()=>{rollTarget=.25;ctx.wake();});ctx.on(ctx.dom.secretButton,'pointerleave',()=>{rollTarget=0;ctx.wake();});ctx.on(ctx.dom.secretButton,'blur',()=>{rollTarget=0;ctx.wake();});
  const ray=new T.Raycaster(), pointer=new T.Vector2();let draggingRoll=false;
  ctx.on(ctx.canvas,'pointerdown',e=>{const b=ctx.canvas.getBoundingClientRect();pointer.set((e.clientX-b.left)/b.width*2-1,-((e.clientY-b.top)/b.height)*2+1);ray.setFromCamera(pointer,ctx.camera);if(ray.intersectObject(drum,false).length){draggingRoll=true;ctx.canvas.setPointerCapture(e.pointerId);rollTarget=.25;ctx.wake();}});
  ctx.on(ctx.canvas,'pointermove',e=>{if(draggingRoll){const b=ctx.canvas.getBoundingClientRect();rollTarget=Math.min(.35,Math.max(.05,(e.clientX-b.left)/b.width*.4));ctx.wake();}});
  for(const event of ['pointerup','pointercancel'])ctx.on(ctx.canvas,event,()=>{draggingRoll=false;rollTarget=0;ctx.wake();});
  let mobile=false;
  function resize(){mobile=ctx.mobile;const w=Math.max(1,ctx.stage.clientWidth),h=Math.max(1,ctx.stage.clientHeight),span=mobile?3.65*h/w:5.75,yAt=p=>1.1+(.5-p)*h/(w/7.3);routeDesktop.visible=!mobile;routeMobile.visible=mobile;routeMobile.scale.y=mobile?span/9.5:1;terrain.visible=!mobile;roller.visible=!mobile;ground.position.y=mobile?yAt(.96)-.5:-.55;clock.position.set(mobile?0:-3.5,mobile?yAt(.18):4.85,mobile?1.1:.4);clock.scale.setScalar(mobile?1:1.28);ctx.pin(ctx.dom.clock,clockPin,{width:5.92*(mobile?1:1.28)});pillar.position.set(mobile?1.35:1.8,mobile?yAt(.29):4.42,mobile?2.7:1.3);crane.position.set(mobile?-2.6:0,mobile?yAt(.34)-5.55*.63:0,mobile?2:0);crane.scale.setScalar(mobile?.63:1);
    const positions=mobile?[[0,yAt(.45),4],[0,yAt(.63),4],[0,yAt(.81),4]]:[[-5.15,1.0,4.2],[4.8,3.15,.1],[.9,1.05,4.1]];
    mounts.forEach((g,i)=>{g.position.set(...positions[i]);g.scale.setScalar(mobile?1.84:1.22);ctx.pin(ctx.mounts[i],g.children.find(o=>o.type==='Object3D'),{width:3.14*(mobile?1.84:1.22)});});
    ctx.fitCamera(span,[0,mobile?1.1:2.0,0],[0,mobile?3.1:8.7,23]);ctx.wake();
  }
  ctx.on(document,'visibilitychange',()=>{if(document.hidden){elapsed=99;remoteTime=99;draggingRoll=false;rollTarget=0;}});
  resize();
  return {resize,celebrate(){elapsed=document.hidden||freeze?99:0;ctx.wake();},pending(value){pending=value;ctx.wake();},overlay(value){freeze=value;},remote(){remoteTime=0;ctx.wake();},animate(time,dt){if(freeze)return;elapsed+=dt;remoteTime+=dt;const reduced=ctx.reduced;for(const m of glowMaterials)m.emissiveIntensity=.5+(reduced?0:remoteTime<.6?Math.sin(remoteTime/.6*Math.PI)*.35:0);const press=pending?.15:elapsed<.25?.15*(1-elapsed/.25):0;cap.position.z=.45-press;rollLift=reduced?rollTarget:rollLift+(rollTarget-rollLift)*Math.min(1,dt*10);crown.visible=rollLift>.035;roll.rotation.x=rollLift;
      const active=!reduced&&elapsed>=.14&&elapsed<1.9;drum.rotation.x=active?-(elapsed-.14)*1.5:0;const flex=active?Math.sin((elapsed-.14)/1.76*Math.PI):0;if(Math.abs(flex-ribbonFlex)>.0001){ribbonFlex=flex;setRibbon(flex);}
      movingTruck.visible=!reduced&&elapsed>1.8&&elapsed<4.0&&!mobile;if(movingTruck.visible){const p=mainRoad.curve.getPoint(Math.min(1,.58+(elapsed-1.8)*.12));movingTruck.position.copy(p);movingTruck.position.y+=.025;const t=mainRoad.curve.getTangent(Math.min(1,.58+(elapsed-1.8)*.12));movingTruck.rotation.y=Math.atan2(t.x,t.z);}
    },dispose(){for(const r of resources)r.dispose?.();for(const el of [ctx.dom.clock,ctx.dom.reset,ctx.dom.tally,ctx.dom.secretButton,...ctx.mounts])ctx.unpin(el);}};
}
