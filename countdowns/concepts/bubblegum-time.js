// One elastic object holds the real clock and actual archive prints.
export function create(ctx) {
  const T = ctx.THREE;
  const group = new T.Group(); ctx.root.add(group);
  ctx.scene.background = new T.Color(0xd6eac9);
  ctx.renderer.setClearColor(0xd6eac9, 0);
  ctx.renderer.toneMappingExposure = 1.02;
  ctx.renderer.shadowMap.type=T.VSMShadowMap;
  const hemi = new T.HemisphereLight(0xe7f5dd, 0x506347, .70);
  const key = new T.DirectionalLight(0xfff7ed, 3.0); key.position.set(-5, 8, 10);
  key.castShadow=true;key.shadow.mapSize.set(ctx.mobile?1024:2048,ctx.mobile?1024:2048);
  Object.assign(key.shadow.camera,{left:-12,right:12,top:10,bottom:-10,near:.1,far:35});
  key.shadow.normalBias=.03;key.shadow.bias=-.00015;key.shadow.radius=6;key.shadow.blurSamples=10;
  const rim = new T.DirectionalLight(0xffc7dc, 1.15); rim.position.set(7, 4, -3);
  ctx.root.add(hemi,key,rim);
  const sweep=new T.Mesh(new T.PlaneGeometry(60,60),new T.ShadowMaterial({color:0x566149,opacity:.16}));
  sweep.position.z=-2.8;sweep.receiveShadow=true;ctx.root.add(sweep);
  // Separate white softboxes and dark gaps produce readable, stretched reflections.
  const studio=document.createElement('canvas');studio.width=512;studio.height=256;
  const studioDraw=studio.getContext('2d');studioDraw.fillStyle='#333b31';studioDraw.fillRect(0,0,512,256);
  const softbox=(x,y,w,h,color)=>{const gradient=studioDraw.createLinearGradient(x,0,x+w,0);gradient.addColorStop(0,'#333b31');gradient.addColorStop(.10,color);gradient.addColorStop(.9,color);gradient.addColorStop(1,'#333b31');studioDraw.fillStyle=gradient;studioDraw.fillRect(x,y,w,h);};
  softbox(90,33,47,161,'#fffdf5');softbox(213,42,178,20,'#ffffff');softbox(353,61,44,134,'#ffffff');softbox(437,82,25,98,'#ffd4e5');
  const source=new T.CanvasTexture(studio);source.colorSpace=T.SRGBColorSpace;source.mapping=T.EquirectangularReflectionMapping;
  const pmrem=new T.PMREMGenerator(ctx.renderer);const environment=pmrem.fromEquirectangular(source);pmrem.dispose();source.dispose();
  ctx.scene.environment=environment.texture;
  const surface=document.createElement('canvas');surface.width=surface.height=256;const surfaceDraw=surface.getContext('2d');
  const grain=surfaceDraw.createImageData(256,256);
  for(let y=0;y<256;y++)for(let x=0;x<256;x++){const i=(y*256+x)*4,hash=Math.sin(x*12.9898+y*78.233)*43758.5453;
    const line=Math.sin(y*.24+x*.018+Math.sin(x*.047)*1.7),v=168+line*15+(hash-Math.floor(hash)-.5)*16;
    grain.data[i]=grain.data[i+1]=grain.data[i+2]=v;grain.data[i+3]=255;}
  surfaceDraw.putImageData(grain,0,0);const gumDetail=new T.CanvasTexture(surface);gumDetail.wrapS=gumDetail.wrapT=T.RepeatWrapping;gumDetail.repeat.set(2,2);
  const gum = new T.MeshPhysicalMaterial({color:0xf372ac,roughness:.20,metalness:0,clearcoat:.95,clearcoatRoughness:.10,
    bumpMap:gumDetail,bumpScale:.026,roughnessMap:gumDetail,ior:1.42,transmission:.12,thickness:.65,attenuationColor:0xff8dbb,attenuationDistance:3.2,envMapIntensity:1.35});
  const thinGum=gum.clone();thinGum.transmission=.20;thinGum.thickness=.32;thinGum.roughness=.15;thinGum.envMapIntensity=1.2;
  const pale = new T.MeshPhysicalMaterial({color:0xf1ebd8, roughness:.32, clearcoat:.5});
  const metal = new T.MeshStandardMaterial({color:0xb9beb0, metalness:.85, roughness:.22});
  const gold = new T.MeshStandardMaterial({color:0xecc871, metalness:.65, roughness:.26});
  const tube = (points,radius,material=gum,segments=48) => {
    const path = new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p)));
    const mesh = new T.Mesh(new T.TubeGeometry(path,segments,radius,12,false),material);mesh.castShadow=true;mesh.receiveShadow=true;
    group.add(mesh); return mesh;
  };
  function roundPath(path,x,y,w,h,r) {
    path.moveTo(x+r,y); path.lineTo(x+w-r,y); path.quadraticCurveTo(x+w,y,x+w,y+r);
    path.lineTo(x+w,y+h-r); path.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
    path.lineTo(x+r,y+h); path.quadraticCurveTo(x,y+h,x,y+h-r);
    path.lineTo(x,y+r); path.quadraticCurveTo(x,y,x+r,y);
  }
  const shape = new T.Shape();
  shape.moveTo(-7.2,.15);shape.bezierCurveTo(-6.9,.25,-6.4,.65,-5.9,.97);
  shape.bezierCurveTo(-5.35,1.67,-4.1,1.50,-3.2,1.23);shape.bezierCurveTo(-2.75,1.54,-1.65,1.65,-.80,1.30);
  shape.bezierCurveTo(-.25,1.48,.80,1.58,1.70,1.28);shape.bezierCurveTo(2.25,1.50,3.60,1.55,4.60,1.43);
  shape.bezierCurveTo(5.3,1.70,5.7,2.4,6.4,2.45);shape.bezierCurveTo(6.9,2.2,6.7,1.2,7.10,.7);
  shape.bezierCurveTo(7.4,.3,6.85,-.82,6.3,-1.01);shape.bezierCurveTo(5.7,-1.51,4.22,-1.49,3.65,-1.3);
  shape.bezierCurveTo(2.88,-1.1,1.92,-1.64,1.08,-1.37);shape.bezierCurveTo(.4,-1.05,-.84,-1.63,-1.95,-1.39);
  shape.bezierCurveTo(-2.72,-1.18,-4.25,-1.63,-5.31,-1.36);shape.bezierCurveTo(-6.4,-1.06,-6.27,-.11,-7.2,.15);
  for (const x of [-4.8,-2.05,.7,3.45]) {
    const hole = new T.Path(); roundPath(hole,x,-.91,2.2,1.95,.3); shape.holes.push(hole);
  }
  const rawRibbon=new T.ExtrudeGeometry(shape,{depth:.32,bevelEnabled:true,bevelSize:.19,bevelThickness:.27,bevelSegments:6,curveSegments:22});
  // Subdivide only large cap triangles, then smooth coincident normals after sculpting.
  let positions=Array.from(rawRibbon.attributes.position.array),uvs=Array.from(rawRibbon.attributes.uv.array);
  for(let round=0;round<3;round++){const next=[],nextUV=[];
    for(let i=0;i<positions.length;i+=9){const a=positions.slice(i,i+3),b=positions.slice(i+3,i+6),c=positions.slice(i+6,i+9),j=i/3*2;
      const au=uvs.slice(j,j+2),bu=uvs.slice(j+2,j+4),cu=uvs.slice(j+4,j+6),distance=(p,q)=>Math.hypot(p[0]-q[0],p[1]-q[1],p[2]-q[2]);
      if(Math.max(distance(a,b),distance(b,c),distance(c,a))>.65){const mid=(p,q)=>p.map((v,k)=>(v+q[k])/2),ab=mid(a,b),bc=mid(b,c),ca=mid(c,a),abu=mid(au,bu),bcu=mid(bu,cu),cau=mid(cu,au);
        for(const tri of [[a,ab,ca],[ab,b,bc],[ca,bc,c],[ab,bc,ca]])next.push(...tri.flat());
        for(const tri of [[au,abu,cau],[abu,bu,bcu],[cau,bcu,cu],[abu,bcu,cau]])nextUV.push(...tri.flat());
      }else{next.push(...a,...b,...c);nextUV.push(...au,...bu,...cu);}}
    positions=next;uvs=nextUV;}
  rawRibbon.dispose();const ribbonGeometry=new T.BufferGeometry();ribbonGeometry.setAttribute('position',new T.Float32BufferAttribute(positions,3));ribbonGeometry.setAttribute('uv',new T.Float32BufferAttribute(uvs,2));
  const welds=new Map();for(let i=0;i<positions.length;i+=3){const key=`${Math.round(positions[i]*10000)},${Math.round(positions[i+1]*10000)},${Math.round(positions[i+2]*10000)}`;const indices=welds.get(key)||[];indices.push(i);welds.set(key,indices);}
  const normalGroups=Array.from(welds.values());
  const smoothRibbon=()=>{ribbonGeometry.computeVertexNormals();const n=ribbonGeometry.attributes.normal.array;
    for(const indices of normalGroups){let x=0,y=0,z=0;for(const i of indices){x+=n[i];y+=n[i+1];z+=n[i+2];}const length=Math.hypot(x,y,z)||1;
      for(const i of indices){n[i]=x/length;n[i+1]=y/length;n[i+2]=z/length;}}ribbonGeometry.attributes.normal.needsUpdate=true;};
  const ribbon = new T.Mesh(ribbonGeometry,gum);
  ribbon.position.set(0,.05,0); ribbon.rotation.z=.095;ribbon.castShadow=true;ribbon.receiveShadow=true; group.add(ribbon);
  const sculpt=ribbonGeometry.attributes.position.array;
  for(let i=0;i<sculpt.length;i+=3){const x=sculpt[i],y=sculpt[i+1];
    const band=Math.max(0,1-Math.abs(y)/1.8);
    sculpt[i+2]+=.16*band+.065*Math.sin(x*.82+y*1.7)+.015*Math.cos(x*3.4-y*2.2);}
  smoothRibbon();
  const ribbonBase = ribbon.geometry.attributes.position.array.slice();
  const balloon = new T.Mesh(new T.SphereGeometry(1,72,48),thinGum);
  // Even at the 12% breath peak, the balloon front stays behind every drum.
  balloon.position.set(6.25,3.2,-2.8); balloon.scale.set(3.75,4.1,2.35);balloon.castShadow=true;balloon.receiveShadow=true;group.add(balloon);
  const balloonVertices=balloon.geometry.attributes.position.array;
  for(let i=0;i<balloonVertices.length;i+=3){const x=balloonVertices[i],y=balloonVertices[i+1],z=balloonVertices[i+2];
    const radial=1+.012*Math.sin(x*7+y*4)*Math.sin(z*6-y*2);balloonVertices[i]*=radial;balloonVertices[i+1]*=radial;balloonVertices[i+2]*=radial;}
  balloon.geometry.computeVertexNormals();
  // Pulled folds meet the belt rather than hovering like independent ropes.
  const folds=new T.Group();group.add(folds);
  const fold=(points,radius)=>{const mesh=tube(points,radius);group.remove(mesh);folds.add(mesh);return mesh;};
  for(const [index,x] of [-3.7,-.95,1.8,4.55].entries()){
    if(index%2===0)fold([[x-1.18,-.7,.48],[x-1.25,.3,.55],[x-.86,1.20,.50],[x+.05,1.30,.40]],.035);
    fold([[x-1.09,-1.03,.39],[x-.40,-1.22,.48],[x+.45,-1.18,.47],[x+1.10,-.98,.40]],.023+index*.003);
  }
  for(let i=0;i<3;i++)fold([[4.2+i*.17,1.15,.52],[5.05+i*.13,1.72,.78],[5.61+i*.18,2.12,.58],[5.76+i*.2,2.7,.32]],.026+i*.004);
  for(const side of [-1,1])for(let i=0;i<3;i++)fold([[side*6.9,side<0?.35:-.18,.48],[side*(6.1-i*.1),.20+(i-1.5)*.16,.70],[side*5.2,-.05+(i-1.5)*.21,.50]],.014+i*.004);
  // Gather outside the last aperture; the old neck began inside its reading face.
  tube([[5.50,2.14,.12],[5.96,2.35,-.15],[6.3,2.85,-.6]],.37);
  const tethers = [
    [[-6.8,.6,-.1],[-7.8,2.9,-.4],[-6.6,4.7,-.7]],
    [[-.8,1.4,-.5],[-1.2,3.5,-.3],[1.6,4.5,-.2]],
    [[6.3,-.5,.1],[5.9,-2,.2],[6.8,-3.9,-.2]],
    [[-1.6,-1.3,-.1],[-.4,-3.1,-.1],[1.4,-4.5,-.3]]
  ].map(points=>tube(points,.1));
  const pins = [];
  for (const p of [[-7.1,.3,.7],[6.7,-.1,.7]]) {
    const pin=new T.Group(); const stem=new T.Mesh(new T.CylinderGeometry(.095,.095,.65,16),metal);
    const head=new T.Mesh(new T.SphereGeometry(.23,20,12),metal); head.scale.set(1,.35,1); head.position.y=.33;
    pin.add(stem,head);pin.position.set(...p);pin.rotation.z=-.4;pin.traverse(o=>{if(o.isMesh)o.castShadow=true;});group.add(pin);pins.push(pin);
  }
  const droplets=[];
  for(let i=0;i<13;i++) {
    const d=new T.Mesh(new T.SphereGeometry(.09+(i%3)*.035,20,14),thinGum);
    const x=-7+(i*1.137)%14,y=-4.7+(i*1.71)%8.7;
    d.position.set(x,y,-.45);d.castShadow=true;d.scale.y=i%3===0?1.8:1;group.add(d);droplets.push({mesh:d,x,y});
  }
  const crown=new T.Group();
  const band=new T.Mesh(new T.TorusGeometry(.19,.045,7,24),gold);band.rotation.x=Math.PI/2;crown.add(band);
  for(let i=0;i<3;i++){const tooth=new T.Mesh(new T.ConeGeometry(.075,.24,4),gold);tooth.position.set((i-1)*.14,.13,0);crown.add(tooth);}
  crown.position.set(1.4,-3.4,.5); crown.rotation.z=-.1; group.add(crown);ctx.pin(ctx.dom.secretButton,crown,{width:.62});
  const curl=tube([[1.05,-3.55,.1],[1.25,-3.28,.5],[1.6,-3.35,.55],[1.65,-3.65,.05]],.14);
  // Curved physical cotton-paper mounts surround the genuine DOM image centres.
  const paperCanvas=document.createElement('canvas');paperCanvas.width=paperCanvas.height=192;
  const paperDraw=paperCanvas.getContext('2d');paperDraw.fillStyle='#f1ebd8';paperDraw.fillRect(0,0,192,192);
  for(let i=0;i<3300;i++){const h=Math.sin(i*98.71)*43758.5,f=h-Math.floor(h);paperDraw.strokeStyle=i%3?'#d8d1ba30':'#fffef075';paperDraw.lineWidth=.3;
    const x=f*192,y=((i*67)%192);paperDraw.beginPath();paperDraw.moveTo(x,y);paperDraw.lineTo(x+2+(i%5),y+.5);paperDraw.stroke();}
  const paperTexture=new T.CanvasTexture(paperCanvas);paperTexture.colorSpace=T.SRGBColorSpace;paperTexture.wrapS=paperTexture.wrapT=T.RepeatWrapping;paperTexture.repeat.set(3,3);
  const paperMaterial=new T.MeshStandardMaterial({color:0xffffff,map:paperTexture,bumpMap:paperTexture,bumpScale:.009,roughness:.93,side:T.DoubleSide});
  const paperMounts=ctx.mounts.map(card=>{const mesh=new T.Mesh(new T.PlaneGeometry(1,1,18,16),paperMaterial);mesh.castShadow=true;mesh.receiveShadow=true;ctx.root.add(mesh);
    const base=mesh.geometry.attributes.position.array.slice();return{card,mesh,base};});
  function fitPaper(){const stage=ctx.stage.getBoundingClientRect(),span=ctx.mobile?6.6:5.5,unit=2*span/stage.height;
    for(const paper of paperMounts){const r=paper.card.getBoundingClientRect(),matrix=getComputedStyle(paper.card).transform;
      const angle=matrix==='none'?0:Math.atan2(new DOMMatrixReadOnly(matrix).b,new DOMMatrixReadOnly(matrix).a);
      const width=paper.card.offsetWidth*unit,height=paper.card.offsetHeight*unit;
      paper.mesh.position.set((r.left+r.width/2-stage.left-stage.width/2)*unit,(stage.height/2-(r.top+r.height/2-stage.top))*unit,1.1);
      paper.mesh.rotation.z=-angle;const arr=paper.mesh.geometry.attributes.position.array;
      for(let i=0;i<arr.length;i+=3){const x=paper.base[i],y=paper.base[i+1];arr[i]=x*width;arr[i+1]=y*height;
        const corner=Math.max(0,(x+.5)*.9+(-y+.5)*1.2-1.42),edge=Math.max(0,(-y-.22));
        arr[i+2]=corner*corner*2.2+edge*edge*.4;}
      paper.mesh.geometry.attributes.position.needsUpdate=true;paper.mesh.geometry.computeVertexNormals();}
  }
  let frozen=false,focused=false,drag=0,secretFocus=false,dragStart=null,dragging=false,deforming=false;
  const pointerPoint=new T.Vector3();
  ctx.on(ctx.canvas,'pointerdown',e=>{dragStart={x:e.clientX,y:e.clientY,type:e.pointerType};dragging=false;});
  ctx.on(ctx.canvas,'pointermove',e=>{if(!dragStart)return;const dx=e.clientX-dragStart.x,dy=e.clientY-dragStart.y;
    dragging=Math.hypot(dx,dy)>=6&&(dragStart.type==='mouse'||Math.abs(dx)>Math.abs(dy));});
  for(const event of ['pointerup','pointercancel','pointerleave'])ctx.on(ctx.canvas,event,()=>{dragStart=null;dragging=false;ctx.wake();});
  const setFocus = e => { focused=!!e.target.closest?.('.card,.art-secret-trigger'); ctx.wake(); };
  ctx.on(ctx.hero,'focusin',setFocus);ctx.on(ctx.hero,'focusout',()=>{focused=false;ctx.wake();});
  ctx.on(ctx.dom.secretButton,'pointerenter',()=>{secretFocus=true;ctx.wake();});
  ctx.on(ctx.dom.secretButton,'pointerleave',()=>{secretFocus=false;ctx.wake();});
  ctx.on(ctx.dom.secretButton,'focus',()=>{secretFocus=true;ctx.wake();});
  ctx.on(ctx.dom.secretButton,'blur',()=>{secretFocus=false;ctx.wake();});
  const drumAnchors=[-3.7,-.95,1.8,4.55].map(x=>{const anchor=new T.Object3D();anchor.position.set(x,.065,.80);ribbon.add(anchor);return anchor;});
  for(const anchor of drumAnchors){
    const drum=new T.Mesh(new T.CylinderGeometry(.96,.96,1.98,48),pale);drum.rotation.z=Math.PI/2;drum.position.z=-1.10;drum.castShadow=true;drum.receiveShadow=true;anchor.add(drum);
    const seamMaterial=new T.MeshStandardMaterial({color:0x909b80,roughness:.53,transparent:true,opacity:.24});
    const seam=new T.Mesh(new T.CylinderGeometry(.965,.965,.013,48,1,true),seamMaterial);seam.rotation.z=Math.PI/2;seam.position.z=-1.10;anchor.add(seam);
    for(const side of [-1,1]){const rim=new T.Mesh(new T.TorusGeometry(.955,.021,8,48),metal);rim.rotation.y=Math.PI/2;rim.position.set(side*.975,0,-1.10);anchor.add(rim);}
  }
  const clockUnits=Array.from(ctx.dom.clock.querySelectorAll('.clock-unit'));
  const resize=()=>{ctx.fitCamera(ctx.mobile?6.6:5.5,[0,0,0],[0,0,18]);
    const narrow=ctx.mobile&&ctx.stage.clientWidth<=360;
    group.scale.set(ctx.mobile?(narrow?.34:.37):1,ctx.mobile?.51:1,ctx.mobile?.51:1);group.position.set(ctx.mobile?-.10:0,ctx.mobile?1.4:0,0);
    for(let i=0;i<4;i++)ctx.pin(clockUnits[i],drumAnchors[i],{width:ctx.mobile?(narrow?.665:.725):1.98});
    crown.position.set(ctx.mobile?3.4:2.5,ctx.mobile?-3.4:-2.4,.5);
    curl.position.set(crown.position.x-1.4,crown.position.y+3.4,0);fitPaper();};
  resize();
  return {
    resize,overlay(value){frozen=value;},dispose(){environment.dispose();},
    animate(time,dt){
      if(frozen)return;fitPaper();
      const moving=!ctx.reduced&&!focused;
      const age=Number.isFinite(ctx.burst)?ctx.burst:99,remote=ctx.remoteAge;
      let breath=0;
      if(!ctx.reduced&&age<1.8){const p=age<.65?Math.max(0,(age-.08)/.57):1-(age-.65)/1.15;const bounded=Math.max(0,Math.min(1,p));breath=bounded*bounded*(3-2*bounded)*.12;}
      else if(!ctx.reduced&&remote<.45)breath=Math.sin(remote/.45*Math.PI)*.02;
      balloon.scale.set(3.75*(1+breath),4.1*(1+breath),2.35*(1+breath));
      const target=moving&&ctx.pointer.down&&dragging?1:0;drag+=(target-drag)*Math.min(1,dt*7);
      const arr=ribbon.geometry.attributes.position.array;
      pointerPoint.set(ctx.pointer.x,ctx.pointer.y,0).unproject(ctx.camera);ribbon.worldToLocal(pointerPoint);
      const px=pointerPoint.x,py=pointerPoint.y;
      const needsDeform=(moving&&ctx.pointer.active)||breath>0||drag>.001;
      if(needsDeform||deforming){for(let i=0;i<arr.length;i+=3){const x=ribbonBase[i],y=ribbonBase[i+1];
          const influence=moving&&ctx.pointer.active?Math.exp(-((x-px)**2+(y-py)**2)*.38):0;
          arr[i+1]=y+influence*drag*.18+breath*Math.sin(x*.75-age*5)*.48;
          arr[i+2]=ribbonBase[i+2]+influence*(ctx.pointer.down?.18:.065);
        }
        ribbon.geometry.attributes.position.needsUpdate=true;
        smoothRibbon();
      }
      deforming=needsDeform;
      curl.rotation.x=secretFocus?.22:0;crown.rotation.z=-.1+(secretFocus?.07:0);
      for(const d of droplets)d.mesh.position.y=d.y+(moving?Math.sin(time*.55+d.x)*.035:0);
    }
  };
}
